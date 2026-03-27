import React, { useState, useEffect } from "react";
import TopBar from "../../components/topbar";
import "./ApplyIncentives.css";
import {
  Container,
  Row,
  Col,
  Button,
  ProgressBar,
  Form,
} from "react-bootstrap";
import { message } from "antd";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ApplyIncentivesC2 = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.formData;
  const [formData, setFormData] = useState({
    ...initialData,
    presentation_date: initialData.presentation_date || "",
    presentation_location: initialData.presentation_location || "",
  });

  const initialSelectedFiles = location.state?.selectedFiles || {
    presentation_certificate: null,
    award_pictures: null,
    proof_peer_review: null,
    souvenir_program_copies: null,
    awarding_org: null,
  };

  const [selectedFiles, setSelectedFiles] = useState(initialSelectedFiles);

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
    navigate(`/apply-incentive/${evaluationId}`, {
      state: {
        formData: initialData,
        selectedFiles: initialSelectedFiles,
        evaluationId,
      },
    });
  };

  const handleContinue = () => {
    const allFieldsFilled =
      formData.presentation_date &&
      formData.presentation_location &&
      selectedFiles.presentation_certificate &&
      selectedFiles.award_pictures &&
      // selectedFiles.proof_peer_review &&
      selectedFiles.souvenir_program_copies &&
      selectedFiles.awarding_org;

    if (!allFieldsFilled) {
      message.error("Please fill all the fields before pressing continue.");
    } else {
      navigate(`/submit-incentive/${evaluationId}`, {
        state: {
          formData: formData,
          selectedFiles: selectedFiles,
          evaluationId,
        },
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
              <Form.Label className="labelFont">Category 2</Form.Label>
              <p className="paragraph">
                First Prize Winning Entry to Palanca Awards, Doreen Fernandez
                Food Essay Contest, NVM Gonzales Writing Contest and other
                equally prestigious national competitions recognized and
                categorized as such by the Executive Management Committee /
                Research Council
              </p>
            </Form.Group>

            <Form.Group as={Col} xs lg="6" style={{ paddingTop: "2rem" }}>
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
          </Row>

          <Row
            className="mb-4"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Col style={{ paddingLeft: "3rem", paddingRight: "3rem" }}></Col>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Pictures of Award</Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="picturesOfAward"
                  name="award_pictures"
                  className="custom-file-input"
                  data-file-type="Pictures of Award"
                  onChange={handleChange}
                />
                <label htmlFor="picturesOfAward" className="custom-file-label">
                  {selectedFiles.award_pictures?.name || "Choose file"}
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
                required
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Copies of Souvenir Program
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="copiesOfSouvenirProgram"
                  name="souvenir_program_copies"
                  className="custom-file-input"
                  data-file-type="Copies of Souvenir Program"
                  onChange={handleChange}
                />
                <label
                  htmlFor="copiesOfSouvenirProgram"
                  className="custom-file-label"
                >
                  {selectedFiles.souvenir_program_copies?.name || "Choose file"}
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
                Profile of awarding organization
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="profileOfAwardingOrganization"
                  name="awarding_org"
                  className="custom-file-input"
                  data-file-type="Profile of awarding organization"
                  onChange={handleChange}
                />
                <label
                  htmlFor="profileOfAwardingOrganization"
                  className="custom-file-label"
                >
                  {selectedFiles.awarding_org?.name || "Choose file"}
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

export default ApplyIncentivesC2;
