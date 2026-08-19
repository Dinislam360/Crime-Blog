import { handleError } from "../helpers/handleError.js"
import SiteSettings from "../models/siteSettings.model.js"
import cloudinary from "../config/cloudinary.js"

// Helper function to upload image to Cloudinary using file path
const uploadToCloudinary = async (filePath, folder, width, height, crop = 'limit') => {
    try {
        const transformations = {
            folder: folder,
            resource_type: 'image',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }
            ]
        };
        
        if (width || height) {
            transformations.transformation.push({
                width: width,
                height: height,
                crop: crop
            });
        }
        
        const result = await cloudinary.uploader.upload(filePath, transformations);
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

// Get site settings (public)
export const getSiteSettings = async (req, res, next) => {
    try {
        let settings = await SiteSettings.findOne().lean().exec();
        
        // If no settings exist, create default
        if (!settings) {
            settings = await SiteSettings.create({});
        }
        
        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        next(handleError(500, 'Internal server error'));
    }
};

// Update site settings (admin only)
export const updateSiteSettings = async (req, res, next) => {
    try {
        const { websiteName, websiteTitle, footerText, seo } = req.body;
        
        let settings = await SiteSettings.findOne();
        
        if (!settings) {
            settings = new SiteSettings();
        }
        
        // Update basic settings
        if (websiteName !== undefined) settings.websiteName = websiteName;
        if (websiteTitle !== undefined) settings.websiteTitle = websiteTitle;
        if (footerText !== undefined) settings.footerText = footerText;
        
        // Update SEO settings
        if (seo) {
            settings.seo = {
                title: seo.title !== undefined ? seo.title : settings.seo.title,
                description: seo.description !== undefined ? seo.description : settings.seo.description,
                keywords: seo.keywords !== undefined ? seo.keywords : settings.seo.keywords,
                author: seo.author !== undefined ? seo.author : settings.seo.author
            };
        }
        
        await settings.save();
        
        res.status(200).json({
            success: true,
            message: 'Site settings updated successfully.',
            settings
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(handleError(400, error.message));
        }
        next(handleError(500, 'Internal server error'));
    }
};

// Upload logo (admin only)
export const uploadLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(handleError(400, 'No file uploaded'));
        }
        
        let settings = await SiteSettings.findOne();
        
        if (!settings) {
            settings = new SiteSettings();
        }
        
        // Delete old logo if exists
        if (settings.logo && settings.logo.publicId) {
            await deleteFromCloudinary(settings.logo.publicId);
        }
        
        // Upload new logo with size transformation (max height 100px for typical web navbar)
        const result = await uploadToCloudinary(req.file.path, 'site-settings/logo', 400, 100, 'limit');
        
        settings.logo = {
            url: result.secure_url,
            publicId: result.public_id
        };
        
        await settings.save();
        
        res.status(200).json({
            success: true,
            message: 'Logo uploaded successfully.',
            logo: settings.logo
        });
    } catch (error) {
        next(handleError(500, error.message || 'Internal server error'));
    }
};

// Upload favicon (admin only)
export const uploadFavicon = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(handleError(400, 'No file uploaded'));
        }
        
        let settings = await SiteSettings.findOne();
        
        if (!settings) {
            settings = new SiteSettings();
        }
        
        // Delete old favicon if exists
        if (settings.favicon && settings.favicon.publicId) {
            await deleteFromCloudinary(settings.favicon.publicId);
        }
        
        // Upload new favicon with size transformation (64x64 square)
        const result = await uploadToCloudinary(req.file.path, 'site-settings/favicon', 64, 64, 'fill');
        
        settings.favicon = {
            url: result.secure_url,
            publicId: result.public_id
        };
        
        await settings.save();
        
        res.status(200).json({
            success: true,
            message: 'Favicon uploaded successfully.',
            favicon: settings.favicon
        });
    } catch (error) {
        next(handleError(500, error.message || 'Internal server error'));
    }
};
