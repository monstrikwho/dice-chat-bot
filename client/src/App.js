import React, { useEffect, useState } from "react";
import { Route, Redirect, Switch, BrowserRouter } from "react-router-dom";

import { Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.sass";

import axios from "axios";

import IndexPage from "./components/IndexPage";
import AuthPage from "./containers/LoginPage";
import ProtectedRoute from "./components/ProtectRoute";

export default function App({ authStatus, authSetStatus }) {
  const [statusCheckToken, setStatusCheckToken] = useState(false);

  const checkToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      authSetStatus(false);
      return setStatusCheckToken(true);
    }
    await axios
      .get(`${process.env.REACT_APP_URL}/get_auth_status`, {
        params: { token },
      })
      .then((res) => {
        authSetStatus(res.data.status);
        setStatusCheckToken(true);
      });
  };

  useEffect(() => {
    checkToken();
  });

  if (!statusCheckToken) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!authStatus ? (
        <Switch>
          <Route exact path="/" component={IndexPage} />
          <Route
            exact
            path="/admin"
            component={authStatus ? ProtectedRoute : AuthPage}
          />
          <Redirect to="/" />
        </Switch>
      ) : (
        <Switch>
          <Route path="/" component={ProtectedRoute} />
        </Switch>
      )}
    </BrowserRouter>
  );
}
