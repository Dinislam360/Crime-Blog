import express from 'express'
import { getSiteSettings, updateSiteSettings, uploadLogo, uploadFavicon } from '../controllers/SiteSettings.controller.js'
import { onlyadmin } from '../middleware/onlyadmin.js'
import upload from '../config/multer.js'

const SiteSettingsRoute = express.Router()

SiteSettingsRoute.get('/get', getSiteSettings)
SiteSettingsRoute.put('/update', onlyadmin, updateSiteSettings)
SiteSettingsRoute.post('/upload-logo', onlyadmin, upload.single('logo'), uploadLogo)
SiteSettingsRoute.post('/upload-favicon', onlyadmin, upload.single('favicon'), uploadFavicon)

export default SiteSettingsRoute
