import { apiRequest } from './client';

export const INDEXING_STORAGE_KEY = 'scholarSphereIndexingSettings';

export const getIndexingOptions = () => {
  try {
    const raw = localStorage.getItem(INDEXING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const seen = new Set();
    return parsed
      .map((item) => String(item?.name ?? item ?? '').trim())
      .filter(Boolean)
      .filter((name) => {
        const key = name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  } catch {
    return [];
  }
};

const CONFIG = {
  Author: {
    endpoint: '/authors',
    idKey: 'author_id',
    nameKey: 'author_name',
    extraKey: null,
    createPayload: ({ name }) => ({ author_name: name }),
    updatePayload: ({ name }) => ({ author_name: name }),
  },
  Campus: {
    endpoint: '/lookups/campuses',
    idKey: 'campus_id',
    nameKey: 'campus_name',
    extraKey: null,
    createPayload: ({ name }) => ({ campus_name: name }),
    updatePayload: ({ name }) => ({ campus_name: name }),
  },
  College: {
    endpoint: '/lookups/colleges',
    idKey: 'college_id',
    nameKey: 'college_name',
    extraKey: 'campus_id',
    createPayload: ({ name, extra }) => ({ college_name: name, campus_id: Number(extra), is_graduate: false }),
    updatePayload: ({ name, extra }) => ({ college_name: name, campus_id: Number(extra), is_graduate: false }),
  },
  Department: {
    endpoint: '/lookups/departments',
    idKey: 'department_id',
    nameKey: 'department_name',
    extraKey: 'college_id',
    createPayload: ({ name, extra }) => ({ department_name: name, college_id: Number(extra) }),
    updatePayload: ({ name, extra }) => ({ department_name: name, college_id: Number(extra) }),
  },
  'Research Output': {
    endpoint: '/lookups/research-output-types',
    idKey: 'output_type_id',
    nameKey: 'output_type_name',
    extraKey: null,
    createPayload: ({ name }) => ({ output_type_name: name }),
    updatePayload: ({ name }) => ({ output_type_name: name }),
  },
  Research: {
    endpoint: '/lookups/research-types',
    idKey: 'research_type_id',
    nameKey: 'research_type_name',
    extraKey: null,
    createPayload: ({ name }) => ({ research_type_name: name }),
    updatePayload: ({ name }) => ({ research_type_name: name }),
  },
  Role: {
    endpoint: '/lookups/roles',
    idKey: 'role_id',
    nameKey: 'role_name',
    extraKey: null,
    createPayload: ({ name }) => ({ role_name: name }),
    updatePayload: ({ name }) => ({ role_name: name }),
  },
  'School Year': {
    endpoint: '/lookups/school-years',
    idKey: 'school_year_id',
    nameKey: 'year_label',
    extraKey: null,
    createPayload: ({ name }) => ({ year_label: name }),
    updatePayload: ({ name }) => ({ year_label: name }),
  },
  Semester: {
    endpoint: '/lookups/semesters',
    idKey: 'semester_id',
    nameKey: 'name',
    extraKey: null,
    createPayload: ({ name }) => ({ name }),
    updatePayload: ({ name }) => ({ name }),
  },
  Status: {
    endpoint: '/lookups/status',
    idKey: 'status_id',
    nameKey: 'status_name',
    extraKey: null,
    createPayload: ({ name }) => ({ status_name: name }),
    updatePayload: ({ name }) => ({ status_name: name }),
  },
  'Statuses and Remarks': {
    endpoint: '/lookups/statuses-and-remarks',
    idKey: 'statuses_and_remarks_id',
    nameKey: 'statuses_and_remarks_name',
    extraKey: null,
    createPayload: ({ name }) => ({ statuses_and_remarks_name: name }),
    updatePayload: ({ name }) => ({ statuses_and_remarks_name: name }),
  },
};

const getConfig = (menu) => {
  const cfg = CONFIG[menu];
  if (!cfg) throw new Error(`Unsupported settings type: ${menu}`);
  return cfg;
};

export const listSettings = async (menu) => {
  const cfg = getConfig(menu);
  return apiRequest(`${cfg.endpoint}?skip=0&limit=100`);
};

export const createSetting = async (menu, values) => {
  const cfg = getConfig(menu);
  return apiRequest(cfg.endpoint, {
    method: 'POST',
    body: JSON.stringify(cfg.createPayload(values)),
  });
};

export const updateSetting = async (menu, id, values) => {
  const cfg = getConfig(menu);
  return apiRequest(`${cfg.endpoint}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cfg.updatePayload(values)),
  });
};

export const deleteSetting = async (menu, id) => {
  const cfg = getConfig(menu);
  return apiRequest(`${cfg.endpoint}/${id}`, { method: 'DELETE' });
};

export const normalizeSettingRows = (menu, rows) => {
  const cfg = getConfig(menu);
  const data = Array.isArray(rows) ? rows : [];
  return data.map((row) => ({
    id: row[cfg.idKey],
    name: row[cfg.nameKey] ?? '',
    extra: cfg.extraKey ? row[cfg.extraKey] ?? '' : '',
  }));
};

export const getSettingsMeta = (menu) => {
  const cfg = getConfig(menu);
  if (!cfg.extraKey) {
    return { extraLabel: null, extraPlaceholder: '' };
  }
  if (cfg.extraKey === 'campus_id') {
    return { extraLabel: 'Campus ID', extraPlaceholder: 'e.g. 1' };
  }
  if (cfg.extraKey === 'college_id') {
    return { extraLabel: 'College ID', extraPlaceholder: 'e.g. 1' };
  }
  if (cfg.extraKey === 'status_id') {
    return { extraLabel: 'Status', extraPlaceholder: 'Select status' };
  }
  return { extraLabel: cfg.extraKey, extraPlaceholder: '' };
};

const asArray = (payload, key) => {
  if (Array.isArray(payload)) return payload;
  const keyed = payload?.[key];
  return Array.isArray(keyed) ? keyed : [];
};

export const fetchStatusList = async () => {
  const payload = await apiRequest('/lookups/status?skip=0&limit=100');
  return asArray(payload, 'status').map((row) => ({
    id: row.status_id,
    name: row.status_name ?? '',
    extra: '',
  }));
};

export const createStatus = async ({ name }) => {
  return apiRequest('/lookups/status', {
    method: 'POST',
    body: JSON.stringify({ status_name: name }),
  });
};

export const updateStatus = async (id, { name }) => {
  return apiRequest(`/lookups/status/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status_name: name }),
  });
};

export const deleteStatus = async (id) => {
  return apiRequest(`/lookups/status/${id}`, { method: 'DELETE' });
};

export const fetchStatusesAndRemarksList = async () => {
  const payload = await apiRequest('/lookups/statuses-and-remarks?skip=0&limit=100');
  return asArray(payload, 'statuses_and_remarks').map((row) => ({
    id: row.statuses_and_remarks_id,
    name: row.statuses_and_remarks_name ?? '',
    extra: '',
  }));
};

export const createStatusesAndRemarks = async ({ name }) => {
  return apiRequest('/lookups/statuses-and-remarks', {
    method: 'POST',
    body: JSON.stringify({ statuses_and_remarks_name: name }),
  });
};

export const updateStatusesAndRemarks = async (id, { name }) => {
  return apiRequest(`/lookups/statuses-and-remarks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ statuses_and_remarks_name: name }),
  });
};

export const deleteStatusesAndRemarks = async (id) => {
  return apiRequest(`/lookups/statuses-and-remarks/${id}`, { method: 'DELETE' });
};
