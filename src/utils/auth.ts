import Cookies from 'js-cookie';

import type { User } from '@/utils/types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export const auth = {
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 1, secure: true, sameSite: 'strict' });
  },
  getToken: () => {
    return Cookies.get(TOKEN_KEY);
  },
  setRefreshToken: (refreshToken: string) => {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
  },
  getRefreshToken: () => {
    return Cookies.get(REFRESH_TOKEN_KEY);
  },
  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  logout: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },
  isAuthenticated: () => {
    return !!Cookies.get(TOKEN_KEY);
  },
};
