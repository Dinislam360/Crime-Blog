import express from 'express'
import Blog from '../models/blog.model.js'
import Category from '../models/category.model.js'

const router = express.Router()

router.get('/sitemap.xml', async (req, res, next) => {
    try {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

        // 1. Static URLs
        const staticPages = [
            { url: '', priority: '1.0', changefreq: 'daily' },
            { url: 'sign-in', priority: '0.5', changefreq: 'monthly' },
            { url: 'sign-up', priority: '0.5', changefreq: 'monthly' },
        ]

        // 2. Dynamic Categories
        const categories = await Category.find().lean().exec()
        const categoryPages = categories.map(cat => ({
            url: `blog/${cat.slug}`,
            priority: '0.7',
            changefreq: 'weekly',
            lastmod: cat.updatedAt ? cat.updatedAt.toISOString() : cat.createdAt ? cat.createdAt.toISOString() : new Date().toISOString()
        }))

        // 3. Dynamic Blogs
        const blogs = await Blog.find().populate('category', 'slug').lean().exec()
        const blogPages = blogs.map(blog => {
            const catSlug = (blog.category && blog.category.slug) ? blog.category.slug : 'uncategorized'
            return {
                url: `blog/${catSlug}/${blog.slug}`,
                priority: '0.8',
                changefreq: 'weekly',
                lastmod: blog.updatedAt ? blog.updatedAt.toISOString() : blog.createdAt ? blog.createdAt.toISOString() : new Date().toISOString()
            }
        })

        // Combine all pages
        const allPages = [
            ...staticPages.map(page => ({
                ...page,
                lastmod: new Date().toISOString()
            })),
            ...categoryPages,
            ...blogPages
        ]

        // Construct XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

        allPages.forEach(page => {
            const fullUrl = `${baseUrl.replace(/\/$/, '')}/${page.url}`
            xml += `  <url>\n`
            xml += `    <loc>${fullUrl}</loc>\n`
            if (page.lastmod) {
                xml += `    <lastmod>${page.lastmod}</lastmod>\n`
            }
            if (page.changefreq) {
                xml += `    <changefreq>${page.changefreq}</changefreq>\n`
            }
            if (page.priority) {
                xml += `    <priority>${page.priority}</priority>\n`
            }
            xml += `  </url>\n`
        })

        xml += `</urlset>`

        res.header('Content-Type', 'application/xml')
        res.status(200).send(xml)
    } catch (error) {
        next(error)
    }
})

export default router
