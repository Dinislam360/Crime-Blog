import express from 'express'
import { GoogleLogin, Login, Logout, Register } from '../controllers/Auth.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import rateLimit from 'express-rate-limit'

const AuthRoute = express.Router()

// Stricter rate limiter for authentication routes (prevent brute forcing and spam registers)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per 15 minutes
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
})

AuthRoute.post('/register', authLimiter, Register)
AuthRoute.post('/login', authLimiter, Login)
AuthRoute.post('/google-login', authLimiter, GoogleLogin)
AuthRoute.get('/logout', authenticate, Logout)

export default AuthRoute