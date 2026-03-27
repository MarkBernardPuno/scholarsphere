// src/redux/reducers/searchQueryReducer.js
import { SET_RESEARCHER_SEARCH, CLEAR_RESEARCHER_SEARCH } from '../actions/actionTypes';

const initialState = {
  researcher: null,
};

const searchResearcherReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_RESEARCHER_SEARCH':
      return {
        ...state,
        researcher: action.payload,
      };
    case 'CLEAR_RESEARCHER_SEARCH':
      return {
        ...state,
        researcher: null,
      };
    default:
      return state;
  }
};

export default searchResearcherReducer;
