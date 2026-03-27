import {
  SET_PUBLICATION_LOCATION,
  REMOVE_PUBLICATION_LOCATION,
  CLEAR_PUBLICATION_LOCATION,
} from './actionTypes';

export const setPublicationLocation = (publicationLocation) => ({
  type: SET_PUBLICATION_LOCATION,
  payload: publicationLocation,
});

export const removePublicationLocation = (publicationLocation) => ({
  type: REMOVE_PUBLICATION_LOCATION,
  payload: publicationLocation,
});

export const clearPublicationLocation = () => ({
  type: CLEAR_PUBLICATION_LOCATION,
});
