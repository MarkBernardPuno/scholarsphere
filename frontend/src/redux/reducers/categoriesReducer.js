import { CLEAR_CATEGORIES, SET_CATEGORIES } from "../constants/actionTypes";

const initialState = {
  categories: [],
};

const categoriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CATEGORIES:
      return { ...state, categories: action.payload };
    case CLEAR_CATEGORIES:
      return { ...state, categories: [] };
    default:
      return state;
  }
};

export default categoriesReducer;
