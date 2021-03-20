import React, { useState } from "react";
import axios from "axios";
import isNumber from "is-number";
import { Toast } from "react-bootstrap";
import "../styles/LoginPage.sass";

export default function LoginPage({
  setLoginValue,
  setPassValue,
  loginSuccess,
  authSetStatus,
  login,
  password,
}) {
  const [loginStatus, setLoginStatus] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const changeLoginValue = (e) => {
    const value = e.target.value;
    const input = document.querySelector("#login");

    // Change value to input
    setLoginValue(value);

    // Toggle status on change value of input
    if (value.length > 0) {
      input.setAttribute("class", "used");
    } else {
      input.removeAttribute("class");
    }
  };

  const changePasswordValue = (e) => {
    const value = e.target.value;
    const input = document.querySelector("#password");

    // Change value to input
    if (value.length < 5) setPassValue(value);

    // We send the password to the server as soon as we enter 4 digits
    console.log(value);
    if (value.length === 4) sendPass(value);

    // Toggle status on change value of input
    if (value.length > 0) {
      input.setAttribute("class", "used");
    } else {
      input.removeAttribute("class");
    }
  };

  const sendLogin = async () => {
    const statusValidation = validationLogin();
    if (statusValidation) {
      setShowToast(statusValidation);
      return;
    }
    await axios
      .get(`https://dice-bots.ru/api/get_login`, { params: { login } })
      .then(({ data }) => {
        if (!data.status) {
          return setShowToast("This user does not exist.");
        }
        setLoginStatus(data.status);
      });
  };

  const sendPass = async (pass) => {
    const statusValidation = validationPass();
    if (statusValidation) {
      setShowToast(statusValidation);
    }
    await axios
      .get(`https://dice-bots.ru/api/get_pass`, {
        params: { login, pass },
      })
      .then(({ data }) => {
        if (!data.status) {
          return setShowToast("This pass does not exist.");
        }
        loginSuccess(data.token);
        authSetStatus(true);
      });
  };

  const validationPass = () => {
    if (password.length !== 3) return "Please, enter correct key";
    return false;
  };

  const validationLogin = () => {
    if (login.length < 1) return "UID is empty.";
    if (!isNumber(login)) return "UID must have only number.";
    return false;
  };

  return (
    <div id="login-page">
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <Toast
            onClose={() => setShowToast(false)}
            show={Boolean(showToast)}
            delay={3000}
            autohide
          >
            <Toast.Header>
              <strong className="mr-auto">Notify</strong>
            </Toast.Header>
            <Toast.Body>{showToast}</Toast.Body>
          </Toast>
        </div>
        <form>
          {!loginStatus ? (
            <React.Fragment>
              <div className="group">
                <input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(e) => {
                    changeLoginValue(e);
                  }}
                  autoFocus
                />
                <span className="bar"></span>
                <label>UID</label>
              </div>
              <button
                type="button"
                className="button buttonBlue"
                onClick={sendLogin}
              >
                Login
              </button>
            </React.Fragment>
          ) : (
            <div className="group">
              <input
                id="password"
                type="text"
                value={password}
                onChange={(e) => {
                  changePasswordValue(e);
                }}
              />
              <span className="bar"></span>
              <label>Key</label>
            </div>
          )}
          <div className="message"></div>
        </form>
      </div>
    </div>
  );
}
