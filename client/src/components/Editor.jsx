import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// Base64 helper functions for safe HTML encoding/decoding in attributes
const encodeHtml = (str) => {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        return str;
    }
};

const decodeHtml = (str) => {
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch (e) {
        return str;
    }
};

// Register custom HTML embed blot to make custom HTML blocks non-editable inside the editor
const BlockEmbed = Quill.import('blots/block/embed');

class CustomHtmlBlot extends BlockEmbed {
    static create(value) {
        const node = super.create();
        const encoded = encodeHtml(value);
        node.setAttribute('data-custom-html', encoded);
        node.setAttribute('contenteditable', 'false');
        node.innerHTML = value;
        return node;
    }

    static value(node) {
        const attrVal = node.getAttribute('data-custom-html');
        return attrVal ? decodeHtml(attrVal) : node.innerHTML;
    }
}
CustomHtmlBlot.blotName = 'custom-html';
CustomHtmlBlot.tagName = 'div';
CustomHtmlBlot.className = 'custom-html-block';

Quill.register(CustomHtmlBlot);

export default function Editor({ props }) {
    const { initialData, onChange } = props;
    const containerRef = useRef(null);
    const quillRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear existing elements to avoid duplicate toolbars and editors in React 18 StrictMode
        containerRef.current.innerHTML = '';

        // Create an inner editor element
        const editorEl = document.createElement('div');
        // Set min-height on the editor container so it's tall and fits nicely
        editorEl.style.minHeight = '300px';
        containerRef.current.appendChild(editorEl);

        // Initialize Quill instance on the inner editor element
        const quill = new Quill(editorEl, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }],
                        [{ 'align': [] }],
                        ['link', 'image', 'video', 'custom-html'],
                        ['clean']
                    ],
                    handlers: {
                        'custom-html': function() {
                            const html = prompt("Enter custom HTML to insert:");
                            if (html) {
                                const range = this.quill.getSelection();
                                if (range) {
                                    this.quill.insertEmbed(range.index, 'custom-html', html, 'user');
                                    this.quill.setSelection(range.index + 1, 'user');
                                } else {
                                    this.quill.insertEmbed(this.quill.getLength(), 'custom-html', html, 'user');
                                }
                            }
                        }
                    }
                }
            }
        });

        quillRef.current = quill;

        // Add custom icon for custom-html button
        const customHtmlButton = containerRef.current.querySelector('.ql-custom-html');
        if (customHtmlButton) {
            customHtmlButton.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><polyline class="ql-stroke" points="16 18 22 12 16 6"></polyline><polyline class="ql-stroke" points="8 6 2 12 8 18"></polyline></svg>`;
            customHtmlButton.title = "Insert Custom HTML";
        }

        // If there was initialData already, set it
        if (initialData) {
            quill.root.innerHTML = initialData;
        }

        // Handle text-change events and invoke onChange
        quill.on('text-change', () => {
            if (onChange) {
                const html = quill.root.innerHTML;
                // Mocking the event and the editor object to compatible format with CKEditor
                onChange(null, {
                    getData: () => html
                });
            }
        });

        return () => {
            quill.off('text-change');
            quillRef.current = null;
        };
    }, []);

    // Sync initialData changes when it loads asynchronously
    useEffect(() => {
        if (quillRef.current && initialData && quillRef.current.root.innerHTML !== initialData) {
            // Check if it's currently empty or has different text before overwriting to avoid losing cursor position
            if (quillRef.current.root.innerHTML === '<p><br></p>' || quillRef.current.root.innerHTML === '') {
                quillRef.current.root.innerHTML = initialData;
            }
        }
    }, [initialData]);

    return (
        <div ref={containerRef} className="bg-background rounded-md" />
    );
}
