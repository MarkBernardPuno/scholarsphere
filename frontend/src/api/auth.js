import { apiRequest } from './client';

export const signup = (payload) =>
  apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      first_name: payload.firstName,
      middle_initial: payload.middleInitial || null,
      last_name: payload.lastName,
      email: payload.email,
      password: payload.password,
      campus_id: payload.campusId,
      college_id: payload.collegeId,
      department_id: payload.departmentId || null,
    }),
  });

export const login = (payload) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

export const fetchProfile = (userId) =>
  apiRequest(`/auth/me?user_id=${userId}`, {
    method: 'GET',
  });
