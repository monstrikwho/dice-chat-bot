import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import HomePage from "./components/homepage";
import AdminPanel from "./components/adminpanel";

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="content">
          <Switch>
            <Route
              path={process.env.PUBLIC_URL + "/"}
              exact
              render={() => <HomePage />}
            />
            <Route
              path={process.env.PUBLIC_URL + "/admin_panel_404"}
              render={() => <AdminPanel />}
            />
            <Redirect to={process.env.PUBLIC_URL + "/"} />
          </Switch>
        </div>
      </Router>
    );
  }
}
