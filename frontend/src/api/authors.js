import { apiRequest } from './client';

export const getAuthors = async ({ search = '', skip = 0, limit = 100 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('skip', String(skip));
  params.set('limit', String(limit));
  return apiRequest(`/authors?${params.toString()}`);
};

export const createAuthor = async (authorName) => {
  return apiRequest('/authors/', {
    method: 'POST',
    body: JSON.stringify({ author_name: authorName }),
  });
};

const parseAuthorNames = (csv) => {
  if (!csv) return [];
  const names = String(csv)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  const seen = new Set();
  const deduped = [];
  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(name);
  }
  return deduped;
};

export const ensureAuthorsExist = async (csvNames) => {
  const names = parseAuthorNames(csvNames);
  if (!names.length) return;

  const existing = await getAuthors({ limit: 100 });
  const existingSet = new Set(
    (Array.isArray(existing) ? existing : [])
      .map((item) => String(item.author_name || '').trim().toLowerCase())
      .filter(Boolean),
  );

  for (const name of names) {
    if (existingSet.has(name.toLowerCase())) continue;
    await createAuthor(name);
    existingSet.add(name.toLowerCase());
  }
};
