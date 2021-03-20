import React from "react";
import { Route, Redirect, Switch, BrowserRouter } from "react-router-dom";

import HomePage from "./HomePage";
import UsersPage from "./UsersPage";
import OrdersPage from "./OrdersPage";
import GamesPage from "./GamesPage";
import MailingPage from "./MailingPage";

const ProtectedRoute = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/users" component={UsersPage} />
        <Route exact path="/orders" component={OrdersPage} />
        <Route exact path="/games" component={GamesPage} />
        <Route exact path="/mailing" component={MailingPage} />
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
};

export default ProtectedRoute;
