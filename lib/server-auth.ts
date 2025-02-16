import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface Token {
    role: string;
    userId: string;
    exp: number;
}

export async function getToken(): Promise<Token | null> {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return null;
        }

        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(JWT_SECRET)
        );

        return payload as Token;
    } catch (error) {
        return null;
    }
} 