import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface AuthToken {
    sub: string;
    role: string;
    admin_id: number;
    exp: number;
}

interface UserInfo {
    name: string;
    role: string;
    admin_id: number;
    require_2fa: boolean;
}

export const setAuth = (token: string, userInfo: UserInfo) => {
    Cookies.set('token', token, { expires: 7 }); // token 保存7天
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

export const getAuth = () => {
    const token = Cookies.get('token');
    const userInfo = localStorage.getItem('userInfo');
    return {
        token,
        userInfo: userInfo ? JSON.parse(userInfo) : null,
    };
};

export const removeAuth = () => {
    Cookies.remove('token');
    localStorage.removeItem('userInfo');
};

export const isTokenValid = () => {
    const token = Cookies.get('token');
    if (!token) return false;

    try {
        const decoded = jwtDecode<AuthToken>(token);
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const getUserInfo = (): UserInfo | null => {
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}; 