import Comment from '@/components/Comment'
import CommentCount from '@/components/CommentCount'
import CommentList from '@/components/CommentList'
import LikeCount from '@/components/LikeCount'
import Loading from '@/components/Loading'
import RelatedBlog from '@/components/RelatedBlog'
import BlogContentWithAds from '@/components/BlogContentWithAds'
import { Avatar } from '@/components/ui/avatar'
import { getEnv } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import { AvatarImage } from '@radix-ui/react-avatar'
import moment from 'moment'
import React from 'react'
import { useParams } from 'react-router-dom'

const SingleBlogDetails = () => {
    const { blog, category } = useParams()
    const { settings } = useSiteSettings()

    const { data, loading, error } = useFetch(`${getEnv('VITE_API_BASE_URL')}/blog/get-blog/${blog}`, {
        method: 'get',
        credentials: 'include',
    }, [blog, category])

    React.useEffect(() => {
        if (data && data.blog) {
            const blogData = data.blog;
            const title = blogData.metaTitle || blogData.title;
            const description = blogData.metaDescription || '';
            const imageUrl = blogData.featuredImage || '';
            const currentUrl = window.location.href;

            // 1. Update document title
            document.title = title;

            // 2. Helper to set/update meta tag
            const setMetaTag = (attrName, attrValue, contentValue) => {
                let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
                if (!el) {
                    el = document.createElement('meta');
                    el.setAttribute(attrName, attrValue);
                    document.head.appendChild(el);
                }
                el.setAttribute('content', contentValue);
            };

            // 3. Set standard and Open Graph / Twitter tags
            setMetaTag('name', 'description', description);
            setMetaTag('property', 'og:title', title);
            setMetaTag('property', 'og:description', description);
            setMetaTag('property', 'og:image', imageUrl);
            setMetaTag('property', 'og:url', currentUrl);
            setMetaTag('property', 'og:type', 'article');
            setMetaTag('name', 'twitter:card', 'summary_large_image');
            setMetaTag('name', 'twitter:title', title);
            setMetaTag('name', 'twitter:description', description);
            setMetaTag('name', 'twitter:image', imageUrl);
        }
    }, [data]);

    if (loading) return <Loading />
    return (

        <div className='md:flex-nowrap flex-wrap flex justify-between gap-10 lg:gap-20'>
            {data && data.blog &&
                <div className='md:flex-1 w-full min-w-0 flex flex-col gap-10'>
                    <article className='gradient-border rounded-2xl border p-6 shadow-sm md:p-8'>
                        <h1 className='mb-5 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl'>
                            {data.blog.title}
                        </h1>
                        <div className='flex flex-wrap items-center justify-between gap-4'>
                            <div className='flex items-center gap-3'>
                                <Avatar className="ring-2 ring-primary/30 ring-offset-2">
                                    <AvatarImage src={data.blog.author.avatar} alt={data.blog.author.name} />
                                </Avatar>
                                <div>
                                    <p className='font-bold leading-tight'>{data.blog.author.name}</p>
                                    <p className='text-sm text-muted-foreground'>
                                        Date: {moment(data.blog.createdAt).format('DD-MM-YYYY')}
                                    </p>
                                </div>
                            </div>
                            <div className='flex items-center gap-5'>
                                <LikeCount props={{ blogid: data.blog._id }} />
                                <CommentCount props={{ blogid: data.blog._id }} />
                            </div>
                        </div>
                        <div className='zoom-img my-6 overflow-hidden rounded-2xl shadow-lg'>
                            <img
                                src={data.blog.featuredImage}
                                alt={data.blog.title}
                                decoding="async"
                                className='w-full h-auto max-h-[500px] object-cover'
                            />
                        </div>
                        {/* Blog body with Middle Banner (middle of post) + Native Banner (end of post).
                            Both are fully responsive and controlled from Site Settings → Ads. */}
                        <BlogContentWithAds
                            html={data.blog.blogContent}
                            middleBannerCode={settings?.ads?.middleBanner?.enabled ? settings?.ads?.middleBanner?.code : ''}
                            nativeBannerCode={settings?.ads?.nativeBanner?.enabled ? settings?.ads?.nativeBanner?.code : ''}
                        />
                    </article>

                    <div className='border-t pt-5'>
                        <Comment props={{ blogid: data.blog._id }} />
                    </div>
                </div>

            }
            <aside className='gradient-border h-fit w-full rounded-2xl border bg-card/50 p-6 md:w-[30%] md:shrink-0'>
                <RelatedBlog props={{ category: category, currentBlog: blog }} />
            </aside>
        </div>
    )
}

export default SingleBlogDetails