import { SET_CATEGORY, CLEAR_CATEGORY } from "./actionTypes";

export const setSelectedCategory = (category) => {
  return {
    type: SET_CATEGORY,
    payload: category,
  };
};

export const clearSelectedCategory = () => {
  return {
    type: CLEAR_CATEGORY,
  };
};
