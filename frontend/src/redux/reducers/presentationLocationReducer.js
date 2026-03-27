import {
  CLEAR_PRESENTATION_LOCATION,
  SET_PRESENTATION_LOCATION,
  REMOVE_PRESENTATION_LOCATION,
} from "../actions/actionTypes";

const initialState = {
  presentationLocation: "",
};

const presentationLocationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PRESENTATION_LOCATION:
      return {
        ...state,
        presentationLocation: state.presentationLocation
          ? `${state.presentationLocation},${action.payload}`
          : action.payload,
      };
    case REMOVE_PRESENTATION_LOCATION:
      return {
        ...state,
        presentationLocation: state.presentationLocation
          .split(",")
          .filter(
            (presentationLocation) => presentationLocation !== action.payload
          )
          .join(","),
      };
    case CLEAR_PRESENTATION_LOCATION:
      return { ...state, presentationLocation: "" };
    default:
      return state;
  }
};

export default presentationLocationReducer;
