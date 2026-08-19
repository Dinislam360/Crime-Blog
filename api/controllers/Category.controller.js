import { handleError } from "../helpers/handleError.js"
import Category from "../models/category.model.js"

export const addCategory = async (req, res, next) => {
    try {
        const { name, slug } = req.body
        
        // Validate input
        if (!name || !slug) {
            return next(handleError(400, 'Name and slug are required'))
        }

        // Check if category with this slug already exists
        const existingCategory = await Category.findOne({ slug })
        if (existingCategory) {
            return next(handleError(400, 'Category with this slug already exists'))
        }

        const category = new Category({
            name, 
            slug
        })

        await category.save()

        res.status(201).json({
            success: true,
            message: 'Category added successfully.',
            category
        })

    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(handleError(400, error.message))
        }
        next(handleError(500, 'Internal server error'))
    }
}

export const showCategory = async (req, res, next) => {
    try {
        const { categoryid } = req.params
        const category = await Category.findById(categoryid)
        if (!category) {
            return next(handleError(404, 'Category not found'))
        }
        res.status(200).json({
            success: true,
            category
        })
    } catch (error) {
        next(handleError(500, 'Internal server error'))
    }
}

export const updateCategory = async (req, res, next) => {
    try {
        const { name, slug } = req.body
        const { categoryid } = req.params

        // Check if category exists
        const existingCategory = await Category.findById(categoryid)
        if (!existingCategory) {
            return next(handleError(404, 'Category not found'))
        }

        // Check if new slug is unique
        if (slug !== existingCategory.slug) {
            const slugExists = await Category.findOne({ slug })
            if (slugExists) {
                return next(handleError(400, 'Category with this slug already exists'))
            }
        }

        const category = await Category.findByIdAndUpdate(categoryid, {
            name, slug
        }, { new: true })

        res.status(200).json({
            success: true,
            message: 'Category updated successfully.',
            category
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            return next(handleError(400, error.message))
        }
        next(handleError(500, 'Internal server error'))
    }
}

export const deleteCategory = async (req, res, next) => {
    try {
        const { categoryid } = req.params
        const category = await Category.findByIdAndDelete(categoryid)
        if (!category) {
            return next(handleError(404, 'Category not found'))
        }
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully.',
        })
    } catch (error) {
        next(handleError(500, 'Internal server error'))
    }
}

export const getAllCategory = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean().exec()
        res.status(200).json({
            success: true,
            category: categories,
            categories
        })
    } catch (error) {
        next(handleError(500, 'Internal server error'))
    }
}
