import { authConstants } from "../constants";

export const setLoginValue = (login) => ({
  type: authConstants.AUTH_CHANGE_LOGIN_VALUE,
  payload: login,
});

export const setPassValue = (pass) => ({
  type: authConstants.AUTH_CHANGE_PASS_VALUE,
  payload: pass,
});

export const loginSuccess = (token) => {
  localStorage.setItem("token", token);
  return {
    type: authConstants.AUTH_LOGIN_SUCCESS,
    payload: token,
  };
};

export const authSetStatus = (status) => {
  return {
    type: authConstants.AUTH_SET_STATUS,
    payload: status,
  };
};

export const logout = () => {
  localStorage.removeItem("token");
  return {
    type: authConstants.AUTH_LOGUOT,
  };
};

// export const asyncF = () => {
//   return async function(dispatch) {
//     // await axios
//     // dispatch({type: authConstants.AUTH_LOGUOT})
//   }
// }
