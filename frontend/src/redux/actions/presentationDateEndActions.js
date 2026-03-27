import { CLEAR_PRESENTATION_DATE_END, SET_PRESENTATION_DATE_END } from '../constants/actionTypes';

export const setPresentationEndDate = (date) => {
  return {
    type: SET_PRESENTATION_DATE_END,
    payload: date,
  };
};

export const clearPresentationEndDate = () => {
  return {
    type: CLEAR_PRESENTATION_DATE_END,
  };
};
