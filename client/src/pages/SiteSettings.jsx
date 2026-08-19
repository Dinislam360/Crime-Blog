import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { getEnv } from '@/helpers/getEnv';
import { showToast } from '@/helpers/showToast';
import { LuUpload, LuRefreshCw, LuGlobe, LuImage, LuSearch } from 'react-icons/lu';

const SiteSettings = () => {
    const { settings, refreshSettings, loading: contextLoading } = useSiteSettings();
    const [loading, setLoading] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [faviconUploading, setFaviconUploading] = useState(false);

    // Form states
    const [websiteName, setWebsiteName] = useState('');
    const [websiteTitle, setWebsiteTitle] = useState('');
    const [footerText, setFooterText] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [seoAuthor, setSeoAuthor] = useState('');

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
                                <div className="relative">
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
                                <div className="relative">
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
