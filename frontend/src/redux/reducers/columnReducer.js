import {
  SET_SELECTED_COLUMNS,
  CLEAR_SELECTED_COLUMNS,
} from "../actions/actionTypes";

const initialState = {
  selectedColumns: "",
};

const columnReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SELECTED_COLUMNS":
      return {
        ...state,
        selectedColumns: action.payload,
      };
    case "CLEAR_SELECTED_COLUMNS":
      return {
        ...state,
        selectedColumns: "",
      };
    default:
      return state;
  }
};

export default columnReducer;
