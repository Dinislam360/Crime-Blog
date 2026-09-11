import { useSiteSettings } from '@/context/SiteSettingsContext';
import { FaHeart } from 'react-icons/fa6';

const Footer = () => {
    const { settings } = useSiteSettings();
    const footerText = settings?.footerText;
    const siteName = settings?.websiteName || 'My Blog';

    return (
        <footer className='border-t bg-gray-50/80 backdrop-blur-sm'>
            {/* gradient accent bar */}
            <div className='h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-sky-500' aria-hidden='true' />
            <div className='mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-5 py-6 text-sm'>
                <p className='flex items-center gap-2 text-center font-medium'>
                    {footerText || siteName}
                    <FaHeart className='text-rose-500' size={12} aria-hidden='true' />
                </p>
            </div>
        </footer>
    );
};

export default Footer