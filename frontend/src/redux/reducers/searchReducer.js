// src/redux/reducers/searchQueryReducer.js
import { CLEAR_SEARCH_QUERY, SET_SEARCH_QUERY } from '../constants/actionTypes';

const initialState = {
  query: '',
};

const searchQueryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SEARCH_QUERY:
      return { ...state, query: action.payload };
    case CLEAR_SEARCH_QUERY:
      return { ...state, query: '' };
    default:
      return state;
  }
};

export default searchQueryReducer;
