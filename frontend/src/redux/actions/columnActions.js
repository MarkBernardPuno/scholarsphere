import { SET_SELECTED_COLUMNS, CLEAR_SELECTED_COLUMNS } from "./actionTypes";

export const setSelectedColumns = (columns) => ({
  type: "SET_SELECTED_COLUMNS",
  payload: columns,
});

export const clearSelectedColumns = () => ({
  type: "CLEAR_SELECTED_COLUMNS",
});
