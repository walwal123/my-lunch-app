import { cookies } from 'next/headers';

export function getUserFromCookies() {
    const cookieStore = cookies();
    const user_name = cookieStore.get('user_name')?.value;
    return user_name || null;
}