// src/redux/reducers/searchQueryReducer.js
import { CLEAR_CATEGORY, SET_CATEGORY } from "../actions/actionTypes";

const initialState = {
  category: "",
};

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CATEGORY:
      return { ...state, category: action.payload };
    case CLEAR_CATEGORY:
      return { ...state, category: "" };
    default:
      return state;
  }
};

export default categoryReducer;
