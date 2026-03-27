import { CLEAR_INCENTIVEAPPLICATION, SET_INCENTIVEAPPLICATION } from '../constants/actionTypes';

const initialState = {
  department: '',
  title: '',
  inst_agenda: '',
  authors: '',
  dept_agenda: '',
  presented_where: '',
  category: '',
};

const researchIncentiveReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_INCENTIVEAPPLICATION:
      return {
        ...state,
        ...action.payload,
      };
    case CLEAR_INCENTIVEAPPLICATION:
      return initialState;
    default:
      return state;
  }
};

export default researchIncentiveReducer;
