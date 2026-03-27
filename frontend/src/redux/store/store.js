// store.js
import { combineReducers, createStore } from 'redux';
import cartReducer from '../reducers/cartReducer'; // Adjust the path as per your setup
import categoriesReducer from '../reducers/categoriesReducer';
import countReducer from '../reducers/countReducer'; // Adjust the path as per your setup
import departmentReducer from '../reducers/departmentReducer';
import presentationDateEndReducer from '../reducers/presentationDateEndReducer';
import presentationDateStartReducer from '../reducers/presentationDateStartReducer';
import researchIncentiveReducer from '../reducers/researchIntentiveReducer';
import searchQueryReducer from '../reducers/searchReducer';
import categoryReducer from '../reducers/categoryRedcuer';
import searchResearcherReducer from '../reducers/searchResearcherReducer';
import presentationLocationReducer from '../reducers/presentationLocationReducer.js';
import publicationLocationReducer from '../reducers/publicationLocationReducer.js';
import campusReducer from '../reducers/campusReducer.js';
import columnReducer from '../reducers/columnReducer.js';
const rootReducer = combineReducers({
  cart: cartReducer,
  count: countReducer,
  searchQuery: searchQueryReducer,
  selectedDepartment: departmentReducer,
  selectedEndDate: presentationDateEndReducer,
  selectedStartDate: presentationDateStartReducer,
  selectedCategory: categoryReducer,
  searchResearcher: searchResearcherReducer,
  presentationLocationRedux: presentationLocationReducer,
  publicationLocationRedux: publicationLocationReducer,
  selectedCampus: campusReducer,
  columnsRedux: columnReducer,
});

const store = createStore(rootReducer);

export default store;
