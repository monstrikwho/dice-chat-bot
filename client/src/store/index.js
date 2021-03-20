import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "../reducers";

const loggerMiddleware = createLogger();

export const store = createStore(
  reducer,
  applyMiddleware(thunk, loggerMiddleware)
);
