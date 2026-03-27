import React, { useState, useEffect } from "react";
import "./ApplyIncentives.css";
import TopBar from "../../components/topbar";
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
import { useNavigate, useLocation, useParams } from "react-router-dom";

const ApplyIncentivesC5 = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.formData;
  const [formData, setFormData] = useState({
    ...initialData,
    publication_date: initialData.publication_date || "",
    published_where: initialData.published_where || "",
  });

  const initialSelectedFiles = location.state?.selectedFiles || {
    full_or_doi: null,
    proof_peer_review: null,
    screencap_of_proof: null,
    screencap_of_abstract: null,
    screencap_of_editorial: null,
    screencap_of_acceptance: null,
  };

  const [selectedFiles, setSelectedFiles] = useState(initialSelectedFiles);

  useEffect(() => {
    setSelectedFiles(initialSelectedFiles);
  }, [location.state]);

  console.log(formData);
  console.log(selectedFiles);

  const handleChange = (event) => {
    const { name, value, files, dataset } = event.target;

    if (name === "publication_date" || name === "published_where") {
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
      state: { formData: formData, selectedFiles: selectedFiles, evaluationId },
    });
  };

  const handleContinue = () => {
    const allFieldsFilled =
      formData.publication_date &&
      selectedFiles.full_or_doi &&
      selectedFiles.proof_peer_review &&
      selectedFiles.screencap_of_proof &&
      selectedFiles.screencap_of_abstract &&
      selectedFiles.screencap_of_editorial &&
      selectedFiles.screencap_of_acceptance;

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
              <Form.Label className="titleFont">Category 5</Form.Label>
              <p className="paragraph">
                Research paper published in an international refereed Journal{" "}
                <br /> <br />
                International Refereed Journals - are journals included in the
                Thomson Reuters Master Journal List/Clarivate Master List of
                Scopus Indexed Journals or International Scientific Indexing
                (ISI) Journals
              </p>
            </Form.Group>

            <Form.Group as={Col} xs lg="6" style={{ paddingTop: "4rem" }}>
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

              <Form.Label
                className="labelFont"
                style={{ paddingTop: "1.5rem" }}
              >
                Screencap of Proof of International Refereed Journal
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="screencapOfProof"
                  name="screencap_of_proof"
                  className="custom-file-input"
                  data-file-type="Screencap of Proof of International Refereed Journal"
                  onChange={handleChange}
                />
                <label htmlFor="screencapOfProof" className="custom-file-label">
                  {selectedFiles.screencap_of_proof?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>
          </Row>

          <Row
            className="mb-4"
            style={{
              paddingLeft: "3rem",
              paddingRight: "3rem",
              paddingTop: "1rem",
            }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Date of Publication</Form.Label>
              <Form.Control
                type="date"
                name="publication_date"
                value={formData.publication_date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Screencap of Abstract in the journal website
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="screencapOfAbstract"
                  name="screencap_of_abstract"
                  className="custom-file-input"
                  data-file-type="Screencap of Abstract in the journal website"
                  onChange={handleChange}
                />
                <label
                  htmlFor="screencapOfAbstract"
                  className="custom-file-label"
                >
                  {selectedFiles.screencap_of_abstract?.name || "Choose file"}
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
                Journal/Publication where Paper was Published
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="published_where"
                value={formData.published_where}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Screencap of Editorial Board
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="screencapOfEditorial"
                  name="screencap_of_editorial"
                  className="custom-file-input"
                  data-file-type="Screencap of Editorial Board"
                  onChange={handleChange}
                />
                <label
                  htmlFor="screencapOfEditorial"
                  className="custom-file-label"
                >
                  {selectedFiles.screencap_of_editorial?.name || "Choose file"}
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
                Full paper/ DOI of the paper
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="doiOrFull"
                  name="full_or_doi"
                  className="custom-file-input"
                  data-file-type="Full paper/ DOI of the paper"
                  onChange={handleChange}
                />
                <label htmlFor="doiOrFull" className="custom-file-label">
                  {selectedFiles.full_or_doi?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Screencap of Acceptance Policy
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="screencapOfAcceptance"
                  name="screencap_of_acceptance"
                  className="custom-file-input"
                  data-file-type="Screencap of Acceptance Policy"
                  onChange={handleChange}
                />
                <label
                  htmlFor="screencapOfAcceptance"
                  className="custom-file-label"
                >
                  {selectedFiles.screencap_of_acceptance?.name || "Choose file"}
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

export default ApplyIncentivesC5;
