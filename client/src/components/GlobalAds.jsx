import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { RouteSignIn, RouteSignUp, RouteProfile, RouteBlog, RouteBlogAdd, RouteCommentDetails, RouteUser, RouteSiteSettings, RouteCategoryDetails, RouteAddCategory } from '@/helpers/RouteName';

// Site-wide ads (Social Bar + Popunder + Custom code).
// ONLY runs on public "client" pages — never inside admin / auth / dashboard pages.
const isAdminOrAuthPath = (pathname) => {
    if (!pathname) return false;
    const blockedPrefixes = [
        RouteSignIn,           // /sign-in
        RouteSignUp,           // /sign-up
        RouteProfile,          // /profile
        RouteBlog,             // /blog (admin list)
        RouteBlogAdd,          // /blog/add
        '/blog/edit',
        RouteCommentDetails,   // /comments
        RouteUser,             // /users
        RouteSiteSettings,     // /site-settings
        RouteCategoryDetails,  // /categories
        RouteAddCategory,      // /category/add
        '/category/edit',
    ];
    return blockedPrefixes.some((p) => p && pathname === p) ||
        pathname.startsWith('/blog/edit') ||
        pathname.startsWith('/category/edit');
};

const injectHtmlWithScripts = (code) => {
    if (!code || !code.trim()) return () => {};
    const temp = document.createElement('div');
    temp.innerHTML = code.trim();
    const scripts = [];
    Array.from(temp.childNodes).forEach((node) => {
        if (node.tagName === 'SCRIPT') {
            const script = document.createElement('script');
            Array.from(node.attributes || []).forEach((attr) => {
                script.setAttribute(attr.name, attr.value);
            });
            if (node.textContent) script.text = node.textContent;
            script.setAttribute('data-managed-ad', 'true');
            document.body.appendChild(script);
            scripts.push(script);
        } else if (node.nodeType === 1) {
            // Non-script element (rare for site-wide ads, but support it)
            const el = node.cloneNode(true);
            el.setAttribute('data-managed-ad', 'true');
            document.body.appendChild(el);
            scripts.push(el);
        }
    });
    return () => {
        scripts.forEach((el) => el.parentNode && el.parentNode.removeChild(el));
    };
};

const GlobalAds = () => {
    const { settings } = useSiteSettings();
    const location = useLocation();

    const allowed = !isAdminOrAuthPath(location.pathname);
    const socialBar = settings?.ads?.socialBar;
    const popunder = settings?.ads?.popunder;
    const customCode = settings?.ads?.customCode;

    useEffect(() => {
        if (!allowed) return undefined;
        const cleanups = [];
        if (socialBar?.enabled && socialBar?.code?.trim()) {
            cleanups.push(injectHtmlWithScripts(socialBar.code));
        }
        if (popunder?.enabled && popunder?.code?.trim()) {
            cleanups.push(injectHtmlWithScripts(popunder.code));
        }
        if (customCode?.enabled && customCode?.code?.trim()) {
            cleanups.push(injectHtmlWithScripts(customCode.code));
        }
        return () => {
            cleanups.forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowed, socialBar?.enabled, socialBar?.code, popunder?.enabled, popunder?.code, customCode?.enabled, customCode?.code]);

    return null;
};

export default GlobalAds;
