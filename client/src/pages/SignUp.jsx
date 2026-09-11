import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React from 'react'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Card } from '@/components/ui/card'
import { RouteSignIn } from '@/helpers/RouteName'
import { Link, useNavigate } from 'react-router-dom'
import { getEnv } from '@/helpers/getEnv'
import { showToast } from '@/helpers/showToast'
import GoogleLogin from '@/components/GoogleLogin'

const SignUp = () => {

    const navigate = useNavigate()

    const formSchema = z.object({
        name: z.string().min(3, 'Name must be at least 3 character long.'),
        email: z.string().email(),
        // Must match the server-side policy in api/controllers/Auth.controller.js:
        // at least 8 characters, with at least one letter and one number.
        password: z.string().min(8, 'Password must be at least 8 character long').regex(
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
            'Password must contain at least one letter and one number.'
        ),
        confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
        message: 'Password and confirm password should be same.',
        path: ['confirmPassword']
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    async function onSubmit(values) {
        try {
            const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/auth/register`, {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(values)
            })
            const data = await response.json()
            if (!response.ok) {
                return showToast('error', data.message)
            }

            navigate(RouteSignIn)
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
                <h1 className='text-2xl font-extrabold tracking-tight text-center mb-6'>Create Your <span className='gradient-text'>Account</span></h1>
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
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                        <div className='mb-3'>
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter  password again" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='mt-5'>
                            <Button type="submit" className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-500/30 transition-all hover:shadow-lg">Sign Up</Button>
                            <div className='mt-5 text-sm flex justify-center items-center gap-2'>
                                <p>Already have account?</p>
                                <Link className='font-semibold text-primary hover:underline' to={RouteSignIn}>Sign In</Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </Card>

        </div>
    )
}

export default SignUp
