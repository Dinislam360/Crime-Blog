import BlogCard from '@/components/BlogCard'
import { getEnv } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'
import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { IoSearchSharp } from "react-icons/io5";

const SearchResult = () => {
    const [searchParams] = useSearchParams()
    const q = searchParams.get('q')
    const { data: blogData, loading, error } = useFetch(`${getEnv('VITE_API_BASE_URL')}/blog/search?q=${q}`, {
        method: 'get',
        credentials: 'include'
    })

    return (
        <>
            <div className='mb-10 flex items-center gap-4'>
                <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30'>
                    <IoSearchSharp size={24} />
                </span>
                <div className='min-w-0'>
                    <h1 className='text-2xl font-extrabold tracking-tight md:text-3xl'>
                        Search results for: <span className='gradient-text'>{q}</span>
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        {blogData ? `${blogData.blog?.length || 0} post(s) found` : 'Searching…'}
                    </p>
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
                            <p className='mb-4 text-5xl' aria-hidden='true'>🔍</p>
                            <h3 className='text-xl font-bold'>Nothing found</h3>
                            <p className='mt-2 text-muted-foreground'>Data Not Found. Try a different keyword!</p>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default SearchResult