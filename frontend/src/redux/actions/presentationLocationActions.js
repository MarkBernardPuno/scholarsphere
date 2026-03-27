import {
  SET_PRESENTATION_LOCATION,
  REMOVE_PRESENTATION_LOCATION,
  CLEAR_PRESENTATION_LOCATION,
} from "./actionTypes";

export const setPresentationLocation = (presentationLocation) => ({
  type: SET_PRESENTATION_LOCATION,
  payload: presentationLocation,
});

export const removePresentationLocation = (presentationLocation) => ({
  type: REMOVE_PRESENTATION_LOCATION,
  payload: presentationLocation,
});

export const clearPresentationLocation = () => ({
  type: CLEAR_PRESENTATION_LOCATION,
});
