import {
  CLEAR_PRESENTATION_DATE_START,
  SET_PRESENTATION_DATE_START,
} from "../constants/actionTypes";

const initialState = {
  startDate: null,
};

const presentationDateStartReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PRESENTATION_DATE_START:
      return { ...state, startDate: action.payload };
    case CLEAR_PRESENTATION_DATE_START:
      return { ...state, startDate: null };
    default:
      return state;
  }
};

export default presentationDateStartReducer;
