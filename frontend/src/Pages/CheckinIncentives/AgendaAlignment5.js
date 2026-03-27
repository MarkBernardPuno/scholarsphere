import React, { useState, useEffect } from "react";
import {
  Button,
  Col,
  Container,
  ProgressBar,
  Row,
  Form,
} from "react-bootstrap";
import { message } from "antd";
import { DeleteEvaluationModal } from "../../components/evaluation-page-modals";
import { useDataContext } from "../../contexts/data-context";
import { useAuthContext } from "../../contexts/auth-context";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AgendaAlignment5 = ({
  handleReturn,
  handleNext,
  evaluationId,
  isEditMode,
  setIsEditMode,
}) => {
  const { formData, updateFormData } = useDataContext();
  const [isApproved, setIsApproved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();

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
    try {
      const dataToSubmit = { ...formData };
      delete dataToSubmit.evaluation_id;
      const response = await axios.put(
        `http://localhost:5000/v1/incentivesevaluation/main/${evaluationId}`,
        dataToSubmit
      );

      if (response.data.success) {
        message.success("Research data and files submitted successfully!");
        console.log("Research data and files submitted successfully!");
        navigate(`/profile/${user.author_id}/researches`);
      } else {
        message.error("Failed to submit the form: " + response.data.message);
        console.error("Failed to submit the form:", response.data.message);
      }
    } catch (error) {
      message.error("Error submitting the form: " + error.message);
      console.error("Error submitting the form:", error);
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
              disabled={!isEditMode}
            />
          </Row>
          <div style={{ marginLeft: "30px" }}>
            <Row style={{ justifyContent: "flex-end" }}>
              <Form.Check
                type="checkbox"
                label="with Major Recommendations/Revisions"
                name="approved_major"
                style={{ width: "auto" }}
                disabled={!isApproved || !isEditMode}
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
                disabled={!isApproved || !isEditMode}
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
                disabled={!isApproved || !isEditMode}
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
            disabled={!isEditMode}
          />
        </Col>
      </Row>
    </>
  );

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const handleEditClick = () => setIsEditMode(true);

  const handleCancelEdit = () => setIsEditMode(false);

  return (
    <Container fluid>
      <Row
        className="d-flex align-items-center"
        style={{ paddingLeft: "1rem", gap: "20px", paddingRight: "1rem" }}
      >
        <Col>
          <h2 className="titleFont m-0 p-0">Research Evaluation Checklist</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          {!isEditMode ? (
            <Button
              variant="warning"
              onClick={handleEditClick}
              style={{ marginLeft: "0.5rem" }}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="outline-warning"
              onClick={handleCancelEdit}
              style={{ marginLeft: "0.5rem" }}
            >
              Cancel Edit
            </Button>
          )}
          <Button
            variant="warning"
            onClick={handleDelete}
            style={{ marginLeft: "0.5rem" }}
          >
            Delete
          </Button>
        </Col>
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
              value={formData.status_remarks}
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
          <Button variant="warning" as={Col} onClick={handleFormSubmit}>
            Submit
          </Button>{" "}
        </>
      </Row>

      <DeleteEvaluationModal
        show={showDeleteModal}
        evaluationId={evaluationId}
        onClose={() => setShowDeleteModal(false)}
        trigger={handleReturn}
        setShow={setShowDeleteModal}
      />
    </Container>
  );
};

export default AgendaAlignment5;
