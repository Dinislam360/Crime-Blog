import express from 'express'
import { getSiteSettings, updateSiteSettings, uploadLogo, uploadFavicon, deleteLogo, deleteFavicon } from '../controllers/SiteSettings.controller.js'
import { onlyadmin } from '../middleware/onlyadmin.js'
import upload from '../config/multer.js'

const SiteSettingsRoute = express.Router()

SiteSettingsRoute.get('/get', getSiteSettings)
SiteSettingsRoute.put('/update', onlyadmin, updateSiteSettings)
SiteSettingsRoute.post('/upload-logo', onlyadmin, upload.single('logo'), uploadLogo)
SiteSettingsRoute.post('/upload-favicon', onlyadmin, upload.single('favicon'), uploadFavicon)
SiteSettingsRoute.delete('/delete-logo', onlyadmin, deleteLogo)
SiteSettingsRoute.delete('/delete-favicon', onlyadmin, deleteFavicon)

export default SiteSettingsRoute
