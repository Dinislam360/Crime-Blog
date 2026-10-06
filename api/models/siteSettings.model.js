import mongoose from "mongoose";

const adSlotSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: false
    },
    code: {
        type: String,
        default: ''
    }
}, { _id: false });

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
    logoTextFontSize: {
        type: Number,
        default: 20
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
    },
    ads: {
        socialBar: {
            type: adSlotSchema,
            default: () => ({
                enabled: false,
                code: '<script src="https://pl23245113.profitableratecpmnetwork.com/c1/7a/bf/c17abf9bbd3f32e8257cc062711070f1.js"></script>'
            })
        },
        popunder: {
            type: adSlotSchema,
            default: () => ({
                enabled: false,
                code: '<script src="https://pl23244884.profitableratecpmnetwork.com/49/8b/bd/498bbdf2fee066a907fc67c421e9756b.js"></script>'
            })
        },
        nativeBanner: {
            type: adSlotSchema,
            default: () => ({
                enabled: false,
                code: '<script async="async" data-cfasync="false" src="https://pl23254725.profitableratecpmnetwork.com/ab9c6b91c17283bc241ac874128f89f3/invoke.js"></script>\n<div id="container-ab9c6b91c17283bc241ac874128f89f3"></div>'
            })
        },
        middleBanner: {
            type: adSlotSchema,
            default: () => ({
                enabled: false,
                code: `<script>\n  atOptions = {\n    'key' : '6389c7b68f0573384a52dc0f9997edf4',\n    'format' : 'iframe',\n    'height' : 90,\n    'width' : 728,\n    'params' : {}\n  };\n</script>\n<script src="https://www.highrevenueformat.com/6389c7b68f0573384a52dc0f9997edf4/invoke.js"></script>`
            })
        },
        customCode: {
            type: adSlotSchema,
            default: () => ({
                enabled: false,
                code: ''
            })
        }
    }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema, 'site_settings');
export default SiteSettings;
