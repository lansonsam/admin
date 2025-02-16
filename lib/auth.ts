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

// 检查是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

// 客户端函数
export const setAuth = (token: string, userInfo: UserInfo) => {
    if (!isBrowser) return;
    Cookies.set('token', token, { expires: 7 }); // token 保存7天
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

export const getAuth = () => {
    if (!isBrowser) {
        return {
            token: null,
            userInfo: null,
        };
    }
    const token = Cookies.get('token');
    const userInfo = localStorage.getItem('userInfo');
    return {
        token,
        userInfo: userInfo ? JSON.parse(userInfo) : null,
    };
};

export const removeAuth = () => {
    if (!isBrowser) return;
    Cookies.remove('token');
    localStorage.removeItem('userInfo');
};

export const isTokenValid = () => {
    if (!isBrowser) return false;
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
    if (!isBrowser) return null;
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
};

// 客户端管理员验证
export const verifyAdmin = async () => {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    return userInfo.role === 'admin';
};

// 服务器端函数
export const verifyTokenAndAdmin = (token: string | undefined): {
    isValid: boolean;
    error?: string;
} => {
    if (!token) {
        return { isValid: false, error: '未登录' };
    }

    try {
        const decoded = jwtDecode<AuthToken>(token);

        // 检查token是否过期
        if (decoded.exp * 1000 <= Date.now()) {
            return { isValid: false, error: 'token已过期' };
        }

        // 检查是否是管理员
        if (decoded.role !== 'admin') {
            return { isValid: false, error: '需要管理员权限' };
        }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: '无效的token' };
    }
}; 