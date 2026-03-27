import {
  CLEAR_PRESENTATION_DATE_START,
  SET_PRESENTATION_DATE_START,
} from "../constants/actionTypes";

export const setPresentationStartDate = (date) => {
  return {
    type: SET_PRESENTATION_DATE_START,
    payload: date,
  };
};

export const clearPresentationStartDate = () => {
  return {
    type: CLEAR_PRESENTATION_DATE_START,
  };
};
