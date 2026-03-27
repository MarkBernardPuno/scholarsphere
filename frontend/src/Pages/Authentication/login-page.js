import { React, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Foot from "../../components/CustomFooTer";
import TopBar from "../../components/topbar";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/auth-context";
import Background from "../../assets/cover.png";
import {Helmet} from "react-helmet";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, accessToken, getAccessToken } = useAuthContext();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const setEmail = (e) => setData({ ...data, email: e });
  const setPassword = (e) => setData({ ...data, password: e });

  const [validEmail, setValidEmail] = useState("");
  const [validPassword, setValidPassword] = useState("");

  const [emailStyle, setEmailStyle] = useState({
    display: "none",
    fontSize: "12px",
    color: "red",
    textAlign: "left",
    marginBottom: "0px",
  });
  const [passwordStyle, setPasswordStyle] = useState({
    display: "none",
    fontSize: "12px",
    color: "red",
    textAlign: "left",
    marginBottom: "0px",
  });

  const [emailBorder, setEmailBorder] = useState({
    width: "100%",
    paddingRight: "40px",
    paddingLeft: "15px",
    borderColor: "#ced4da",
  });
  const [passwordBorder, setPasswordBorder] = useState({
    width: "100%",
    paddingRight: "40px",
    paddingLeft: "15px",
    borderColor: "#ced4da",
  });

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "") {
      if (emailRegex.test(email)) {
        console.log("valid");
        setEmailStyle({ ...emailStyle, display: "none" });
        setEmailBorder({ ...emailBorder, borderColor: "#ced4da" });
        setValidEmail("");
        return true;
      } else {
        setEmailStyle({ ...emailStyle, display: "block" });
        setEmailBorder({ ...emailBorder, borderColor: "red" });
        setValidEmail("Invalid email format! Please ensure email is valid.");
        return false;
      }
    } else {
      setEmailStyle({ ...emailStyle, display: "block" });
      setEmailBorder({ ...emailBorder, borderColor: "red" });
      setValidEmail("Email is Empty! Please provide an email.");
      return false;
    }
  }

  function validatePassword(password) {
    if (password !== "") {
      if (password.length >= 8) {
        console.log("valid");
        setPasswordStyle({ ...passwordStyle, display: "none" });
        setPasswordBorder({ ...passwordBorder, borderColor: "#ced4da" });
        setValidPassword("");
        return true;
      } else {
        setPasswordStyle({ ...passwordStyle, display: "block" });
        setPasswordBorder({ ...passwordBorder, borderColor: "red" });
        setValidPassword("Password must be 8 or more than characters!");
        return false;
      }
    } else {
      setPasswordStyle({ ...passwordStyle, display: "block" });
      setPasswordBorder({ ...passwordBorder, borderColor: "red" });
      setValidPassword("Password is Empty! Please provide a password.");
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const x = validateEmail(data.email);
    const y = validatePassword(data.password);

    if (x && y) {
      if (await login(data)) {
        navigate("/mainSearch");
        setPasswordStyle({ ...passwordStyle, display: "none" });
        setEmailBorder({ ...emailBorder, borderColor: "#ced4da" });
        setPasswordBorder({ ...passwordBorder, borderColor: "#ced4da" });
        setValidPassword("");
      } else {
        setPasswordStyle({ ...passwordStyle, display: "block" });
        setPasswordBorder({ ...passwordBorder, borderColor: "red" });
        setEmailBorder({ ...emailBorder, borderColor: "red" });
        setValidPassword("Incorrect username and password combination!");
      }
      setData({
        email: "",
        password: "",
      });
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Helmet>
          <meta charSet="utf-8" />
          <title>ScholarSphere</title>
          <link rel="canonical" href="http://scholarsphere.com" />
          <meta name="description" content="Testing Site for ScholarSphere" />
      </Helmet>

      <TopBar isLoggedIn={1} />
      <div style={{ height: "75vh", display: "flex" }}>
        <div style={{ width: "50%", height: "100%" }}>
          <Form
            className="d-flex justify-content-center align-items-center flex-column"
            style={{ marginTop: "15%" }}
          >
            <h1
              style={{
                textAlign: "left",
                marginBottom: "32px",
                fontWeight: "bold",
                fontSize: "24px",
                width: "50%",
              }}
            >
              Log In
            </h1>
            <Form.Group
              className="mb-3 position-relative"
              controlId="formBasicEmail"
              style={{ position: "relative", width: "50%" }}
            >
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={data.email}
                onChange={(e) => setEmail(e.target.value)}
                style={emailBorder}
              />
              <p style={emailStyle}>{validEmail}</p>
            </Form.Group>

            <Form.Group
              className="mb-3 position-relative"
              controlId="formBasicPassword"
              style={{ position: "relative", width: "50%" }}
            >
              <Form.Control
                type="password"
                placeholder="Password"
                value={data.password}
                onChange={(e) => setPassword(e.target.value)}
                style={passwordBorder}
              />
              <p style={passwordStyle}>{validPassword}</p>
              <div style={{ textAlign: "left" }}>
                <p
                  style={{
                    alignSelf: "flex-start",
                    textAlign: "right",
                    marginBottom: "0px",
                  }}
                >
                  {/* <a
                        href="forgot"
                        style={{ fontSize: "14px", fontWeight: "bold" }}
                      >
                        Forgot password?
                      </a> */}
                </p>
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              onClick={handleSubmit}
              style={{
                width: "100%",
                marginBottom: "32px",
                width: "50%",
                marginBottom: "0px",
              }}
            >
              Login
            </Button>

            <div
              style={{
                marginTop: "8px",
                textAlign: "left",
                width: "50%",
                fontSize: "14px",
              }}
            >
              <p>
                Don't have an account?{" "}
                <a href="/signup" style={{ fontWeight: "bold" }}>
                  Sign Up
                </a>
              </p>
            </div>
          </Form>
        </div>
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundImage: "url(" + Background + ")",
            backgroundSize: "cover",
            padding: "32px",
          }}
        >
          <div>
            <h1 style={{ color: "black", fontSize: "32px" }}>
              Research is formalized <br />
              <span style={{ color: "#FBC505", fontWeight: "bold" }}>
                curiosity
              </span>
              . It is poking and <br />
              prying with a{" "}
              <span style={{ color: "#FBC505", fontWeight: "bold" }}>
                purpose
              </span>
              .
              <br />
            </h1>
            <p style={{ marginLeft: "30%", fontSize: "28px" }}>
              -Zora Neale Hurston
            </p>
          </div>
        </div>
      </div>
      <Foot />
    </div>
  );
};

export default LoginPage;
