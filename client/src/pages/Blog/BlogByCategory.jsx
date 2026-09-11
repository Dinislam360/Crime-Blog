import BlogCard from '@/components/BlogCard'
import Loading from '@/components/Loading'
import { getEnv } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'
import React from 'react'
import { useParams } from 'react-router-dom'
import { BiCategory } from "react-icons/bi";
const BlogByCategory = () => {
    const { category } = useParams()
    const { data: blogData, loading, error } = useFetch(`${getEnv('VITE_API_BASE_URL')}/blog/get-blog-by-category/${category}`, {
        method: 'get',
        credentials: 'include'
    }, [category])

    if (loading) return <Loading />
    return (
        <>
            <div className='mb-10 flex items-center gap-4'>
                <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'>
                    <BiCategory size={24} />
                </span>
                <div className='min-w-0'>
                    <h1 className='text-2xl font-extrabold tracking-tight md:text-3xl'>
                        {blogData && blogData.categoryData?.name}
                    </h1>
                    <p className='text-sm text-muted-foreground'>Browsing all posts in this category</p>
                </div>
                <span className='h-1 max-w-24 flex-1 rounded-full bg-gradient-to-r from-primary to-transparent' aria-hidden='true' />
            </div>
            <div className='grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10'>
                {blogData && blogData.blog.length > 0
                    ?
                    blogData.blog.map((blog, index) => (
                        <div key={blog._id} className='animate-fade-up' style={{ animationDelay: `${Math.min(index, 8) * 90}ms` }}>
                            <BlogCard props={blog} />
                        </div>
                    ))
                    :
                    <div className='tilt-scene sm:col-span-2 md:col-span-3'>
                        <div className='tilt-card rounded-2xl border-2 border-dashed border-primary/30 bg-card p-14 text-center'>
                            <p className='mb-4 text-5xl' aria-hidden='true'>📂</p>
                            <h3 className='text-xl font-bold'>No posts in this category yet</h3>
                            <p className='mt-2 text-muted-foreground'>Data Not Found. New stories are coming soon!</p>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default BlogByCategory