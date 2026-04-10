import { apiRequest } from './client';

/**
 * Fetch tracking statuses (Submitted, Under Review, For Revision, Approved, Rejected)
 * from the /lookups/statuses-and-remarks endpoint
 */
export const fetchTrackingStatuses = async () => {
  try {
    const payload = await apiRequest('/lookups/statuses-and-remarks?skip=0&limit=100');
    const statuses = Array.isArray(payload) ? payload : payload?.statuses_and_remarks || [];
    
    return statuses.map((row) => ({
      id: row.statuses_and_remarks_id,
      key: row.statuses_and_remarks_name || '',
      label: row.statuses_and_remarks_name || '',
      name: row.statuses_and_remarks_name || '',
      color: getStatusColor(row.statuses_and_remarks_name),
      bg: getStatusBackground(row.statuses_and_remarks_name),
    }));
  } catch (error) {
    console.error('Failed to fetch tracking statuses:', error);
    // Return default statuses as fallback
    return getDefaultTrackingStatuses();
  }
};

/**
 * Fetch result/outcome statuses (Approved, Disapproved, etc.)
 * from the /lookups/status endpoint
 */
export const fetchResultStatuses = async () => {
  try {
    const payload = await apiRequest('/lookups/status?skip=0&limit=100');
    const statuses = Array.isArray(payload) ? payload : payload?.status || [];
    
    return statuses.map((row) => ({
      id: row.status_id,
      key: row.status_name || '',
      label: row.status_name || '',
      name: row.status_name || '',
    }));
  } catch (error) {
    console.error('Failed to fetch result statuses:', error);
    // Return default result statuses as fallback
    return getDefaultResultStatuses();
  }
};

/**
 * Default tracking statuses used as fallback
 */
export const getDefaultTrackingStatuses = () => [
  { id: 1, key: "Submitted",    label: "Submitted",    color: "#1565c0", bg: "#e3f2fd" },
  { id: 2, key: "Under Review", label: "Under Review", color: "#e65100", bg: "#fff3e0" },
  { id: 3, key: "For Revision", label: "For Revision", color: "#6a1b9a", bg: "#f3e5f5" },
  { id: 4, key: "Approved",     label: "Approved",     color: "#2e7d32", bg: "#e8f5e9" },
  { id: 5, key: "Rejected",     label: "Rejected",     color: "#c62828", bg: "#ffebee" },
];

/**
 * Default result statuses used as fallback
 */
export const getDefaultResultStatuses = () => [
  "Approved",
  "Approve with minor revision",
  "Approve with major revision",
  "Disapproved",
];

/**
 * Get color for a status name
 */
const getStatusColor = (statusName) => {
  const colorMap = {
    "Submitted": "#1565c0",
    "Under Review": "#e65100",
    "For Revision": "#6a1b9a",
    "Approved": "#2e7d32",
    "Rejected": "#c62828",
  };
  return colorMap[statusName] || "#666";
};

/**
 * Get background color for a status name
 */
const getStatusBackground = (statusName) => {
  const bgMap = {
    "Submitted": "#e3f2fd",
    "Under Review": "#fff3e0",
    "For Revision": "#f3e5f5",
    "Approved": "#e8f5e9",
    "Rejected": "#ffebee",
  };
  return bgMap[statusName] || "#f5f5f5";
};

/**
 * Find a status configuration by key/name
 */
export const findStatusConfig = (statuses, key) => {
  return statuses.find(s => s.key === key || s.label === key) || statuses[0];
};
