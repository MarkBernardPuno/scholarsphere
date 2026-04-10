const DEFAULT_BASE_URL = 'http://localhost:8000';

const normalizeBaseUrl = (value) => {
  if (!value) return DEFAULT_BASE_URL;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL);

const defaultHeaders = { 'Content-Type': 'application/json' };

const parseResponse = async (response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
};

const extractErrorMessage = (payload) => {
  if (!payload) return 'Request failed';
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => item?.msg || JSON.stringify(item))
      .join('; ');
  }
  if (payload.detail && typeof payload.detail === 'object') {
    return payload.detail.msg || JSON.stringify(payload.detail);
  }
  return payload.detail || payload.message || 'Request failed';
};

export const apiRequest = async (path, { method = 'GET', headers = {}, body } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body,
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new Error(extractErrorMessage(payload));
  }
  return payload;
};
