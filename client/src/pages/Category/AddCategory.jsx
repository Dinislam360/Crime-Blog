import React, { useEffect, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import slugify from 'slugify'
import { showToast } from '@/helpers/showToast'
import { getEnv } from '@/helpers/getEnv'

const AddCategory = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const formSchema = z.object({
        name: z.string().min(3, 'Name must be at least 3 characters long'),
        slug: z.string().min(3, 'Slug must be at least 3 characters long')
            .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'),
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
    })

    const categoryName = form.watch('name')

    useEffect(() => {
        if (categoryName) {
            const slug = slugify(categoryName, { 
                lower: true,
                strict: true, // removes special characters
                trim: true
            })
            form.setValue('slug', slug, { shouldValidate: true })
        }
    }, [categoryName])

    async function onSubmit(values) {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/category/add`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(values)
            })
            
            const data = await response.json()
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add category')
            }
            
            form.reset()
            showToast('success', data.message || 'Category added successfully')
        } catch (error) {
            showToast('error', error.message || 'An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <Card className="pt-5 max-w-screen-md mx-auto">
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Enter category name" 
                                                    {...field} 
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className='mb-3'>
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="Category slug" 
                                                    {...field} 
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Category'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}

export default AddCategory
