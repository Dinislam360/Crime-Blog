import { handleError } from "../helpers/handleError.js"
import Comment from "../models/comment.model.js"
export const addcomment = async (req, res, next) => {
    try {
        const { user, blogid, comment } = req.body
        const newComment = new Comment({
            user: user,
            blogid: blogid,
            comment: comment
        })

        await newComment.save()
        res.status(200).json({
            success: true,
            message: 'Comment submited.',
            comment: newComment
        })

    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const getComments = async (req, res, next) => {
    try {
        const { blogid } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const skip = (page - 1) * limit

        const totalComments = await Comment.countDocuments({ blogid })
        const comments = await Comment.find({ blogid })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec()

        res.status(200).json({
            comments,
            totalComments,
            totalPages: Math.ceil(totalComments / limit),
            currentPage: page
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const commentCount = async (req, res, next) => {
    try {
        const { blogid } = req.params
        const commentCount = await Comment.countDocuments({ blogid })

        res.status(200).json({
            commentCount
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const getAllComments = async (req, res, next) => {
    try {
        const user = req.user
        let comments
        if (user.role === 'admin') {
            comments = await Comment.find().populate('blogid', 'title').populate('user', 'name')

        } else {

            comments = await Comment.find({ user: user._id }).populate('blogid', 'title').populate('user', 'name')
        }

        res.status(200).json({
            comments
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


export const deleteComment = async (req, res, next) => {
    try {
        const { commentid } = req.params
        await Comment.findByIdAndDelete(commentid)

        res.status(200).json({
            success: true,
            message: 'Data deleted'
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}


