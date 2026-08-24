import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema({
    websiteName: {
        type: String,
        default: 'My Blog'
    },
    websiteTitle: {
        type: String,
        default: 'My Blog - Share your ideas'
    },
    footerText: {
        type: String,
        default: '© Copyright 2024 | Designed & Developed By: Vynlo'
    },
    logo: {
        url: {
            type: String,
            default: ''
        },
        publicId: {
            type: String,
            default: ''
        }
    },
    favicon: {
        url: {
            type: String,
            default: ''
        },
        publicId: {
            type: String,
            default: ''
        }
    },
    logoDisplayMode: {
        type: String,
        enum: ['logo-only', 'text-only', 'both'],
        default: 'logo-only'
    },
    logoTextColor: {
        type: String,
        default: '#000000'
    },
    logoTextBorderSize: {
        type: Number,
        default: 0
    },
    logoTextBorderColor: {
        type: String,
        default: '#000000'
    },
    seo: {
        title: {
            type: String,
            default: 'My Blog - Home'
        },
        description: {
            type: String,
            default: 'Read interesting blogs, articles and news here.'
        },
        keywords: {
            type: String,
            default: 'blog, articles, news, mern, react'
        },
        author: {
            type: String,
            default: 'Admin'
        }
    }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema, 'site_settings');
export default SiteSettings;
