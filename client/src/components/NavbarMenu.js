import React from "react";

import { Link } from "react-router-dom";
import { Nav, Navbar, Button } from "react-bootstrap";

export default function NavbarMenu({ pageTitle, lang }) {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand>
        {pageTitle}
        <div className="actions">
          <Button
            size="sm"
            variant={lang === "RU" ? "primary" : "outline-primary"}
            onClick={(e) => {
              e.preventDefault();
              localStorage.setItem("lang", "RU");
              document.location.reload();
            }}
          >
            RU
          </Button>
          <Button
            size="sm"
            variant={lang === "TUR" ? "primary" : "outline-primary"}
            onClick={(e) => {
              e.preventDefault();
              localStorage.setItem("lang", "TUR");
              document.location.reload();
            }}
          >
            TUR
          </Button>
        </div>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Link className="nav-link-c" to="/">
            Home
          </Link>
          <Link className="nav-link-c" to="/users">
            Users
          </Link>
          <Link className="nav-link-c" to="/orders">
            Orders
          </Link>
          <Link className="nav-link-c" to="/games">
            Games
          </Link>
          <Link className="nav-link-c" to="/pvp_games">
            PVP Games
          </Link>
          <Link className="nav-link-c" to="/settings">
            Settings
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
