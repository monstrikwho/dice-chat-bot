import { connect } from "react-redux";
import { changePagesTitle } from "../actions";
import NavbarMenu from "../components/NavbarMenu";

const mapStateToProps = (state) => {
  return {
    pagesTitle: state.pages.pagesTitle,
  };
};

const mapDispatchToProps = {
  changePagesTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavbarMenu);
