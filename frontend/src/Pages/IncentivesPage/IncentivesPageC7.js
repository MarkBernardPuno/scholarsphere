import React, { useState, useEffect } from "react";
import "./IncentivesPage.css";
import { Container, Row, Col, Button, ProgressBar, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const IncentivesPageC7 = ({ handleReturn, handleNext, applicationId, isEditMode, incentivesData }) => {
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

    if (name === "cited_date") {
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

  const handleContinue = () => {
    handleNext(formData, selectedFiles);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatFilePath = (filePath) => {
    return filePath ? filePath.replace(/^uploads\\/, '') : "Choose file";
  };

  return (
    <Container fluid style={{ height: "100vh" }}>
       <Row style={{ padding: 0, margin: 0 }}>
          <h2 className="titleFont" style={{ justifyContent: "center", alignContent: "center" }}>
            Research Incentives Application
          </h2>
        </Row>

        <Row style={{ alignContent: "center", padding: 0, margin: 0, }}>
          <h3 style={{fontSize: "0.8rem", paddingLeft: "3rem", paddingRight: "3rem"}}>Step 2 of 3</h3>
          <ProgressBar style={{ padding: 0 }} variant="warning" now={66} />
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
                name="cited_date"
                value={formData.cited_date ? formatDate(formData.cited_date) : ""}
                onChange={handleChange} 
                readOnly={!isEditMode}
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
                  disabled={!isEditMode}
                />
                <label htmlFor="citedTwoYears" className="custom-file-label">
                  {formatFilePath(selectedFiles['full paper (citing paper) published at most 2 years ago']?.file_path) || "Choose file"}
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
                  disabled={!isEditMode}
                />
                <label htmlFor="citedFiveYears" className="custom-file-label">
                  {formatFilePath(selectedFiles['full paper (cited) published at most 5 years ago']?.file_path) || "Choose file"}
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
                  disabled={!isEditMode}
                />
                <label htmlFor="proofCitingPaper" className="custom-file-label">
                {formatFilePath(selectedFiles['proof that citing paper is a national refereed journal']?.file_path) || "Choose file"}
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
    </Container>
  );
};

export default IncentivesPageC7;
