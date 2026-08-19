import React, { createContext, useContext, useState, useEffect } from 'react';
import { getEnv } from '@/helpers/getEnv';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${getEnv('VITE_API_BASE_URL')}/site-settings/get`);
            const data = await res.json();
            if (data.success && data.settings) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Error fetching site settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Dynamically update document head (title, favicon, description, keywords, author)
    useEffect(() => {
        if (!settings) return;

        // Title
        document.title = settings.seo?.title || settings.websiteTitle || settings.websiteName || 'My Blog';

        // Favicon
        if (settings.favicon?.url) {
            let faviconLink = document.querySelector("link[rel~='icon']");
            if (!faviconLink) {
                faviconLink = document.createElement('link');
                faviconLink.rel = 'icon';
                document.head.appendChild(faviconLink);
            }
            faviconLink.href = settings.favicon.url;
        }

        // Description Meta
        if (settings.seo?.description) {
            let descMeta = document.querySelector("meta[name='description']");
            if (!descMeta) {
                descMeta = document.createElement('meta');
                descMeta.name = 'description';
                document.head.appendChild(descMeta);
            }
            descMeta.content = settings.seo.description;
        }

        // Keywords Meta
        if (settings.seo?.keywords) {
            let keywordsMeta = document.querySelector("meta[name='keywords']");
            if (!keywordsMeta) {
                keywordsMeta = document.createElement('meta');
                keywordsMeta.name = 'keywords';
                document.head.appendChild(keywordsMeta);
            }
            keywordsMeta.content = settings.seo.keywords;
        }

        // Author Meta
        if (settings.seo?.author) {
            let authorMeta = document.querySelector("meta[name='author']");
            if (!authorMeta) {
                authorMeta = document.createElement('meta');
                authorMeta.name = 'author';
                document.head.appendChild(authorMeta);
            }
            authorMeta.content = settings.seo.author;
        }
    }, [settings]);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};
