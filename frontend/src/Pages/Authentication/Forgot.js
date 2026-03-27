import React, { useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Bar from "../../components/NavBAr";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import iconImage from "../../assets/Group.png";
import iconImage2 from "../../assets/Group(1).png";
import Cover from "../../assets/Daco.png";
import Foot from "../../components/CustomFooTer";

const Forgotpassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
  };

  return (
    <div
      style={{
        fontFamily: "Kaisei HarunoUmi, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingTop: "50px",
      }}
    >
      <Row style={{ marginTop: "-50px" }}>
        <Bar isLoggedIn={1} />
      </Row>
      <Row>
        <Col>
          <div
            style={{
              height: "75vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "50%",
                height: "70%",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                padding: "30px",
                borderRadius: "10px",
                backgroundColor: "white",
              }}
            >
              <Form className="d-flex justify-content-center align-items-center flex-column">
                {/* <h1
                  style={{
                    marginBottom: '20px',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    color: 'black',
                    textAlign: 'center',
                    borderBottom: '1px solid black', // Added border line below the h1
                    paddingBottom: '8px', // Added padding below the border line
                    fontFamily: 'Kaisei HarunoUmi, sans-serif'
                  }}
                >
                  Forgot Password?
                </h1> */}
                <p
                  style={{
                    fontSize: "16px",
                    color: "black",
                    marginBottom: "20px",
                    textAlign: "center",
                    lineHeight: "1.6",
                    fontFamily: "Kaisei HarunoUmi, sans-serif",
                  }}
                >
                  We can send you details on how to reset it.
                  <br />
                  Please enter your Username
                </p>
                <Form.Group
                  controlId="formBasicEmail"
                  style={{ width: "100%" }}
                >
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      borderRadius: "5px",
                      fontFamily: "Kaisei HarunoUmi, sans-serif",
                    }}
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  onClick={handleSubmit}
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                    padding: "10px",
                    marginTop: "20px",
                    fontFamily: "Kaisei HarunoUmi, sans-serif",
                  }}
                >
                  Continue
                </Button>
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <a
                    href="/login"
                    style={{
                      color: "blue",
                      fontFamily: "Kaisei HarunoUmi, sans-serif",
                      fontWeight: "bold",
                    }}
                  >
                    Back to Login
                  </a>
                </div>
              </Form>
            </div>
          </div>
        </Col>
        <Col
          style={{
            backgroundImage: `url(${Cover})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
            backgroundColor: "#f2f2f2",
            padding: "20px",
            color: "white",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "5%",
              left: "5%",
              textAlign: "start",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontStyle: "italic",
                width: "80%",
                fontFamily: "Kaisei HarunoUmi, sans-serif",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                padding: "10px",
              }}
            >
              "Remembering your password is crucial for online security."
            </h2>
          </div>
        </Col>
      </Row>
      <Row>
        <Foot />
      </Row>
    </div>
  );
};

export default Forgotpassword;
