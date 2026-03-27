import { SET_MAIN_QUERY } from "../constants/actionTypes";

export const setMainQuery = (query) => ({
  type: SET_MAIN_QUERY,
  payload: query,
});
