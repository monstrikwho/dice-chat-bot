import { connect } from "react-redux";
import App from "../App";

import { authSetStatus } from "../actions";

const mapStateToProps = (state) => {
  return {
    authStatus: state.auth.status,
  };
};

const mapDispatchToProps = {
  authSetStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
