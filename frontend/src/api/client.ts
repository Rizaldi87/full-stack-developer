import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import type { ApiError, ApiRsp, TokenPair } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccess();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<ApiRsp<TokenPair>>(`${BASE_URL}/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = data.data;
    tokenStorage.set(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;

    const isAuthCall = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const accessToken = await refreshPromise;
      refreshPromise = null;

      if (accessToken) {
        original.headers.set("Authorization", `Bearer ${accessToken}`);
        return api(original as InternalAxiosRequestConfig);
      }

      window.location.href = "/login";
    }

    throw error;
  },
);

export function getErrorMessage(error: unknown, fallback = "Something wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }
  return fallback;
}
