import React, { useMemo } from 'react';
import { decode } from 'entities';
import AdSlot from './AdSlot';

// Splits decoded blog HTML into top / middle / end so a banner can be injected
// in the middle and a native banner at the end, fully responsive.
const splitHtmlForAds = (html) => {
    if (!html) return { top: '', bottom: '' };
    // Split on closing block tags to find a natural middle break point
    const parts = html.split(/(<\/(?:p|div|h1|h2|h3|h4|blockquote|ul|ol|pre|figure)[^>]*>)/gi);
    if (parts.length <= 2) return { top: html, bottom: '' };
    // Re-assemble into blocks then split at ~half
    const blocks = [];
    for (let i = 0; i < parts.length; i += 2) {
        blocks.push((parts[i] || '') + (parts[i + 1] || ''));
    }
    const mid = Math.max(1, Math.floor(blocks.length / 2));
    return {
        top: blocks.slice(0, mid).join(''),
        bottom: blocks.slice(mid).join('')
    };
};

const BlogContentWithAds = ({ html, middleBannerCode, nativeBannerCode, showMiddle = true, showNative = true }) => {
    const { top, bottom } = useMemo(() => splitHtmlForAds(decode(html) || ''), [html]);

    const hasMiddle = showMiddle && middleBannerCode && middleBannerCode.trim();
    const hasNative = showNative && nativeBannerCode && nativeBannerCode.trim();

    // No ads configured → render exactly as before (single .ql-editor block)
    if (!hasMiddle && !hasNative) {
        return (
            <div className="ql-container ql-snow" style={{ border: 'none', height: 'auto' }}>
                <div className="ql-editor" style={{ padding: 0, height: 'auto', overflowY: 'visible' }} dangerouslySetInnerHTML={{ __html: decode(html) || '' }} />
            </div>
        );
    }

    return (
        <>
            <div className="ql-container ql-snow" style={{ border: 'none', height: 'auto' }}>
                <div className="ql-editor" style={{ padding: 0, height: 'auto', overflowY: 'visible' }} dangerouslySetInnerHTML={{ __html: top }} />
            </div>

            {hasMiddle && (
                <div className="my-6 w-full overflow-hidden rounded-xl border bg-muted/30 p-3 flex justify-center">
                    <div className="w-full max-w-full overflow-x-auto flex justify-center">
                        <AdSlot code={middleBannerCode} label="Advertisement" />
                    </div>
                </div>
            )}

            {bottom && (
                <div className="ql-container ql-snow" style={{ border: 'none', height: 'auto' }}>
                    <div className="ql-editor" style={{ padding: 0, height: 'auto', overflowY: 'visible' }} dangerouslySetInnerHTML={{ __html: bottom }} />
                </div>
            )}

            {hasNative && (
                <div className="mt-6 w-full overflow-hidden rounded-xl border bg-muted/30 p-3">
                    <p className="mb-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Advertisement</p>
                    <div className="w-full max-w-full overflow-x-auto flex justify-center">
                        <AdSlot code={nativeBannerCode} label="Advertisement" />
                    </div>
                </div>
            )}
        </>
    );
};

export default BlogContentWithAds;
