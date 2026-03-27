import React, { useState, useEffect } from "react";
import "./CategoryOne.css";
import TopBar from "../../../components/topbar";
import {
  Container,
  Row,
  Col,
  Button,
  ProgressBar,
  Form,
} from "react-bootstrap";
import { message } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";

const CategoryOne = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.formData;
  const [formData, setFormData] = useState({
    ...initialData,
    presentation_date: initialData.presentation_date || "",
    presentation_location: initialData.presentation_location || "",
  });

  const initialSelectedFiles = location.state?.selectedFiles || {
    acceptance_letter: null,
    proof_peer_review: null,
    conference_proceedings: null,
    presentation_certificate: null,
    conference_program: null,
  };

  const [selectedFiles, setSelectedFiles] = useState(
    location.state?.selectedFiles || {}
  );

  useEffect(() => {
    setSelectedFiles(initialSelectedFiles);
  }, [location.state]);

  console.log(formData);
  console.log(selectedFiles);

  const handleChange = (event) => {
    const { name, value, files, dataset } = event.target;

    if (name === "presentation_date" || name === "presentation_location") {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (files && files.length > 0) {
      const file = files[0];
      const fileType = dataset.fileType;

      // Create a new File object with the custom file type
      const customFile = new File([file], file.name, {
        type: fileType,
        lastModified: file.lastModified,
      });

      setSelectedFiles({
        ...selectedFiles,
        [name]: customFile,
      });
    }
  };

  const handleReturn = () => {
    navigate("/incentives-application", {
      state: { formData: formData, selectedFiles: selectedFiles },
    });
  };

  const handleContinue = () => {
    const allFieldsFilled =
      formData.presentation_date &&
      formData.presentation_location &&
      selectedFiles.acceptance_letter &&
      selectedFiles.proof_peer_review &&
      selectedFiles.conference_proceedings &&
      selectedFiles.presentation_certificate &&
      selectedFiles.conference_program;

    if (!allFieldsFilled) {
      message.error("Please fill all the fields before pressing continue.");
    } else {
      navigate("/research-eval-form", {
        state: { formData: formData, selectedFiles: selectedFiles },
      });
    }
  };

  return (
    <Container fluid style={{ height: "100vh" }}>
      <Row style={{ height: "15vh" }}>
        <TopBar isLoggedIn={3} />
      </Row>

      <Row style={{ height: "80vh", margin: 0 }}>
        <Row style={{ padding: 0, margin: 0 }}>
          <h2
            className="titleFont p-2"
            style={{
              padding: 0,
              margin: 0,
              justifyContent: "center",
              alignContent: "center",
              width: "100vw",
            }}
          >
            Research Incentives Application
          </h2>
        </Row>

        <Row
          style={{
            alignContent: "center",
            padding: 0,
            margin: 0,
          }}
        >
          <ProgressBar
            style={{ padding: 0 }}
            variant="warning"
            now={66}
            className="mb-3"
          />
        </Row>

        <Form>
          <Row
            className="mb-2"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Category 1</Form.Label>
              <p className="paragraph">
                Research paper presented in national or international
                conferences held within the Philippines and/or published in the
                Conference proceedings (excluding regional or local
                conferences).
              </p>
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Label className="labelFont">Acceptance Letter</Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="acceptanceLetter"
                  name="acceptance_letter"
                  className="custom-file-input"
                  data-file-type="Acceptance Letter"
                  onChange={handleChange}
                />
                <label htmlFor="acceptanceLetter" className="custom-file-label">
                  {selectedFiles.acceptance_letter?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>
          </Row>

          <Row
            className="mb-4"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Date of Presentation
              </Form.Label>
              <Form.Control
                type="date"
                name="presentation_date"
                value={formData.presentation_date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Proof that paper has undergone a peer review
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="proofPeerReview"
                  name="proof_peer_review"
                  className="custom-file-input"
                  data-file-type="Proof that paper has undergone a peer review"
                  onChange={handleChange}
                />
                <label htmlFor="proofPeerReview" className="custom-file-label">
                  {selectedFiles.proof_peer_review?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>
          </Row>

          <Row
            className="mb-4"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Location of Presentation
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="presentation_location"
                value={formData.presentation_location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Conference Proceedings
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="conferenceProceedings"
                  name="conference_proceedings"
                  className="custom-file-input"
                  data-file-type="Conference Proceedings"
                  onChange={handleChange}
                />
                <label
                  htmlFor="conferenceProceedings"
                  className="custom-file-label"
                >
                  {selectedFiles.conference_proceedings?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>
          </Row>

          <Row
            className="mb-4"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Certificate of Presentation
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="certificateOfPresentation"
                  name="presentation_certificate"
                  className="custom-file-input"
                  data-file-type="Certificate of Presentation"
                  onChange={handleChange}
                />
                <label
                  htmlFor="certificateOfPresentation"
                  className="custom-file-label"
                >
                  {selectedFiles.presentation_certificate?.name ||
                    "Choose file"}
                </label>
              </div>
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Conference Program</Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="conferenceProgram"
                  name="conference_program"
                  className="custom-file-input"
                  data-file-type="Conference Program"
                  onChange={handleChange}
                />
                <label
                  htmlFor="conferenceProgram"
                  className="custom-file-label"
                >
                  {selectedFiles.conference_program?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>
          </Row>
        </Form>

        <Row
          style={{
            height: "5vh",
            margin: 0,
            paddingLeft: "20rem",
            paddingRight: "20rem",
          }}
        >
          <Button variant="outline-warning" as={Col} onClick={handleReturn}>
            Return
          </Button>{" "}
          <Col md="auto"></Col>
          <Button variant="warning" as={Col} onClick={handleContinue}>
            Continue
          </Button>{" "}
        </Row>
      </Row>
    </Container>
  );
};

export default CategoryOne;
