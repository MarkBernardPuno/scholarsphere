import React, { useState } from "react";
import { Checkbox, Form, Input } from "antd";
import { Button, Col, Container, ProgressBar, Row } from "react-bootstrap";
import { useDataContext } from "../../contexts/data-context";

const EvaluateApplication5 = ({handleReturn, handleNext}) => {
  const { formData, updateFormData } = useDataContext();
  console.log(formData);

  return (
    <Container fluid>
      <Row
        lassName="d-flex align-items-center"
        style={{
          paddingLeft: "1rem",
          gap: "20px",
          paddingRight: "1rem",
          fontFamily: "Kaisei",
        }}
      >
        <Col>
          <h2 className="titleFont p-2">Research Evaluation Checklist</h2>
        </Col>
        <Col xs={6} style={{ paddingLeft: "50vh", paddingTop: "5px" }}></Col>
      </Row>

      <ProgressBar variant="warning" now={100} className="mb-3" />
          <Form>
            <Row>
              <Col style={{ marginLeft: "40px", marginTop: "0px" }}>
                <h2 className="titleFont p-2">IV. Supporting Documents </h2>
              </Col>
            </Row>
          </Form>
          <div style={{ marginLeft: "20px", marginRight: "20px" }}></div>
          <Form>
            <Row
              className="mb-1"
              style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
            ></Row>
          </Form>
          <Row style={{ paddingLeft: "20rem", paddingRight: "20rem" }}>
            <>
                <Button
                  variant="outline-warning"
                  as={Col}
                  onClick={handleReturn}
                >
                  Return
                </Button>{" "}
                <Col md="auto"></Col>
                <Button variant="warning" as={Col} onClick={handleNext}>
                  Continue
                </Button>{" "}
            </>
          </Row>
    </Container>
  );
};

export default EvaluateApplication5;
