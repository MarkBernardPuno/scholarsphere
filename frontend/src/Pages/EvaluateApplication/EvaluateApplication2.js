import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { useDataContext } from "../../contexts/data-context";

const EvaluateApplication2 = ({ handleReturn, handleNext }) => {
  const { formData, updateFormData } = useDataContext();
  console.log(formData);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    updateFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const instAgendaText = formData.instagendas
    ? formData.instagendas.map((instagenda) => instagenda.label).join(", ")
    : "";

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

      <h3 style={{fontSize: "0.8rem", paddingLeft: "3rem", paddingRight: "3rem"}}>Step 2 of 5</h3>
      <ProgressBar variant="warning" now={40} className="mb-3" />

      <Form>
        <Row>
          <Col style={{ marginLeft: "40px", marginTop: "0px" }}>
            <h2 className="titleFont p-2">I. Research Agenda Alignment</h2>
          </Col>
        </Row>
        <Row
          className="mb-1"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        >
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">
              Institutional Research Agenda
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="instagendas"
              value={instAgendaText}
              onChange={handleChange}
              readOnly
            />
          </Form.Group>

          <Form.Group as={Col} xs={12} lg={6}>
            <Form.Label className="labelFont" style={{ marginLeft: "0px" }}>
              Is the research paper aligned to the department research agenda?
            </Form.Label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "60%",
                backgroundColor: "#E9ECEF",
                borderRadius: "10px",
              }}
            >
              <Form.Check
                inline
                label="Yes"
                type="checkbox"
                id="alignedYes"
                name="is_agenda_aligned"
                onChange={handleChange}
              />

              <Form.Check
                inline
                label="No"
                type="checkbox"
                id="alignedNo"
                name="is_agenda_aligned"
                onChange={handleChange}
              />
            </div>
          </Form.Group>
        </Row>
      </Form>
      <Form>
        <Row
          className="mb-1"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        >
          <Form.Group as={Col} xs lg="12">
            <Form.Label className="labelFont">Remarks (if any)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="is_agenda_aligned_remarks"
              value={formData.is_agenda_aligned_remarks}
              onChange={handleChange}
            />
          </Form.Group>
        </Row>
        <Row className="align-items-center">
          <Col
            style={{ marginLeft: "120px" }}
            xs={12}
            lg={10}
            className="d-flex align-items-center"
          >
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="defaultCheck1"
              />
            </div>
            <p style={{ margin: 0, paddingLeft: "0", width: "100%" }}>
              I understand and agree that by filling out this form I am allowing
              the Technological Institute of the Philippines to collect, use,
              share, and disclose my personal information and to store it as
              long as necessary for the fulfillment of the stated purpose and in
              accordance with applicable laws, including the Data Privacy Act of
              2012 and its implementing Rules and Regulations and the T.I.P.
              Privacy Policy. The Purpose and extent of collection, use,
              sharing, disclosure, and storage of my personal information was
              explained to me.
            </p>
          </Col>
        </Row>
      </Form>
      <Form>
        <Row
          className="mb-1"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        ></Row>
      </Form>
      <Form>
        <Row
          className="mb-1"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        ></Row>
      </Form>
      <Row style={{ paddingLeft: "20rem", paddingRight: "20rem" }}>
          <>
            <Button variant="outline-warning" as={Col} onClick={handleReturn}>
              Return
            </Button>{" "}
            <Col md="auto"></Col>
            <Button variant="warning" as={Col} onClick={() => handleNext(formData)}>
              Continue
            </Button>{" "}
          </>
      </Row>
    </Container>
  );
};

export default EvaluateApplication2;
