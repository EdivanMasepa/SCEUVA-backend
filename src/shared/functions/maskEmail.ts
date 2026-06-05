export function maskEmail(email: string): string {
    const [username, domain] = email.split('@');

    if (username.length <= 3) {
        return `${username[0]}***@${domain}`;
    }

    const firstTwo = username.substring(0, 2);
    const lastChar = username.substring(username.length - 1);

    const masked = '*'.repeat(username.length - 3);

    return `${firstTwo}${masked}${lastChar}@${domain}`;
}   