// countReducer.js
const initialState = {
  count: 0,
};

const countReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_TEN":
      return {
        ...state,
        count: state.count + 10,
      };
    case "MINUS_TEN":
      return {
        ...state,
        count: state.count - 10,
      };
    default:
      return state;
  }
};

export default countReducer;
