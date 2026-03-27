import { CLEAR_SEARCH_QUERY, SET_SEARCH_QUERY } from "../constants/actionTypes";

export const setSearchQuery = (query) => {
  return {
    type: SET_SEARCH_QUERY,
    payload: query,
  };
};

export const clearSearchQuery = () => {
  return {
    type: CLEAR_SEARCH_QUERY,
  };
};
