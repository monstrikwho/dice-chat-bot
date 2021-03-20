import { connect } from "react-redux";
import LoginPage from "../components/LoginPage";
import {
  setLoginValue,
  setPassValue,
  loginSuccess,
  authSetStatus,
} from "../actions";

const mapStateToProps = (state) => {
  return {
    login: state.auth.login,
    password: state.auth.password,
  };
};

const mapDispatchToProps = {
  setLoginValue,
  setPassValue,
  loginSuccess,
  authSetStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
