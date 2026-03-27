import { CLEAR_CATEGORIES, SET_CATEGORIES } from '../constants/actionTypes';

export const setCategories = (categories) => ({
  type: SET_CATEGORIES,
  payload: categories,
});

export const clearCategories = () => ({
  type: CLEAR_CATEGORIES,
});
