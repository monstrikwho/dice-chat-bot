import { connect } from "react-redux";
import PrivateRoute from "../components/PrivateRoute";

const mapStateToProps = (state) => {
  return {
    token: state.auth.token,
  };
};

export default connect(mapStateToProps)(PrivateRoute);
