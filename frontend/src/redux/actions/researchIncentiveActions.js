import { CLEAR_INCENTIVEAPPLICATION, SET_INCENTIVEAPPLICATION } from '../constants/actionTypes';

export const setIncentiveApplication = (intentiveApplication) => ({
  type: SET_INCENTIVEAPPLICATION,
  payload: intentiveApplication,
});

export const clearIncentiveApplication = () => ({
  type: CLEAR_INCENTIVEAPPLICATION,
});
