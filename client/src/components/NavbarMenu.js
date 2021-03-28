import React from "react";

import { Link } from "react-router-dom";
import { Nav, Navbar } from "react-bootstrap";

export default function NavbarMenu({ pagesTitle, changePagesTitle }) {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand>{pagesTitle}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Link
            className="nav-link-c"
            to="/"
            onClick={() => {
              changePagesTitle("Lucky Cat bot");
            }}
          >
            Home
          </Link>
          <Link
            className="nav-link-c"
            to="/users"
            onClick={() => {
              changePagesTitle("Users");
            }}
          >
            Users
          </Link>
          <Link
            className="nav-link-c"
            to="/orders"
            onClick={() => {
              changePagesTitle("Orders");
            }}
          >
            Orders
          </Link>
          <Link
            className="nav-link-c"
            to="/games"
            onClick={() => {
              changePagesTitle("Games");
            }}
          >
            Games
          </Link>
          <Link
            className="nav-link-c"
            to="/mailing"
            onClick={() => {
              changePagesTitle("Mailing");
            }}
          >
            Mailing
          </Link>
          <Link
            className="nav-link-c"
            to="/settings"
            onClick={() => {
              changePagesTitle("Settings");
            }}
          >
            Settings
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
