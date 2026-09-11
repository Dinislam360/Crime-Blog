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

// Extend the default image blot so the chosen size ("small" | "medium" | "large")
// and position ("left" | "center" | "right") travel as data-size / data-align
// attributes through the delta and survive save/reload.
const ImageBlot = Quill.import('formats/image');

const IMAGE_OPTION_ATTRIBUTES = ['data-size', 'data-align'];

class SizeableImageBlot extends ImageBlot {
    static formats(domNode) {
        const formats = super.formats(domNode);
        IMAGE_OPTION_ATTRIBUTES.forEach((attr) => {
            const value = domNode.getAttribute(attr);
            if (value) {
                formats[attr] = value;
            }
        });
        return formats;
    }

    format(name, value) {
        if (IMAGE_OPTION_ATTRIBUTES.includes(name)) {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}

Quill.register(SizeableImageBlot, true);

// Size and position options offered when inserting an image into the editor
const IMAGE_SIZES = [
    { key: 'small', label: 'Small', hint: '35% width' },
    { key: 'medium', label: 'Medium', hint: '65% width' },
    { key: 'large', label: 'Large', hint: '100% width' },
];

const IMAGE_POSITIONS = [
    { key: 'left', label: 'Left', hint: 'Float left' },
    { key: 'center', label: 'Center', hint: 'Centered' },
    { key: 'right', label: 'Right', hint: 'Float right' },
];

// Opens an overlay to pick the image size + position, then calls
// onPick({ size, align }).
function showImageInsertPicker(dataUrl, onPick) {
    let selectedSize = 'medium';
    let selectedAlign = 'center';

    const overlay = document.createElement('div');
    overlay.className = 'ql-image-size-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ql-image-size-dialog';

    const title = document.createElement('h3');
    title.className = 'ql-image-size-title';
    title.textContent = 'Insert Image';

    const hint = document.createElement('p');
    hint.className = 'ql-image-size-hint';
    hint.textContent = 'Choose how this image should appear in your blog content.';

    const preview = document.createElement('div');
    preview.className = 'ql-image-size-preview';
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = 'Selected image preview';
    preview.appendChild(img);

    // Builds a labelled row of option buttons; clicking a button highlights it
    // and records the selection via the onPick callback.
    function buildOptionRow(labelText, options, barClassFn, onPickOption) {
        const labelEl = document.createElement('p');
        labelEl.className = 'ql-image-size-section-label';
        labelEl.textContent = labelText;

        const row = document.createElement('div');
        row.className = 'ql-image-size-options';
        options.forEach(({ key, label, hint: optionHint }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ql-image-size-btn';
            const bar = document.createElement('span');
            bar.className = barClassFn(key);
            const strong = document.createElement('strong');
            strong.textContent = label;
            const em = document.createElement('em');
            em.textContent = optionHint;
            btn.append(bar, strong, em);
            btn.addEventListener('click', () => {
                row.querySelectorAll('.ql-image-size-btn.ql-pick-selected').forEach((b) => b.classList.remove('ql-pick-selected'));
                btn.classList.add('ql-pick-selected');
                onPickOption(key);
            });
            row.appendChild(btn);
        });

        return { labelEl, row };
    }

    const sizeRow = buildOptionRow('Size', IMAGE_SIZES, (key) => `ql-size-bar ql-size-bar-${key}`, (key) => {
        selectedSize = key;
    });
    const positionRow = buildOptionRow('Position', IMAGE_POSITIONS, (key) => `ql-align-bar ql-align-bar-${key}`, (key) => {
        selectedAlign = key;
    });

    // Preselect the defaults (medium size, centered)
    sizeRow.row.children[1].classList.add('ql-pick-selected');
    positionRow.row.children[1].classList.add('ql-pick-selected');

    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'ql-image-insert-btn';
    insertBtn.textContent = 'Insert Image';
    insertBtn.addEventListener('click', () => {
        cleanup();
        onPick({ size: selectedSize, align: selectedAlign });
    });

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'ql-image-size-cancel';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', cleanup);

    function onKeydown(e) {
        if (e.key === 'Escape') cleanup();
    }

    function cleanup() {
        document.removeEventListener('keydown', onKeydown);
        overlay.remove();
    }

    dialog.append(title, hint, preview, sizeRow.labelEl, sizeRow.row, positionRow.labelEl, positionRow.row, insertBtn, cancel);
    overlay.appendChild(dialog);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup();
    });
    document.addEventListener('keydown', onKeydown);
    document.body.appendChild(overlay);
}


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
                        },
                        // Custom image handler: pick a file, choose a size
                        // (small / medium / large), then insert the image.
                        'image': function() {
                            const quill = this.quill;
                            const fileInput = document.createElement('input');
                            fileInput.setAttribute('type', 'file');
                            fileInput.setAttribute('accept', 'image/*');
                            fileInput.style.display = 'none';
                            document.body.appendChild(fileInput);

                            fileInput.addEventListener('change', () => {
                                const file = fileInput.files && fileInput.files[0];
                                fileInput.remove();
                                if (!file) return;

                                const reader = new FileReader();
                                reader.addEventListener('load', () => {
                                    const dataUrl = String(reader.result || '');
                                    if (!dataUrl) return;

                                    showImageInsertPicker(dataUrl, ({ size, align }) => {
                                        // Guard against a picker left open after unmount
                                        if (!quill.container.isConnected) return;
                                        const range = quill.getSelection(true);
                                        const index = range ? range.index : quill.getLength();
                                        quill.insertEmbed(index, 'image', dataUrl, 'user');
                                        quill.formatText(index, 1, 'data-size', size, 'user');
                                        quill.formatText(index, 1, 'data-align', align, 'user');
                                        quill.setSelection(index + 1, 'user');
                                    });
                                });
                                reader.readAsDataURL(file);
                            });

                            fileInput.click();
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

        // Add tooltip for the image button
        const imageButton = containerRef.current.querySelector('.ql-image');
        if (imageButton) {
            imageButton.title = "Insert Image (choose size & position after picking the file)";
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
