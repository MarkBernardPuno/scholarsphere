// src/redux/reducers/searchQueryReducer.js
import { CLEAR_CAMPUS, SET_CAMPUS } from "../actions/actionTypes";

const initialState = {
  campus: "",
};

const campusReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CAMPUS:
      return { ...state, campus: action.payload };
    case CLEAR_CAMPUS:
      return { ...state, campus: "" };
    default:
      return state;
  }
};

export default campusReducer;
