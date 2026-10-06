import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { getEnv } from '@/helpers/getEnv';
import { showToast } from '@/helpers/showToast';
import { LuUpload, LuRefreshCw, LuGlobe, LuImage, LuSearch, LuMegaphone } from 'react-icons/lu';

const DEFAULT_AD_CODES = {
    socialBar: '<script src="https://pl23245113.profitableratecpmnetwork.com/c1/7a/bf/c17abf9bbd3f32e8257cc062711070f1.js"></script>',
    popunder: '<script src="https://pl23244884.profitableratecpmnetwork.com/49/8b/bd/498bbdf2fee066a907fc67c421e9756b.js"></script>',
    nativeBanner: '<script async="async" data-cfasync="false" src="https://pl23254725.profitableratecpmnetwork.com/ab9c6b91c17283bc241ac874128f89f3/invoke.js"></script>\n<div id="container-ab9c6b91c17283bc241ac874128f89f3"></div>',
    middleBanner: `<script>\n  atOptions = {\n    'key' : '6389c7b68f0573384a52dc0f9997edf4',\n    'format' : 'iframe',\n    'height' : 90,\n    'width' : 728,\n    'params' : {}\n  };\n</script>\n<script src="https://www.highrevenueformat.com/6389c7b68f0573384a52dc0f9997edf4/invoke.js"></script>`,
    customCode: ''
};

const AD_SLOTS = [
    { key: 'socialBar', title: '1. Social Bar', hint: 'Shows on every public client page (full site).' },
    { key: 'popunder', title: '2. Popunder', hint: 'Shows on every public client page (full site).' },
    { key: 'nativeBanner', title: '3. Native Banner - End of blog post', hint: 'Shows only at the end of the blog post. Responsive on mobile & desktop.' },
    { key: 'middleBanner', title: '4. Banner - Middle of blog post', hint: 'Shows only in the middle of the blog post. Responsive on mobile & desktop.' },
    { key: 'customCode', title: '5. Custom Code', hint: 'Your own extra ad / tracking code. Shows on every public client page.' },
];

// Small ON/OFF toggle built without extra dependencies
const AdToggle = ({ checked, onChange, id }) => (
    <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}
    >
        <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
    </button>
);

