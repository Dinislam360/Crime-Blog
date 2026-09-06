import express from 'express'
import Blog from '../models/blog.model.js'
import Category from '../models/category.model.js'
import SiteSettings from '../models/siteSettings.model.js'
import { decode } from 'entities'

const router = express.Router()

const generateMetaDescription = (htmlContent) => {
    if (!htmlContent) return ''
    const decoded = decode(htmlContent)
    const cleanText = decoded
        .replace(/<[^>]*>/g, ' ') // strip html tags
        .replace(/\s+/g, ' ')     // collapse whitespace
        .trim()
    
    if (cleanText.length <= 160) {
        return cleanText
    }
    
    let trimmed = cleanText.substring(0, 160)
    const lastSpace = trimmed.lastIndexOf(' ')
    if (lastSpace > 120) {
        trimmed = trimmed.substring(0, lastSpace)
    }
    return trimmed.trim() + '...'
}

// Escape values injected into HTML attributes so quotes/special chars in titles never break meta tags
const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// Facebook's preferred OG image is 1200x630 (1.91:1). Cloudinary can generate it on the fly,
// and declaring width/height lets Facebook render the preview immediately (no async image fetch).
const getOgImageVariants = (url) => {
    const raw = String(url || '')
    const match = raw.match(/^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/)
    if (match) {
        return {
            url: `${match[1]}w_1200,h_630,c_fill,q_auto,f_jpg/${match[2]}`,
            width: 1200,
            height: 630,
        }
    }
    return { url: raw, width: null, height: null }
}

router.get('/render', async (req, res, next) => {
    try {
        const path = req.query.path || '/'
        const protocol = req.headers['x-forwarded-proto'] || 'http'
        const host = req.headers.host || 'localhost:5173'
        const defaultBaseUrl = `${protocol}://${host}`
        const baseUrl = (process.env.FRONTEND_URL || defaultBaseUrl).replace(/\/$/, '')
        
        let title = ''
        let description = ''
        let image = ''
        let type = 'website'
        let favicon = '/src/assets/images/favicon.png'
        let keywords = ''
        let author = 'Admin'

        // 1. Fetch site settings as base fallbacks
        const settings = await SiteSettings.findOne().lean().exec()
        if (settings) {
            title = settings.seo?.title || settings.websiteTitle || settings.websiteName || 'My Blog'
            description = settings.seo?.description || 'Read interesting blogs, articles and news here.'
            keywords = settings.seo?.keywords || 'blog, articles, news, mern, react'
            author = settings.seo?.author || 'Admin'
            if (settings.logo?.url) {
                image = settings.logo.url
            }
            if (settings.favicon?.url) {
                favicon = settings.favicon.url
            }
        } else {
            title = 'My Blog'
            description = 'Read interesting blogs, articles and news here.'
        }

        // 2. Check if path is a blog details page: /blog/:category/:blog
        const blogMatch = path.match(/^\/blog\/[^/]+\/([^/?#]+)/)
        if (blogMatch) {
            const slug = blogMatch[1]
            const blog = await Blog.findOne({ slug }).populate('author', 'name').lean().exec()
            if (blog) {
                title = blog.metaTitle || blog.title
                description = blog.metaDescription || generateMetaDescription(blog.blogContent)
                if (blog.featuredImage) {
                    image = blog.featuredImage
                }
                if (blog.author?.name) {
                    author = blog.author.name
                }
                type = 'article'
            }
        } else {
            // 3. Check if path is a category page: /blog/:category
            const catMatch = path.match(/^\/blog\/([^/?#]+)$/)
            if (catMatch) {
                const catSlug = catMatch[1]
                // Make sure we don't treat page paths like "add" or "edit" as a category slug
                if (catSlug !== 'add' && catSlug !== 'edit') {
                    const category = await Category.findOne({ slug: catSlug }).lean().exec()
                    if (category) {
                        title = `${category.name} - ${settings?.websiteName || 'My Blog'}`
                        description = `Read the latest articles about ${category.name} on ${settings?.websiteName || 'My Blog'}.`
                    }
                }
            }
        }

        const fullUrl = `${baseUrl}${path}`

        // Sanitized values for safe injection into HTML attributes
        const safeTitle = escapeHtml(title)
        const safeDescription = escapeHtml(description)
        const safeKeywords = escapeHtml(keywords)
        const safeAuthor = escapeHtml(author)
        const safeSiteName = escapeHtml(settings?.websiteName || 'My Blog')
        const ogImage = getOgImageVariants(image)

        // Construct HTML that mimics client/index.html but with injected headers
        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <meta name="keywords" content="${safeKeywords}" />
    <meta name="author" content="${safeAuthor}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:site_name" content="${safeSiteName}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    ${ogImage.url ? `<meta property="og:image" content="${escapeHtml(ogImage.url)}" />
    <meta property="og:image:alt" content="${safeTitle}" />${ogImage.width ? `
    <meta property="og:image:width" content="${ogImage.width}" />
    <meta property="og:image:height" content="${ogImage.height}" />` : ''}` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    ${ogImage.url ? `<meta name="twitter:image" content="${escapeHtml(ogImage.url)}" />
    <meta name="twitter:image:alt" content="${safeTitle}" />` : ''}

    <!-- Favicon -->
    <link rel="icon" href="${escapeHtml(favicon)}" />

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-64859L11YZ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-64859L11YZ');
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`

        // Cache at Vercel's edge so social media crawlers always get a fast response
        // (avoids serverless cold-start timeouts that make Facebook drop the preview image)
        res.status(200)
            .header('Content-Type', 'text/html; charset=utf-8')
            .header('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
            .send(html)
    } catch (error) {
        next(error)
    }
})

export default router
