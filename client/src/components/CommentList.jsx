import { getEnv } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'

import React, { useState } from 'react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import usericon from '@/assets/images/user.png'
import moment from 'moment'
import { useSelector } from 'react-redux'

const CommentList = ({ props }) => {
    const user = useSelector(state => state.user)
    const [page, setPage] = useState(1)

    const { data, loading, error } = useFetch(`${getEnv('VITE_API_BASE_URL')}/comment/get/${props.blogid}?page=${page}&limit=20`, {
        method: 'get',
        credentials: 'include',
    }, [page])

    if (loading) return <div>Loading...</div>

    const totalCommentsCount = data ? (data.totalComments !== undefined ? data.totalComments : data.comments?.length || 0) : 0;

    return (
        <div>
            <h4 className='text-2xl font-bold'>
                <span className='me-2'>
                    {totalCommentsCount + (props.newComment ? 1 : 0)}
                </span>
                Comments
            </h4>
            <div className='mt-5'>

                {props.newComment
                    &&
                    <div className='flex gap-2 mb-3'>
                        <Avatar>
                            <AvatarImage src={user?.user?.avatar || usericon} className="aspect-square h-full w-full object-cover rounded-full" />
                        </Avatar>

                        <div>
                            <p className='font-bold'>{user?.user?.name}</p>
                            <p>{moment(props.newComment?.createdAt).format('DD-MM-YYYY')}</p>
                            <div className='pt-3'>
                                {props.newComment?.comment}
                            </div>
                        </div>
                    </div>
                }


                {data && data.comments && data.comments.length > 0
                    ?
                    data.comments.map(comment => {
                        return (
                            <div key={comment._id} className='flex gap-2 mb-3'>
                                <Avatar>
                                    <AvatarImage src={comment?.user?.avatar || usericon} className="aspect-square h-full w-full object-cover rounded-full" />
                                </Avatar>

                                <div>
                                    <p className='font-bold'>{comment?.user?.name || 'Anonymous'}</p>
                                    <p>{moment(comment?.createdAt).format('DD-MM-YYYY')}</p>
                                    <div className='pt-3'>
                                        {comment?.comment}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                    :
                    (!props.newComment && <p className="text-gray-500">No comments yet.</p>)
                }

                {/* Pagination Controls */}
                {data && data.totalPages > 1 && (
                    <div className='flex items-center justify-between mt-6 pt-4 border-t'>
                        <Button
                            variant="outline"
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <span className='text-sm text-gray-600'>
                            Page {page} of {data.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setPage(prev => Math.min(prev + 1, data.totalPages))}
                            disabled={page === data.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}

            </div>
        </div>
    )
}

export default CommentList