const SiteSettings = () => {
    const { settings, refreshSettings, loading: contextLoading } = useSiteSettings();
    const [loading, setLoading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [faviconUploading, setFaviconUploading] = useState(false);
    const [adsSaving, setAdsSaving] = useState(false);

    // Form states
    const [websiteName, setWebsiteName] = useState('');
    const [websiteTitle, setWebsiteTitle] = useState('');
    const [footerText, setFooterText] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [seoAuthor, setSeoAuthor] = useState('');

    const [logoDisplayMode, setLogoDisplayMode] = useState('logo-only');
    const [logoTextColor, setLogoTextColor] = useState('#000000');
    const [logoTextBorderSize, setLogoTextBorderSize] = useState(0);
    const [logoTextBorderColor, setLogoTextBorderColor] = useState('#000000');
    const [logoTextFontSize, setLogoTextFontSize] = useState(20);

    // Ads states: { socialBar: {enabled, code}, ... }
    const [ads, setAds] = useState({
        socialBar: { enabled: false, code: DEFAULT_AD_CODES.socialBar },
        popunder: { enabled: false, code: DEFAULT_AD_CODES.popunder },
        nativeBanner: { enabled: false, code: DEFAULT_AD_CODES.nativeBanner },
        middleBanner: { enabled: false, code: DEFAULT_AD_CODES.middleBanner },
        customCode: { enabled: false, code: '' },
    });

    // Load initial values from context
    useEffect(() => {
        if (settings) {
            setWebsiteName(settings.websiteName || '');
            setWebsiteTitle(settings.websiteTitle || '');
            setFooterText(settings.footerText || '');
            setSeoTitle(settings.seo?.title || '');
            setSeoDescription(settings.seo?.description || '');
            setSeoKeywords(settings.seo?.keywords || '');
            setSeoAuthor(settings.seo?.author || '');
            setLogoDisplayMode(settings.logoDisplayMode || 'logo-only');
            setLogoTextColor(settings.logoTextColor || '#000000');
            setLogoTextBorderSize(settings.logoTextBorderSize || 0);
            setLogoTextBorderColor(settings.logoTextBorderColor || '#000000');
            setLogoTextFontSize(settings.logoTextFontSize || 20);
            setAds({
                socialBar: {
                    enabled: Boolean(settings.ads?.socialBar?.enabled),
                    code: settings.ads?.socialBar?.code ?? DEFAULT_AD_CODES.socialBar
                },
                popunder: {
                    enabled: Boolean(settings.ads?.popunder?.enabled),
                    code: settings.ads?.popunder?.code ?? DEFAULT_AD_CODES.popunder
                },
                nativeBanner: {
                    enabled: Boolean(settings.ads?.nativeBanner?.enabled),
                    code: settings.ads?.nativeBanner?.code ?? DEFAULT_AD_CODES.nativeBanner
                },
                middleBanner: {
                    enabled: Boolean(settings.ads?.middleBanner?.enabled),
                    code: settings.ads?.middleBanner?.code ?? DEFAULT_AD_CODES.middleBanner
                },
                customCode: {
                    enabled: Boolean(settings.ads?.customCode?.enabled),
                    code: settings.ads?.customCode?.code ?? ''
                },
            });
        }
    }, [settings]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${getEnv('VITE_API_BASE_URL')}/site-settings/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    websiteName,
                    websiteTitle,
                    footerText,
                    logoDisplayMode,
                    logoTextColor,
                    logoTextBorderSize: Number(logoTextBorderSize),
                    logoTextBorderColor,
                    logoTextFontSize: Number(logoTextFontSize),
                    seo: {
                        title: seoTitle,
                        description: seoDescription,
                        keywords: seoKeywords,
                        author: seoAuthor
                    }
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update site settings');
            }
            showToast('success', 'Site settings updated successfully!');
            refreshSettings();
        } catch (error) {
            showToast('error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAds = async (e) => {
        if (e) e.preventDefault();
        setAdsSaving(true);
        try {
            const res = await fetch(`${getEnv('VITE_API_BASE_URL')}/site-settings/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ ads })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update ads');
            }
            showToast('success', 'Ads updated successfully!');
            refreshSettings();
        } catch (error) {
            showToast('error', error.message);
        } finally {
            setAdsSaving(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        setLogoUploading(true);
        try {
            const res = await fetch(`${getEnv('VITE_API_BASE_URL')}/site-settings/upload-logo`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to upload logo');
            }
            showToast('success', 'Logo uploaded and updated successfully!');
            refreshSettings();
        } catch (error) {
            showToast('error', error.message);
        } finally {
            setLogoUploading(false);
        }
    };

    const handleFaviconUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('favicon', file);

        setFaviconUploading(true);
        try {
            const res = await fetch(`${getEnv('VITE_API_BASE_URL')}/site-settings/upload-favicon`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to upload favicon');
            }
            showToast('success', 'Favicon uploaded and updated successfully!');
            refreshSettings();
        } catch (error) {
            showToast('error', error.message);
        } finally {
            setFaviconUploading(false);
        }
    };

    const handleDeleteLogo = async () => {
        if (!window.confirm('Are you sure you want to remove the website logo?')) return;
        setLogoUploading(true);
        try {
            const res = await fetch(`${getEnv('VITE_API_BASE_URL')}/site-settings/delete-logo`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to remove logo');
            }
            showToast('success', 'Logo removed successfully!');
            refreshSettings();
        } catch (error) {
            showToast('error', error.message);
        } finally {
            setLogoUploading(false);
        }
    };

    const handleDeleteFavicon = async () => {
        if (!window.confirm('Are you sure you want to remove the website favicon?')) return;
        setFaviconUploading(true);
        try {
            const res = await fetch(`${getEnv('VITE_API_BASE_URL')}/site-settings/delete-favicon`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to remove favicon');
            }
            showToast('success', 'Favicon removed successfully!');
            refreshSettings();
        } catch (error) {
            showToast('error', error.message);
        } finally {
            setFaviconUploading(false);
        }
    };

    if (contextLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LuRefreshCw className="animate-spin text-primary mr-2" size={24} />
                <span>Loading Site Settings...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Site Settings</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        
                        {/* Website Identity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LuGlobe className="text-blue-500" /> General Settings
                                </CardTitle>
                                <CardDescription>Configure basic website identity information.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="websiteName">Website Name</Label>
                                    <Input 
                                        id="websiteName"
                                        value={websiteName}
                                        onChange={(e) => setWebsiteName(e.target.value)}
                                        placeholder="My Awesome Blog"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="websiteTitle">Website Title (Slogan)</Label>
                                    <Input 
                                        id="websiteTitle"
                                        value={websiteTitle}
                                        onChange={(e) => setWebsiteTitle(e.target.value)}
                                        placeholder="My Awesome Blog - Share your ideas"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="footerText">Footer Text</Label>
                                    <Input 
                                        id="footerText"
                                        value={footerText}
                                        onChange={(e) => setFooterText(e.target.value)}
                                        placeholder="© Copyright 2024 | Designed & Developed By: Vynlo"
                                    />
                                </div>

                                <hr className="my-4" />
                                <h3 className="font-semibold text-gray-700 text-sm">Logo & Branding Style</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="logoDisplayMode">Logo Display Mode</Label>
                                        <select
                                            id="logoDisplayMode"
                                            value={logoDisplayMode}
                                            onChange={(e) => setLogoDisplayMode(e.target.value)}
                                            className="w-full border rounded-md p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="logo-only">Logo (Image) Only</option>
                                            <option value="text-only">Name (Text) Only</option>
                                            <option value="both">Both Logo and Name</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logoTextColor">Logo Text Color</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="logoTextColor"
                                                type="color"
                                                value={logoTextColor}
                                                onChange={(e) => setLogoTextColor(e.target.value)}
                                                className="w-12 h-10 p-1 cursor-pointer"
                                            />
                                            <Input 
                                                type="text"
                                                value={logoTextColor}
                                                onChange={(e) => setLogoTextColor(e.target.value)}
                                                placeholder="#000000"
                                                className="font-mono h-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logoTextBorderSize">Logo Text Border Size (px)</Label>
                                        <Input 
                                            id="logoTextBorderSize"
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={logoTextBorderSize}
                                            onChange={(e) => setLogoTextBorderSize(Number(e.target.value))}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logoTextBorderColor">Logo Text Border Color</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                id="logoTextBorderColor"
                                                type="color"
                                                value={logoTextBorderColor}
                                                onChange={(e) => setLogoTextBorderColor(e.target.value)}
                                                className="w-12 h-10 p-1 cursor-pointer"
                                            />
                                            <Input 
                                                type="text"
                                                value={logoTextBorderColor}
                                                onChange={(e) => setLogoTextBorderColor(e.target.value)}
                                                placeholder="#000000"
                                                className="font-mono h-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="logoTextFontSize">Logo Text Font Size (px)</Label>
                                        <Input 
                                            id="logoTextFontSize"
                                            type="number"
                                            min="8"
                                            max="100"
                                            value={logoTextFontSize}
                                            onChange={(e) => setLogoTextFontSize(Number(e.target.value))}
                                            placeholder="20"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SEO Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LuSearch className="text-green-500" /> SEO Metadata Settings
                                </CardTitle>
                                <CardDescription>Improve search visibility and meta indexing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="seoTitle">SEO Title Tag</Label>
                                    <Input 
                                        id="seoTitle"
                                        value={seoTitle}
                                        onChange={(e) => setSeoTitle(e.target.value)}
                                        placeholder="The homepage title tag Google will display"
                                    />
                                    <p className="text-xs text-gray-400">Recommended length: 50-60 characters. Current: {seoTitle.length} chars</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="seoDescription">Meta Description</Label>
                                    <Textarea 
                                        id="seoDescription"
                                        value={seoDescription}
                                        onChange={(e) => setSeoDescription(e.target.value)}
                                        placeholder="Summarize your website's content for search engine listings..."
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-400">Recommended length: 150-160 characters. Current: {seoDescription.length} chars</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="seoKeywords">Meta Keywords (Comma separated)</Label>
                                    <Input 
                                        id="seoKeywords"
                                        value={seoKeywords}
                                        onChange={(e) => setSeoKeywords(e.target.value)}
                                        placeholder="blog, articles, tech, tutorial"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="seoAuthor">Meta Author</Label>
                                    <Input 
                                        id="seoAuthor"
                                        value={seoAuthor}
                                        onChange={(e) => setSeoAuthor(e.target.value)}
                                        placeholder="Author / Organization name"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ads Settings */}
                        <Card className="border-orange-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LuMegaphone className="text-orange-500" /> Ads Settings
                                </CardTitle>
                                <CardDescription>Control all ads shown on the public client website. Turn each slot ON/OFF and edit its code anytime.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {AD_SLOTS.map((slot) => (
                                    <div key={slot.key} className="rounded-lg border p-4 space-y-3 bg-orange-50/30">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-sm">{slot.title}</p>
                                                <p className="text-xs text-gray-500">{slot.hint}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-xs font-bold ${ads[slot.key]?.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {ads[slot.key]?.enabled ? 'ON' : 'OFF'}
                                                </span>
                                                <AdToggle
                                                    id={`ad-toggle-${slot.key}`}
                                                    checked={Boolean(ads[slot.key]?.enabled)}
                                                    onChange={(val) => setAds((prev) => ({
                                                        ...prev,
                                                        [slot.key]: { ...prev[slot.key], enabled: val }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`ad-code-${slot.key}`}>Ad code (paste your script / HTML here)</Label>
                                            <Textarea
                                                id={`ad-code-${slot.key}`}
                                                value={ads[slot.key]?.code || ''}
                                                onChange={(e) => setAds((prev) => ({
                                                    ...prev,
                                                    [slot.key]: { ...prev[slot.key], code: e.target.value }
                                                }))}
                                                placeholder="Paste ad script here..."
                                                rows={4}
                                                className="font-mono text-xs"
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs h-7"
                                                    onClick={() => setAds((prev) => ({
                                                        ...prev,
                                                        [slot.key]: { ...prev[slot.key], code: DEFAULT_AD_CODES[slot.key] || '' }
                                                    }))}
                                                >
                                                    Reset to default
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" onClick={handleSaveAds} className="w-full h-12 text-lg" disabled={adsSaving}>
                                    {adsSaving && <LuRefreshCw className="animate-spin mr-2" />}
                                    Save Ads Settings
                                </Button>
                                <p className="text-xs text-gray-400 text-center">Ads only appear on the public client pages — never inside admin / login screens.</p>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                            {loading && <LuRefreshCw className="animate-spin mr-2" />}
                            Save Settings & Update SEO
                        </Button>
                    </form>
                </div>

                {/* Sidebar Media Settings & Google SERP Preview */}
                <div className="space-y-6">
                    
                    {/* Media Uploads */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LuImage className="text-purple-500" /> Branding & Media
                            </CardTitle>
                            <CardDescription>Upload Logo and Favicon (stored securely in Cloudinary).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            {/* Logo */}
                            <div className="space-y-3">
                                <Label className="text-base">Website Logo</Label>
                                {settings?.logo?.url ? (
                                    <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-center min-h-20">
                                        <img src={settings.logo.url} alt="Logo" className="max-h-12 object-contain" />
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic text-center p-4 border border-dashed rounded-lg">No custom logo uploaded</div>
                                )}
                                <div className="relative flex gap-2">
                                    <input 
                                        type="file" 
                                        id="logo-upload" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleLogoUpload}
                                        disabled={logoUploading}
                                    />
                                    <Button 
                                        asChild 
                                        variant="outline" 
                                        className="w-full cursor-pointer"
                                        disabled={logoUploading}
                                    >
                                        <label htmlFor="logo-upload">
                                            {logoUploading ? <LuRefreshCw className="animate-spin mr-2" /> : <LuUpload className="mr-2" />}
                                            {settings?.logo?.url ? 'Change Logo' : 'Upload Logo'}
                                        </label>
                                    </Button>
                                    {settings?.logo?.url && (
                                        <Button 
                                            type="button" 
                                            variant="destructive" 
                                            onClick={handleDeleteLogo}
                                            disabled={logoUploading}
                                            className="px-3 h-10"
                                            title="Remove Logo"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 text-center">Auto-resized to max 400x100px with optimized ratio</p>
                            </div>

                            <hr />

                            {/* Favicon */}
                            <div className="space-y-3">
                                <Label className="text-base">Favicon (Browser Tab Icon)</Label>
                                {settings?.favicon?.url ? (
                                    <div className="p-3 bg-gray-50 border rounded-lg flex items-center justify-center min-h-16">
                                        <img src={settings.favicon.url} alt="Favicon" className="w-10 h-10 object-contain" />
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic text-center p-4 border border-dashed rounded-lg">No custom favicon uploaded</div>
                                )}
                                <div className="relative flex gap-2">
                                    <input 
                                        type="file" 
                                        id="favicon-upload" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFaviconUpload}
                                        disabled={faviconUploading}
                                    />
                                    <Button 
                                        asChild 
                                        variant="outline" 
                                        className="w-full cursor-pointer"
                                        disabled={faviconUploading}
                                    >
                                        <label htmlFor="favicon-upload">
                                            {faviconUploading ? <LuRefreshCw className="animate-spin mr-2" /> : <LuUpload className="mr-2" />}
                                            {settings?.favicon?.url ? 'Change Favicon' : 'Upload Favicon'}
                                        </label>
                                    </Button>
                                    {settings?.favicon?.url && (
                                        <Button 
                                            type="button" 
                                            variant="destructive" 
                                            onClick={handleDeleteFavicon}
                                            disabled={faviconUploading}
                                            className="px-3 h-10"
                                            title="Remove Favicon"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 text-center">Auto-resized to perfectly square 64x64px favicon</p>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Google Indexing SERP Preview */}
                    <Card className="border border-blue-100 bg-blue-50/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Google Search SERP Preview
                            </CardTitle>
                            <CardDescription>This is how your website appears on Google searches.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                {/* Site Favicon snippet */}
                                <div className="w-7 h-7 bg-gray-100 border rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                    <img 
                                        src={settings?.favicon?.url || '/vite.svg'} 
                                        alt="Preview Favicon" 
                                        className="w-4 h-4 object-contain" 
                                    />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs text-gray-800 font-medium truncate">{websiteName || 'My Blog'}</span>
                                    <span className="text-[10px] text-gray-400 truncate">https://yourwebsite.com</span>
                                </div>
                            </div>
                            
                            {/* Blue Title Link */}
                            <h3 className="text-xl text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer truncate">
                                {seoTitle || websiteTitle || websiteName || 'My Blog'}
                            </h3>
                            
                            {/* Snippet Description */}
                            <p className="text-sm text-[#4d5156] leading-relaxed break-words">
                                {seoDescription || 'Read interesting blogs, articles and news here.'}
                            </p>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </div>
    );
};

export default SiteSettings;
