import React from 'react'

const Loading = () => {
    return (
        <div className='glass fixed inset-0 z-50 flex h-screen w-screen items-center justify-center'>
            {/* Pure-CSS animated loader (no image) */}
            <div className='relative flex h-20 w-20 items-center justify-center'>
                {/* outer spinning ring */}
                <div className='absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary' aria-hidden='true' />
                {/* inner counter-spinning ring */}
                <div className='absolute inset-3 animate-spin rounded-full border-4 border-fuchsia-500/20 border-b-fuchsia-500 [animation-direction:reverse]' aria-hidden='true' />
                {/* pulsing center dot */}
                <span className='h-2.5 w-2.5 animate-ping rounded-full bg-primary' aria-hidden='true' />
            </div>
        </div>
    )
}

export default Loading