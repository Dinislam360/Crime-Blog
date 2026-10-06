import React, { useEffect, useRef } from 'react';

// Renders raw ad HTML (script tags + divs) safely by re-creating script elements
// so they actually execute. Responsive wrapper ensures mobile compatibility.
const AdSlot = ({ code, className = '', label = 'Advertisement' }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';
        if (!code || !code.trim()) return;

        // Parse the HTML string
        const temp = document.createElement('div');
        temp.innerHTML = code.trim();

        const nodes = Array.from(temp.childNodes);
        nodes.forEach((node) => {
            if (node.tagName === 'SCRIPT') {
                const script = document.createElement('script');
                // copy all attributes (src, async, data-cfasync, etc.)
                Array.from(node.attributes || []).forEach((attr) => {
                    script.setAttribute(attr.name, attr.value);
                });
                // inline script body (e.g. atOptions = {...})
                if (node.textContent) {
                    script.text = node.textContent;
                }
                container.appendChild(script);
            } else if (node.nodeType === 1 || node.nodeType === 3) {
                container.appendChild(node.cloneNode(true));
            }
        });

        return () => {
            if (container) container.innerHTML = '';
        };
    }, [code]);

    if (!code || !code.trim()) return null;

    return (
        <div className={`ad-slot w-full overflow-hidden flex justify-center ${className}`}>
            <div ref={containerRef} className="ad-slot-inner w-full max-w-full flex flex-col items-center [&_iframe]:max-w-full [&_img]:max-w-full [&_img]:h-auto" style={{ overflowX: 'auto' }} />
        </div>
    );
};

export default AdSlot;
