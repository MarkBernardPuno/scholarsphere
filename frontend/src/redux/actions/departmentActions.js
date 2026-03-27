import {
  SET_DEPARTMENT,
  REMOVE_DEPARTMENT,
  CLEAR_DEPARTMENT,
} from "./actionTypes";

export const setDepartment = (department) => ({
  type: SET_DEPARTMENT,
  payload: department,
});

export const removeDepartment = (department) => ({
  type: REMOVE_DEPARTMENT,
  payload: department,
});

export const clearDepartment = () => ({
  type: CLEAR_DEPARTMENT,
});
