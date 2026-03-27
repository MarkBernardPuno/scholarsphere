import { SET_CAMPUS, CLEAR_CAMPUS } from "./actionTypes";

export const setSelectedCampus = (campus) => {
  return {
    type: SET_CAMPUS,
    payload: campus,
  };
};

export const clearSelectedCampus = () => {
  return {
    type: CLEAR_CAMPUS,
  };
};
