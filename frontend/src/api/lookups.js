import { apiRequest } from './client';

const buildParams = ({ resources = 'campuses', campusId, collegeId, skip = 0, limit = 100, activeOnly = true }) => {
  const params = new URLSearchParams();
  params.set('resources', resources);
  params.set('skip', String(skip));
  params.set('limit', String(limit));
  params.set('active_only', activeOnly ? 'true' : 'false');
  if (campusId) params.set('campus_id', campusId);
  if (collegeId) params.set('college_id', collegeId);
  return params.toString();
};

export const getDropdowns = async (options = {}) => {
  const query = buildParams(options);
  return apiRequest(`/lookups/dropdowns?${query}`);
};
