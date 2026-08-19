import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

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
                toolbar: [
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
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            }
        });

        quillRef.current = quill;

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
        <div ref={containerRef} className="bg-background rounded-md overflow-hidden" />
    );
}
