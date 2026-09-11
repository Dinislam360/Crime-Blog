import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React from 'react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card } from '@/components/ui/card'
import { RouteIndex, RouteSignUp } from '@/helpers/RouteName'
import { Link, useNavigate } from 'react-router-dom'
import { showToast } from '@/helpers/showToast'
import { getEnv } from '@/helpers/getEnv'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/user/user.slice'
import GoogleLogin from '@/components/GoogleLogin'
import Logo from '@/components/Logo'
import { useSiteSettings } from '@/context/SiteSettingsContext'

const SignIn = () => {
    const { settings } = useSiteSettings()

    const dispath = useDispatch()

    const navigate = useNavigate()
    const formSchema = z.object({
        email: z.string().email(),
        password: z.string().min(3, 'Password field  required.')
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })


    async function onSubmit(values) {
        try {
            const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/auth/login`, {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(values)
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }
            dispath(setUser(data.user))
            navigate(RouteIndex)
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.message)
        }
    }

    return (
        <div className='tilt-scene relative flex min-h-screen w-screen items-center justify-center overflow-hidden px-4'>
            {/* ambient 3D background blobs */}
            <div className='animate-pulse-glow absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-violet-400/20 blur-3xl' aria-hidden='true' />
            <div className='animate-pulse-glow animation-delay-1000 absolute bottom-[-15%] right-[-10%] h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl' aria-hidden='true' />
            <Card className="tilt-card gradient-border w-[400px] rounded-2xl p-8 shadow-2xl shadow-violet-500/10">
                <div className='flex justify-center items-center mb-2'>
                    <Link to={RouteIndex} className="flex items-center">
                        <Logo />
                    </Link>
                </div>
                <h1 className='text-2xl font-extrabold tracking-tight text-center mb-6'>Welcome <span className='gradient-text'>Back</span></h1>
                <div className=''>
                    <GoogleLogin />
                    <div className='relative my-6 flex justify-center items-center'>
                        <span className='absolute inset-x-0 top-1/2 border-t' aria-hidden='true' />
                        <span className='relative bg-card px-4 text-sm font-medium text-muted-foreground'>Or continue with email</span>
                    </div>

                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}  >
                        <div className='mb-3'>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className='mb-3'>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='mt-5'>
                            <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-500/30 transition-all hover:shadow-lg">Sign In</Button>
                            <div className='mt-5 text-sm flex justify-center items-center gap-2'>
                                <p>Don&apos;t have account?</p>
                                <Link className='font-semibold text-primary hover:underline' to={RouteSignUp}>Sign Up</Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </Card>

        </div>
    )
}

export default SignIn