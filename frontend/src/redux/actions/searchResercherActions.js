import { SET_RESEARCHER_SEARCH, CLEAR_RESEARCHER_SEARCH } from './actionTypes';

export const setResearcherSearch = (researcher) => {
  return {
    type: SET_RESEARCHER_SEARCH,
    payload: researcher,
  };
};

export const clearResearcherSearch = () => {
  return {
    type: CLEAR_RESEARCHER_SEARCH,
  };
};
