import {
  CLEAR_PRESENTATION_DATE_END,
  SET_PRESENTATION_DATE_END,
} from "../constants/actionTypes";

const initialState = {
  endDate: null,
};

const presentationDateEndReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PRESENTATION_DATE_END:
      return { ...state, endDate: action.payload };
    case CLEAR_PRESENTATION_DATE_END:
      return { ...state, endDate: null };
    default:
      return state;
  }
};

export default presentationDateEndReducer;
