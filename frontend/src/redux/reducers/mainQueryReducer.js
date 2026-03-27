import { SET_MAIN_QUERY } from '../constants/actionTypes';

const initialState = {
  mainQuery: '',
};

const mainQueryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MAIN_QUERY:
      return {
        ...state,
        mainQuery: action.payload,
      };
    default:
      return state;
  }
};

export default mainQueryReducer;
