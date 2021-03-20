import { combineReducers } from "redux";

import { auth } from "./auth.reducer";
import { pages } from "./pages.reducer";

const rootReducer = combineReducers({
  auth,
  pages,
});

export default rootReducer;
