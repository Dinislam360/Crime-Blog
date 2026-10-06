import AppSidebar from '@/components/AppSidebar'
import Footer from '@/components/Footer'
import GlobalAds from '@/components/GlobalAds'
import Topbar from '@/components/Topbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (

        <SidebarProvider>
            <GlobalAds />
            <Topbar />
            <AppSidebar />
            <main className='flex-1 min-w-0 overflow-x-clip'>
                <div className='w-full min-h-[calc(100vh-45px)] py-28  px-10'>
                    <Outlet />
                </div>
                <Footer />
            </main>
        </SidebarProvider>
    )
}

export default Layout