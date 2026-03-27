import React, { useState, useEffect } from "react";
import "./IncentivesPage.css";
import { Container, Row, Col, Button, ProgressBar, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import FileInput from "../../components/common/FileInput";
import { formatDate, formatFilePath } from "../../utils/format";

const IncentivesPageC1 = ({ handleReturn, handleNext, applicationId, isEditMode, incentivesData }) => {
  const [formData, setFormData] = useState({
    abstract: incentivesData.abstract || "",
    application_id: incentivesData.application_id || "",
    camp_id: incentivesData.camp_id || "",
    category_id: incentivesData.category_id || "",
    cited_date: incentivesData.cited_date || "",
    cited_where: incentivesData.cited_where || "",
    date_submitted: incentivesData.date_submitted || "",
    doi_or_full: incentivesData.doi_or_full || "",
    presentation_date: incentivesData.presentation_date || "",
    presentation_location: incentivesData.presentation_location || "",
    presented_where: incentivesData.presented_where || "",
    publication_date: incentivesData.publication_date || "",
    published_where: incentivesData.published_where || "",
    research_id: incentivesData.research_id || "",
    status_desc: incentivesData.status_desc || "",
    status_id: incentivesData.status_id || "",
    title: incentivesData.title || "",
    user_id: incentivesData.user_id || "",
    authors: incentivesData.authors || [],
    departments: incentivesData.departments || [],
    deptagendas: incentivesData.deptagendas || [],
    instagendas: incentivesData.instagendas || [],
    keywords: incentivesData.keywords || [],
    students: incentivesData.students || [],
  });

  const [selectedFiles, setSelectedFiles] = useState(
    incentivesData.files.reduce((acc, file) => {
      acc[file.file_type] = file;
      return acc;
    }, {})
  );

  useEffect(() => {
    setFormData({
      abstract: incentivesData.abstract || "",
      application_id: incentivesData.application_id || "",
      camp_id: incentivesData.camp_id || "",
      category_id: incentivesData.category_id || "",
      cited_date: incentivesData.cited_date || "",
      cited_where: incentivesData.cited_where || "",
      date_submitted: incentivesData.date_submitted || "",
      doi_or_full: incentivesData.doi_or_full || "",
      presentation_date: incentivesData.presentation_date || "",
      presentation_location: incentivesData.presentation_location || "",
      presented_where: incentivesData.presented_where || "",
      publication_date: incentivesData.publication_date || "",
      published_where: incentivesData.published_where || "",
      research_id: incentivesData.research_id || "",
      status_desc: incentivesData.status_desc || "",
      status_id: incentivesData.status_id || "",
      title: incentivesData.title || "",
      user_id: incentivesData.user_id || "",
      authors: incentivesData.authors || [],
      departments: incentivesData.departments || [],
      deptagendas: incentivesData.deptagendas || [],
      instagendas: incentivesData.instagendas || [],
      keywords: incentivesData.keywords || [],
      students: incentivesData.students || [],
    });

    setSelectedFiles(incentivesData.files.reduce((acc, file) => {
      acc[file.file_type] = file;
      return acc;
    }, {}));
  }, [incentivesData]);

  console.log(formData);
  console.log(selectedFiles);

  const handleChange = (event) => {
    const { name, value, files, dataset } = event.target;
    if (event.target.type === "file" && files && files.length > 0) {
      const file = files[0];
      const fileType = dataset.fileType;
      const customFile = new File([file], file.name, {
        type: fileType,
        lastModified: file.lastModified,
      });
      setSelectedFiles({
        ...selectedFiles,
        [name]: customFile,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleContinue = () => {
    handleNext(formData, selectedFiles);
  };




  return (
    <Container fluid style={{ height: "100vh" }}>
        <Row style={{ padding: 0, margin: 0 }}>
          <h2 className="titleFont" style={{ justifyContent: "center", alignContent: "center", }}>
            Research Incentives Application
          </h2>
        </Row>

        <Row style={{ alignContent: "center", padding: 0, margin: 0, }}>
          <h3 style={{fontSize: "0.8rem", paddingLeft: "3rem", paddingRight: "3rem"}}>Step 2 of 3</h3>
          <ProgressBar style={{ padding: 0 }} variant="warning" now={66} />
        </Row>


        <Form>
          <Row className="mb-2" style={{ paddingLeft: "3rem", paddingRight: "3rem" }}>
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Category 1</Form.Label>
              <p className="paragraph">
                Research paper presented in national or international
                conferences held within the Philippines and/or published in the
                Conference proceedings (excluding regional or local
                conferences).
              </p>
            </Form.Group>
            <FileInput
              label="Acceptance Letter"
              name="acceptance_letter"
              value={selectedFiles["acceptance letter"]?.file_path}
              onChange={handleChange}
              disabled={!isEditMode}
              dataFileType="Acceptance Letter"
            />
          </Row>

          <Row className="mb-4" style={{ paddingLeft: "3rem", paddingRight: "3rem" }}>
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Date of Presentation</Form.Label>
              <Form.Control
                type="date"
                name="presentation_date"
                value={formData.presentation_date ? formatDate(formData.presentation_date) : ""}
                onChange={handleChange}
                readOnly={!isEditMode}
              />
            </Form.Group>
            <FileInput
              label="Proof that paper has undergone a peer review"
              name="proof_peer_review"
              value={selectedFiles["proof that paper has undergone a peer review"]?.file_path}
              onChange={handleChange}
              disabled={!isEditMode}
              dataFileType="Proof that paper has undergone a peer review"
            />
          </Row>

          <Row className="mb-4" style={{ paddingLeft: "3rem", paddingRight: "3rem" }}>
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Location of Presentation</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="presentation_location"
                value={formData.presentation_location}
                onChange={handleChange}
                readOnly={!isEditMode}
              />
            </Form.Group>
            <FileInput
              label="Conference Proceedings"
              name="conference_proceedings"
              value={selectedFiles["conference proceedings"]?.file_path}
              onChange={handleChange}
              disabled={!isEditMode}
              dataFileType="Conference Proceedings"
            />
          </Row>

          <Row className="mb-4" style={{ paddingLeft: "3rem", paddingRight: "3rem" }}>
            <FileInput
              label="Certificate of Presentation"
              name="presentation_certificate"
              value={selectedFiles["certificate of presentation"]?.file_path}
              onChange={handleChange}
              disabled={!isEditMode}
              dataFileType="Certificate of Presentation"
            />
            <FileInput
              label="Conference Program"
              name="conference_program"
              value={selectedFiles["conference program"]?.file_path}
              onChange={handleChange}
              disabled={!isEditMode}
              dataFileType="Conference Program"
            />
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
    </Container>
  );
};

export default IncentivesPageC1;
