import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_URL } from '@/constants';

interface RequestOptions<D = unknown> {
  url: string;
  payload?: D;
  config?: AxiosRequestConfig;
}

// Module-level token holder — set by the auth-sync component in the root layout
// once Clerk's session is ready. The interceptor reads it on every request.
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

function buildInstance(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(async (config) => {
    if (_getToken) {
      const token = await _getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return instance;
}

export function clientRequestGateway(baseURL = API_URL) {
  const instance = buildInstance(baseURL);

  return {
    get: <T>({ url, config }: RequestOptions) =>
      instance.get<T>(url, config),

    post: <T, D = unknown>({ url, payload, config }: RequestOptions<D>) =>
      instance.post<T>(url, payload, config),

    patch: <T, D = unknown>({ url, payload, config }: RequestOptions<D>) =>
      instance.patch<T>(url, payload, config),

    put: <T, D = unknown>({ url, payload, config }: RequestOptions<D>) =>
      instance.put<T>(url, payload, config),

    delete: <T>({ url, config }: RequestOptions) =>
      instance.delete<T>(url, config),
  };
}
