import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import AuthRoute from './routes/Auth.route.js'
import UserRoute from './routes/User.route.js'
import CategoryRoute from './routes/Category.route.js'
import BlogRoute from './routes/Blog.route.js'
import CommentRouote from './routes/Comment.route.js'
import BlogLikeRoute from './routes/Bloglike.route.js'
import SiteSettingsRoute from './routes/SiteSettings.route.js'
import SitemapRoute from './routes/Sitemap.route.js'
import { decode } from 'entities'

dotenv.config()

const PORT = process.env.PORT
const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))


// route setup  

app.use('/api/auth', AuthRoute)
app.use('/api/user', UserRoute)
app.use('/api/category', CategoryRoute)
app.use('/api/blog', BlogRoute)
app.use('/api/comment', CommentRouote)
app.use('/api/blog-like', BlogLikeRoute)
app.use('/api/site-settings', SiteSettingsRoute)
app.use('/', SitemapRoute)



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

mongoose.connect(process.env.MONGODB_CONN, { dbName: 'yt-mern-blog' })
    .then(async () => {
        console.log('Database connected.')
        try {
            // Update any existing blogs that are missing meta fields
            const Blog = mongoose.model('Blog')
            const blogsToUpdate = await Blog.find({
                $or: [
                    { metaTitle: { $exists: false } },
                    { metaDescription: { $exists: false } },
                    { metaTitle: "" },
                    { metaDescription: "" }
                ]
            })
            if (blogsToUpdate.length > 0) {
                console.log(`Found ${blogsToUpdate.length} blogs without metadata. Migrating...`)
                for (const blog of blogsToUpdate) {
                    blog.metaTitle = blog.title
                    blog.metaDescription = generateMetaDescription(blog.blogContent)
                    await blog.save()
                }
                console.log('Successfully populated metadata for existing blogs.')
            }
        } catch (err) {
            console.error('Error migrating existing blogs:', err)
        }
    })
    .catch(err => console.log('Database connection failed.', err))

app.listen(PORT, () => {
    console.log('Server running on port:', PORT)
})


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal server error.'
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})