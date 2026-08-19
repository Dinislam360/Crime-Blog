import Comment from '@/components/Comment'
import CommentCount from '@/components/CommentCount'
import CommentList from '@/components/CommentList'
import LikeCount from '@/components/LikeCount'
import Loading from '@/components/Loading'
import RelatedBlog from '@/components/RelatedBlog'
import { Avatar } from '@/components/ui/avatar'
import { getEnv } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'
import { AvatarImage } from '@radix-ui/react-avatar'
import { decode } from 'entities'
import moment from 'moment'
import React from 'react'
import { useParams } from 'react-router-dom'

const SingleBlogDetails = () => {
    const { blog, category } = useParams()

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

        <div className='md:flex-nowrap flex-wrap flex justify-between gap-20'>
            {data && data.blog &&
                <div className='md:w-[70%] w-full flex flex-col gap-10'>
                    <div className='border rounded p-5'>
                        <h1 className='text-2xl font-bold mb-5'>{data.blog.title}</h1>
                        <div className='flex justify-between items-center'>
                            <div className='flex justify-between items-center gap-5'>
                                <Avatar>
                                    <AvatarImage src={data.blog.author.avatar} />
                                </Avatar>
                                <div>
                                    <p className='font-bold'>{data.blog.author.name}</p>
                                    <p>Date: {moment(data.blog.createdAt).format('DD-MM-YYYY')}</p>
                                </div>
                            </div>
                            <div className='flex justify-between items-center gap-5'>
                                <LikeCount props={{ blogid: data.blog._id }} />
                                <CommentCount props={{ blogid: data.blog._id }} />
                            </div>
                        </div>
                        <div className='my-5'>
                            <img src={data.blog.featuredImage} className='rounded' />
                        </div>
                        <div className="ql-container ql-snow" style={{ border: 'none' }}>
                            <div className="ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: decode(data.blog.blogContent) || '' }}>

                            </div>
                        </div>
                    </div>

                    <div className='border-t pt-5'>
                        <Comment props={{ blogid: data.blog._id }} />
                    </div>
                </div>

            }
            <div className='border rounded md:w-[30%] w-full p-5 h-fit'>
                <RelatedBlog props={{ category: category, currentBlog: blog }} />
            </div>
        </div>
    )
}

export default SingleBlogDetails