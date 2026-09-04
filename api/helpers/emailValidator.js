const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'mailinator.com', 'yopmail.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com',
    'guerrillamailblock.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
    'sharklasers.com', 'grr.la', 'dispostable.com', 'getairmail.com', 'trashmail.com',
    'maildrop.cc', 'mintemail.com', 'mailnesia.com', 'mailcatch.com', 'temp-mail.org',
    'throwawaymail.com', 'getnada.com', 'boun.cr', 'generator.email', 'envelope.ee',
    'crazymailing.com', 'fakemailgenerator.com', 'tempail.com', 'disposable.com',
    'spamgourmet.com', 'mailexpire.com', 'mytrashmail.com', 'tempemail.co', 'disposableinbox.com',
    'guerillamail.info', 'guerillamail.biz', 'guerillamail.com', 'guerillamail.de',
    'guerillamail.net', 'guerillamail.org', 'guerillamailblock.com', 'pokemail.net',
    'tempmail.net', 'quickmail.nl', 'superrito.com', 'armyspy.com', 'cuvox.de', 'dayrep.com',
    'fleckens.hu', 'gustr.com', 'rhyta.com', 'teleworm.us', 'yopmail.fr', 'yopmail.net',
    'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 'mega.zipe.at',
    'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf', 'monpseudo.fr.nf',
    'mymail.infos.st', 'mailgenerator.biz', 'emailgenerator.pro', 'disposable-email.com',
    'tempmailaddress.com', 'internetspam.com', 'inboxkitten.com', 'temp-mail.ru',
    'tempmail.plus', 'temp-mail.io', 'mail.tm', 'mail.gw', 'tempmail.dev', 'tmpmail.org',
    'tmpmail.net', 'scryptmail.com', 'burnermail.io', 'dropmail.me', 'mohmal.com',
    'tempmailo.com', 'owlymail.com', '10minutemail.co.za', '10minutemail.net', '20minutemail.com',
    'tempmailfree.com', 'tmail.ws', 'tmail.cc', 'tmail.net', 'vps-server.xyz', 'spam4.me',
    'boximail.com', 'fakeinbox.com', 'discards.co', 'maildu.de', 'trbvm.com', 'mamber.net',
    'tempr.email', 'anonaddy.com', 'anonaddy.me', 'duck.com', 'mozmail.com', 'simplelogin.com',
    'simplelogin.co', 'disroot.org', 'skiff.com', 'relay.firefox.com', 'fastmail.com'
]);

export const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email is required and must be a string.' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Standard strict email format regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: 'Please provide a valid email address.' };
    }

    const domain = trimmedEmail.split('@')[1];
    if (!domain) {
        return { isValid: false, error: 'Invalid email domain.' };
    }

    // Check if the domain is a known disposable email domain
    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
        return { isValid: false, error: 'Disposable or temporary email addresses are not allowed.' };
    }

    // Additional check for common spam patterns in domains
    if (domain.includes('tempmail') || domain.includes('disposable') || domain.includes('throwaway') || domain.includes('10min')) {
        return { isValid: false, error: 'Disposable or temporary email addresses are not allowed.' };
    }

    return { isValid: true };
};
