import BlogCard from '@/components/BlogCard'
import Loading from '@/components/Loading'
import { getEnv } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import { RouteSignIn } from '@/helpers/RouteName'
import { Link } from 'react-router-dom'
import React from 'react'
import { FaArrowRight, FaBookOpen, FaLayerGroup, FaPenNib, FaUsers } from 'react-icons/fa6'

const Index = () => {
    const { data: blogData, loading, error } = useFetch(`${getEnv('VITE_API_BASE_URL')}/blog/blogs`, {
        method: 'get',
        credentials: 'include'
    })
   
    const blogs = blogData?.blog || []
    const uniqueAuthors = new Set(blogs.map(b => b.author?._id)).size
    const uniqueCategories = new Set(blogs.map(b => b.category?.name)).size
    const { settings } = useSiteSettings()
    const siteName = settings?.websiteName || 'Our Blog'

    if (loading) return <Loading />
    return (
        <div className='space-y-14'>
            {/* ---------- HERO: animated gradient + floating 3D shapes ---------- */}
            <section className='tilt-scene relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-2xl shadow-violet-500/30'>
                {/* decorative 3D shapes */}
                <div className='animate-pulse-glow absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl' aria-hidden='true' />
                <div className='animate-pulse-glow animation-delay-1000 absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl' aria-hidden='true' />
                <div className='animate-float absolute right-[15%] top-10 hidden h-16 w-16 rounded-2xl border border-white/40 bg-white/10 backdrop-blur-sm md:block' aria-hidden='true' />
                <div className='animate-float-rev absolute bottom-10 right-[8%] hidden h-20 w-20 items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur-md md:flex' aria-hidden='true'>
                    <FaBookOpen size={28} className="text-white/90" />
                </div>
                <div className='animate-spin-slow absolute left-[45%] top-1/2 hidden h-10 w-10 rotate-12 rounded-lg bg-white/20 lg:block' aria-hidden='true' />

                <div className='relative z-10 px-8 py-14 md:px-14 md:py-20 lg:max-w-[62%]'>
                    <span className='animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md'>
                        ✨ Welcome to {siteName}
                    </span>
                    <h1 className='animate-fade-up animation-delay-100 mt-5 text-4xl font-black leading-[1.1] drop-shadow-lg md:text-5xl lg:text-6xl'>
                        Discover Stories
                        <br />
                        <span className='gradient-text'>Worth Your Time</span>
                    </h1>
                    <p className='animate-fade-up animation-delay-200 mt-5 max-w-xl text-base text-white/85 md:text-lg'>
                        Fresh articles, guides and insights from our community — hand-picked and delivered straight to you.
                    </p>
                    <div className='animate-fade-up animation-delay-300 mt-8 flex flex-wrap items-center gap-4'>
                        <a
                            href='#latest-posts'
                            className='inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl'
                        >
                            Start Reading
                            <FaArrowRight size={14} />
                        </a>
                        <Link
                            to={RouteSignIn}
                            className='inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/15'
                        >
                            <FaPenNib size={14} />
                            Write With Us
                        </Link>
                    </div>

                    {/* live stats from real data */}
                    <div className='animate-fade-up animation-delay-400 mt-10 flex flex-wrap gap-10'>
                        <div>
                            <p className='text-3xl font-black'>{blogs.length}+</p>
                            <p className='text-xs uppercase tracking-wider text-white/70'>Published Posts</p>
                        </div>
                        <div>
                            <p className='flex items-center gap-2 text-3xl font-black'>
                                <FaUsers size={22} className="text-white/80" />
                                {uniqueAuthors}+
                            </p>
                            <p className='text-xs uppercase tracking-wider text-white/70'>Authors</p>
                        </div>
                        <div>
                            <p className='flex items-center gap-2 text-3xl font-black'>
                                <FaLayerGroup size={22} className="text-white/80" />
                                {uniqueCategories}+
                            </p>
                            <p className='text-xs uppercase tracking-wider text-white/70'>Categories</p>
                        </div>
                    </div>
                </div>

                {/* accent bar */}
                <div className='absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-400 to-sky-400' aria-hidden='true' />
            </section>

            {/* ---------- LATEST POSTS ---------- */}
            <section id='latest-posts' aria-label='Latest blog posts'>
                <div className='mb-8 flex items-center gap-4'>
                    <h2 className='text-3xl font-extrabold tracking-tight'>
                        Latest <span className='gradient-text'>Posts</span>
                    </h2>
                    <span className='h-1 max-w-24 flex-1 rounded-full bg-gradient-to-r from-primary to-transparent' aria-hidden='true' />
                </div>

                {blogs.length > 0
                    ?
                    <div className='grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10'>
                        {blogs.map((blog, index) => (
                            <div key={blog._id} className='animate-fade-up' style={{ animationDelay: `${Math.min(index, 8) * 90}ms` }}>
                                <BlogCard props={blog} />
                            </div>
                        ))}
                    </div>
                    :
                    <div className='tilt-scene'>
                        <div className='tilt-card rounded-2xl border-2 border-dashed border-primary/30 bg-card p-14 text-center'>
                            <p className='mb-4 text-5xl' aria-hidden='true'>🔍</p>
                            <h3 className='text-xl font-bold'>No posts yet</h3>
                            <p className='mt-2 text-muted-foreground'>Data Not Found. Check back soon — new stories are on the way!</p>
                        </div>
                    </div>
                }
            </section>
        </div>
    )
}

export default Index