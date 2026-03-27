import {
  CLEAR_PUBLICATION_LOCATION,
  SET_PUBLICATION_LOCATION,
  REMOVE_PUBLICATION_LOCATION,
} from '../actions/actionTypes';

const initialState = {
  publicationLocation: '',
};

const publicationLocationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PUBLICATION_LOCATION:
      return {
        ...state,
        publicationLocation: state.publicationLocation
          ? `${state.publicationLocation},${action.payload}`
          : action.payload,
      };
    case REMOVE_PUBLICATION_LOCATION:
      return {
        ...state,
        publicationLocation: state.publicationLocation
          .split(',')
          .filter((publicationLocation) => publicationLocation !== action.payload)
          .join(','),
      };
    case CLEAR_PUBLICATION_LOCATION:
      return { ...state, publicationLocation: '' };
    default:
      return state;
  }
};

export default publicationLocationReducer;
