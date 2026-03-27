const initialProductState = {
  products: [
    { name: "Apple", price: 10 },
    { name: "Orange", price: 15 },
    { name: "Mango", price: 20 },
    { name: "Monitor", price: 150 },
    { name: "CPU", price: 90 },
  ],
  cart: [],
  total: 0,
};

const cartReducer = (state = initialProductState, action) => {
  switch (action.type) {
    case "PURCHASE":
      return {
        ...state,
        cart: [...state.cart, action.payload],
        total: state.total + action.payload.price,
      };
    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
        total: 0,
      };
    default:
      return state;
  }
};

export default cartReducer;
