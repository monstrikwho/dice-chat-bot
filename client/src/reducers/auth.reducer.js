import { authConstants } from "../constants";

const initialState = {
  login: "",
  password: "",
  token: null,
  status: false,
};

export function auth(state = initialState, action) {
  switch (action.type) {
    case authConstants.AUTH_CHANGE_LOGIN_VALUE:
      return {
        ...state,
        login: action.payload,
      };
    case authConstants.AUTH_CHANGE_PASS_VALUE:
      return {
        ...state,
        password: action.payload,
      };
    case authConstants.AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        password: "",
        token: action.payload,
      };
    case authConstants.AUTH_SET_STATUS:
      return {
        ...state,
        status: action.payload,
      };
    default:
      return state;
  }
}
