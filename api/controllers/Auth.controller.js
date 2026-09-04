import { handleError } from "../helpers/handleError.js"
import User from "../models/user.model.js"
import { validateEmail } from "../helpers/emailValidator.js"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const Register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body

        // Basic parameter type and presence checks
        if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
            return next(handleError(400, 'All fields are required and must be valid text.'))
        }

        const trimmedName = name.trim()
        if (trimmedName.length < 2 || trimmedName.length > 50) {
            return next(handleError(400, 'Name must be between 2 and 50 characters.'))
        }

        // Email validation & disposable email check
        const emailValidation = validateEmail(email)
        if (!emailValidation.isValid) {
            return next(handleError(400, emailValidation.error))
        }

        const targetEmail = email.trim().toLowerCase()

        // Password strength requirement: at least 8 characters, 1 letter, 1 number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return next(handleError(400, 'Password must be at least 8 characters long and contain at least one letter and one number.'))
        }

        const checkuser = await User.findOne({ email: targetEmail })
        if (checkuser) {
            // user already registered 
            return next(handleError(409, 'User already registered.'))
        }

        const hashedPassword = bcryptjs.hashSync(password, 10)
        // register user  
        const user = new User({
            name: trimmedName, 
            email: targetEmail, 
            password: hashedPassword
        })

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Registration successful.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const Login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // Validate type constraints to prevent NoSQL operator injection bypassing
        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            return next(handleError(400, 'Invalid email or password format.'))
        }

        const targetEmail = email.trim().toLowerCase()

        const user = await User.findOne({ email: targetEmail })
        if (!user) {
            return next(handleError(404, 'Invalid login credentials.'))
        }
        const hashedPassword = user.password

        const comparePassword = await bcryptjs.compare(password, hashedPassword)
        if (!comparePassword) {
            return next(handleError(404, 'Invalid login credentials.'))
        }

        const token = jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
        }, process.env.JWT_SECRET)


        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        })

        const newUser = user.toObject({ getters: true })
        delete newUser.password
        res.status(200).json({
            success: true,
            user: newUser,
            message: 'Login successful.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const GoogleLogin = async (req, res, next) => {
    try {
        const { name, email, avatar } = req.body
        let user
        user = await User.findOne({ email })
        if (!user) {
            //  create new user 
            const password = Math.random().toString()
            const hashedPassword = bcryptjs.hashSync(password)
            const newUser = new User({
                name, email, password: hashedPassword, avatar
            })

            user = await newUser.save()

        }


        const token = jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
        }, process.env.JWT_SECRET)


        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        })

        const newUser = user.toObject({ getters: true })
        delete newUser.password
        res.status(200).json({
            success: true,
            user: newUser,
            message: 'Login successful.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}



export const Logout = async (req, res, next) => {
    try {

        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        })

        res.status(200).json({
            success: true,
            message: 'Logout successful.'
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}
