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

const ApplyIncentivesC7 = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.formData;
  const [formData, setFormData] = useState({
    ...initialData,
    citation_date: initialData.citation_date || "",
  });

  const initialSelectedFiles = location.state?.selectedFiles || {
    cited_five_years: null,
    cited_two_years: null,
    proof_citing_paper: null,
  };

  const [selectedFiles, setSelectedFiles] = useState(initialSelectedFiles);

  useEffect(() => {
    setSelectedFiles(initialSelectedFiles);
  }, [location.state]);

  console.log(formData);
  console.log(selectedFiles);

  const handleChange = (event) => {
    const { name, value, files, dataset } = event.target;

    if (name === "citation_date") {
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
      formData.citation_date &&
      selectedFiles.cited_five_years &&
      selectedFiles.cited_two_years &&
      selectedFiles.proof_citing_paper;

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
              <Form.Label className="titleFont">Category 7</Form.Label>
              <p className="paragraph">
                Citation in an international refereed Journal <br /> <br />
                International Refereed Journals - are journals included in the
                Thomson Reuters Master Journal List/Clarivate Master List of
                Scopus Indexed Journals or International Scientific Indexing
                (ISI) Journals
              </p>
            </Form.Group>

            <Col></Col>
          </Row>

          <Row
            className="mb-4"
            style={{
              paddingTop: "2rem",
              paddingLeft: "3rem",
              paddingRight: "3rem",
            }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Date of Citation</Form.Label>
              <Form.Control
                type="date"
                name="citation_date"
                value={formData.citation_date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Full Paper (Citing Paper) Published at most 2 years ago
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="citedTwoYears"
                  name="cited_two_years"
                  className="custom-file-input"
                  data-file-type="Full Paper (Citing Paper) Published at most 2 years ago"
                  onChange={handleChange}
                />
                <label htmlFor="citedTwoYears" className="custom-file-label">
                  {selectedFiles.cited_two_years?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>
          </Row>

          <Row
            className="mb-4"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6" style={{ paddingTop: "3rem" }}>
              <Form.Label className="labelFont">
                Full Paper (Cited) Published at most 5 years ago
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="citedFiveYears"
                  name="cited_five_years"
                  className="custom-file-input"
                  data-file-type="Full Paper (Cited) Published at most 5 years ago"
                  onChange={handleChange}
                />
                <label
                  htmlFor="citedFiveYears"
                  className="custom-file-label custom-file-label-truncate"
                >
                  {selectedFiles.cited_five_years?.name || "Choose file"}
                </label>
              </div>
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Proof that Citing Paper is an International Refereed Journal
                (Screencap from Thomson Reuters Master Journal List/Clarivate
                Master List of Scopus Indexed Journals or International
                Scientific Indexing (ISI) Journals)
              </Form.Label>
              <div className="custom-file-input-wrapper">
                <input
                  type="file"
                  id="proofCitingPaper"
                  name="proof_citing_paper"
                  className="custom-file-input"
                  data-file-type="Proof that Citing Paper is a National Refereed Journal"
                  onChange={handleChange}
                />
                <label htmlFor="proofCitingPaper" className="custom-file-label">
                  {selectedFiles.proof_citing_paper?.name || "Choose file"}
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

export default ApplyIncentivesC7;
