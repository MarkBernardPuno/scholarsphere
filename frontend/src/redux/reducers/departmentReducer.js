import {
  CLEAR_DEPARTMENT,
  SET_DEPARTMENT,
  REMOVE_DEPARTMENT,
} from "../actions/actionTypes";

const initialState = {
  departments: "",
};

const departmentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DEPARTMENT:
      return {
        ...state,
        departments: state.departments
          ? `${state.departments},${action.payload}`
          : action.payload,
      };
    case REMOVE_DEPARTMENT:
      return {
        ...state,
        departments: state.departments
          .split(",")
          .filter((department) => department !== action.payload)
          .join(","),
      };
    case CLEAR_DEPARTMENT:
      return { ...state, departments: "" };
    default:
      return state;
  }
};

export default departmentReducer;
