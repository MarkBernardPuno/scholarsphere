import React, { useState, useEffect } from "react";
import { Button, Col, Container, ProgressBar, Row, Form, Spinner } from "react-bootstrap";
import { useDataContext } from "../../contexts/data-context";
import axios from "axios";
import { message } from "antd";
const EvaluateApplication6 = ({ handleReturn, handleNext, fetchApplications }) => {
  const { formData, updateFormData } = useDataContext();
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log("formData:", formData);

  useEffect(() => {
    if (formData.status_id >= 3 && formData.status_id <= 5) {
      setIsApproved(true);
    } else {
      setIsApproved(false);
    }
  }, [formData.status_id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    updateFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    let status_id = null;
    switch (name) {
      case "approved":
        setIsApproved(checked);
        if (!checked) {
          updateFormData({ ...formData, status_id: null });
        }
        break;
      case "disapproved":
        status_id = checked ? 2 : null;
        break;
      case "approved_major":
        status_id = checked ? 3 : null;
        break;
      case "approved_minor":
        status_id = checked ? 4 : null;
        break;
      case "no_revision":
        status_id = checked ? 5 : null;
        break;
      default:
        break;
    }

    updateFormData({ ...formData, status_id });
  };

  const handleFormSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();

    if (isApproved && !formData.status_id) {
      message.error(
        "Please select either 'No Revision', 'with Minor', or 'with Major' when 'Approved' is checked."
      );
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/v1/incentivesevaluation/main",
        formData
      );
      if (response.data.success) {
        fetchApplications();
        handleNext();
      } else {
        message.error("Failed to submit the form: " + response.data.message);
        console.error("Failed to submit the form:", response.data.message);
      }
    } catch (error) {
      message.error("Error submitting the form: " + error.message);
      console.error("Error submitting the form:", error);
    } finally {
      setLoading(false);
    }
  };

  const CheckboxComponent1 = () => (
    <div style={{ width: "100%" }}>
      <Row>
        <Col>
          <Row style={{ justifyContent: "flex-end" }}>
            <Form.Check
              type="checkbox"
              label="Approved"
              name="approved"
              style={{ width: "auto", marginRight: "300px" }}
              onChange={handleCheckboxChange}
              checked={isApproved}
            />
          </Row>
          <div style={{ marginLeft: "30px" }}>
            <Row style={{ justifyContent: "flex-end" }}>
              <Form.Check
                type="checkbox"
                label="with Major Recommendations/Revisions"
                name="approved_major"
                style={{ width: "auto" }}
                disabled={!isApproved}
                onChange={handleCheckboxChange}
                checked={formData.status_id === 3}
              />
            </Row>
            <Row style={{ justifyContent: "flex-end" }}>
              <Form.Check
                type="checkbox"
                label="with Minor Recommendations/Revisions"
                name="approved_minor"
                style={{ width: "auto" }}
                disabled={!isApproved}
                onChange={handleCheckboxChange}
                checked={formData.status_id === 4}
              />
            </Row>
            <Row style={{ justifyContent: "flex-end", marginRight: "212px" }}>
              <Form.Check
                type="checkbox"
                label="No Revision"
                name="no_revision"
                style={{ width: "auto" }}
                disabled={!isApproved}
                onChange={handleCheckboxChange}
                checked={formData.status_id === 5}
              />
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );

  const CheckboxComponent2 = () => (
    <>
      <Row>
        <Col>
          <Form.Check
            type="checkbox"
            label="Disapproved"
            name="disapproved"
            onChange={handleCheckboxChange}
            checked={formData.status_id === 2}
          />
        </Col>
      </Row>
    </>
  );

  return (
    <Container fluid>
      <Row
        className="d-flex align-items-center"
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

      <h3
        style={{
          fontSize: "0.8rem",
          paddingLeft: "3rem",
          paddingRight: "3rem",
        }}
      >
        Step 5 of 5
      </h3>
      <ProgressBar variant="warning" now={100} className="mb-3" />

      <Form>
        <Row>
          <Col style={{ marginLeft: "40px", marginTop: "0px" }}>
            <h2 className="titleFont p-2">IV. Evaluation Result</h2>
          </Col>
        </Row>
        <Row>
          <Col style={{ marginLeft: "150px" }}>
            <CheckboxComponent1 />
          </Col>
          <Col>
            <CheckboxComponent2 />
          </Col>
        </Row>
        <Row style={{ marginLeft: "40px", marginRight: "40px" }}>
          <Form.Group as={Col} xs lg="12">
            <Form.Label className="labelFont">Remarks (if any)</Form.Label>
            <Form.Control
              as="textarea"
              rows={7}
              name="status_remarks"
              value={formData.author_name}
              onChange={handleChange}
            />
          </Form.Group>
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
          <Button variant="outline-warning" as={Col} onClick={handleReturn}>
            Return
          </Button>{" "}
          <Col md="auto"></Col>
          <Button variant="warning" as={Col} onClick={handleFormSubmit} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
          </Button>{" "}
        </>
      </Row>
    </Container>
  );
};

export default EvaluateApplication6;
