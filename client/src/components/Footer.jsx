import { useSiteSettings } from '@/context/SiteSettingsContext';

const Footer = () => {
    const { settings } = useSiteSettings();
    const footerText = settings?.footerText;

    return (
        <div className='text-sm text-center bg-gray-50 py-4'>
            {footerText}
        </div>
    );
};

export default Footer