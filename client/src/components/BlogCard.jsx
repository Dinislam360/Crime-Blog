import React from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from "@/components/ui/badge"
import { Avatar } from './ui/avatar'
import { AvatarImage } from '@radix-ui/react-avatar'
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import usericon from '@/assets/images/user.png'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { RouteBlogDetails } from '@/helpers/RouteName'
const BlogCard = ({ props }) => {

    return (
        <Link
            to={RouteBlogDetails(props.category.slug, props.slug)}
            aria-label={props.title}
            className="tilt-scene group block h-full rounded-xl"
        >
            <Card className="tilt-card gradient-border shine h-full overflow-hidden pt-0 shadow-sm transition-shadow hover:shadow-2xl hover:shadow-violet-500/20">
                {/* Featured image — full width, lazy loaded, zooms on hover */}
                <div className='zoom-img relative h-44 overflow-hidden'>
                    <img
                        src={props.featuredImage}
                        alt={props.title}
                        loading="lazy"
                        decoding="async"
                        className='h-44 w-full object-cover'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' aria-hidden='true' />
                    {props.author.role === 'admin' &&
                        <Badge className="absolute top-3 right-3 rounded-full border-none bg-violet-500 text-white shadow-lg">Admin</Badge>
                    }
                    {props.category?.name &&
                        <Badge className="absolute bottom-3 left-3 rounded-full border-none bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30">
                            {props.category.name}
                        </Badge>
                    }
                </div>

                <CardContent className="pt-4">
                    {/* Author + date row */}
                    <div className='flex items-center justify-between gap-2'>
                        <div className='flex min-w-0 items-center gap-2'>
                            <Avatar className="ring-2 ring-primary/30 ring-offset-2">
                                <AvatarImage src={props.author.avatar || usericon} />
                            </Avatar>
                            <span className='truncate text-sm font-semibold'>{props.author.name}</span>
                        </div>
                        <span className='flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground'>
                            <FaRegCalendarAlt className="text-primary" />
                            {moment(props.createdAt).format('DD-MM-YYYY')}
                        </span>
                    </div>

                    <h2 className='mt-3 text-xl font-extrabold leading-snug line-clamp-2 transition-colors duration-300 group-hover:text-primary'>
                        {props.title}
                    </h2>

                    <div className='mt-4 flex items-center gap-1.5 text-sm font-bold text-primary'>
                        Read More
                        <FaArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>

                </CardContent>
            </Card>
        </Link>
    )
}

export default BlogCard