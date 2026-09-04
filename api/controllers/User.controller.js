import cloudinary from "../config/cloudinary.js"
import { handleError } from "../helpers/handleError.js"
import User from "../models/user.model.js"
import bcryptjs from 'bcryptjs'

const getPublicId = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex !== -1) {
        let sliceIndex = uploadIndex + 1;
        if (parts[sliceIndex] && parts[sliceIndex].startsWith('v')) {
            sliceIndex++;
        }
        const pathParts = parts.slice(sliceIndex);
        const joined = pathParts.join('/');
        const dotIndex = joined.lastIndexOf('.');
        if (dotIndex !== -1) {
            return joined.substring(0, dotIndex);
        }
        return joined;
    }
    return null;
}

export const getUser = async (req, res, next) => {
    try {
        const { userid } = req.params
        const user = await User.findOne({ _id: userid }).lean().exec()
        if (!user) {
            next(handleError(404, 'User not found.'))
        }
        res.status(200).json({
            success: true,
            message: 'User data found.',
            user
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const updateUser = async (req, res, next) => {
    try {
        const data = JSON.parse(req.body.data)
        const { userid } = req.params

        // IDOR / Privilege escalation check
        if (req.user._id !== userid && req.user.role !== 'admin') {
            return next(handleError(403, 'You are not authorized to update this user.'))
        }

        const user = await User.findById(userid)
        if (!user) {
            return next(handleError(404, 'User not found.'))
        }

        // Validate name and email inputs
        if (data.name && typeof data.name === 'string') {
            const trimmedName = data.name.trim()
            if (trimmedName.length >= 2 && trimmedName.length <= 50) {
                user.name = trimmedName
            } else {
                return next(handleError(400, 'Name must be between 2 and 50 characters.'))
            }
        }

        if (data.email && typeof data.email === 'string') {
            const trimmedEmail = data.email.trim().toLowerCase()
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(trimmedEmail)) {
                return next(handleError(400, 'Please provide a valid email address.'))
            }
            // Check if email is already taken by another user
            const existingEmailUser = await User.findOne({ email: trimmedEmail, _id: { $ne: userid } })
            if (existingEmailUser) {
                return next(handleError(409, 'Email is already in use.'))
            }
            user.email = trimmedEmail
        }

        user.bio = data.bio

        if (data.password && data.password.length >= 8) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
            if (!passwordRegex.test(data.password)) {
                return next(handleError(400, 'Password must be at least 8 characters long and contain at least one letter and one number.'))
            }
            const hashedPassword = bcryptjs.hashSync(data.password, 10)
            user.password = hashedPassword
        }

        if (req.file) {
            // Delete the previous image from Cloudinary if it exists
            if (user.avatar) {
                const publicId = getPublicId(user.avatar);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId).catch((error) => {
                        console.error("Failed to delete old avatar from Cloudinary:", error);
                    });
                }
            }

            // Upload an image
            const uploadResult = await cloudinary.uploader
                .upload(
                    req.file.path,
                    { folder: 'yt-mern-blog', resource_type: 'auto' }
                )
                .catch((error) => {
                    next(handleError(500, error.message))
                });

            user.avatar = uploadResult.secure_url
        }

        await user.save()

        const newUser = user.toObject({ getters: true })
        delete newUser.password
        res.status(200).json({
            success: true,
            message: 'Data updated.',
            user: newUser
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const getAllUser = async (req, res, next) => {
    try {
        const user = await User.find().sort({ createdAt: -1 })
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (user && user.avatar) {
            const publicId = getPublicId(user.avatar);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId).catch((error) => {
                    console.error("Failed to delete avatar from Cloudinary on user deletion:", error);
                });
            }
        }
        await User.findByIdAndDelete(id)
        res.status(200).json({
            success: true,
            message: 'Data deleted.'
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}
