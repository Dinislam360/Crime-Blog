import React from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const Logo = ({ className = "" }) => {
    const { settings, loading } = useSiteSettings();

    if (loading) {
        // While loading, return a blank/pulse skeleton so it doesn't flicker/show default logo
        return <div className={`h-8 w-32 bg-gray-100 animate-pulse rounded ${className}`} />;
    }

    const mode = settings?.logoDisplayMode || 'logo-only';
    const hasLogo = !!settings?.logo?.url;
    const name = settings?.websiteName || 'My Blog';

    // Text Style for Custom styling
    const textStyle = {
        fontFamily: "'Complete Destroy', sans-serif",
        color: settings?.logoTextColor || '#000000',
        fontSize: settings?.logoTextFontSize ? `${settings.logoTextFontSize}px` : undefined,
        WebkitTextStroke: settings?.logoTextBorderSize && settings?.logoTextBorderColor 
            ? `${settings.logoTextBorderSize}px ${settings.logoTextBorderColor}`
            : 'none',
        textStroke: settings?.logoTextBorderSize && settings?.logoTextBorderColor 
            ? `${settings.logoTextBorderSize}px ${settings.logoTextBorderColor}`
            : 'none',
    };

    const renderText = () => (
        <span 
            className="font-extrabold text-xl tracking-wider select-none whitespace-nowrap" 
            style={textStyle}
        >
            {name}
        </span>
    );

    const renderImage = () => {
        if (!hasLogo) return null;
        return (
            <img 
                src={settings.logo.url} 
                alt={name} 
                className="max-h-12 w-auto object-contain" 
            />
        );
    };

    // Render logic based on mode
    if (mode === 'text-only' || !hasLogo) {
        return (
            <div className={`flex items-center ${className}`}>
                {renderText()}
            </div>
        );
    }

    if (mode === 'both') {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                {renderImage()}
                {renderText()}
            </div>
        );
    }

    // Default: logo-only (image-only)
    return (
        <div className={`flex items-center ${className}`}>
            {renderImage()}
        </div>
    );
};

export default Logo;