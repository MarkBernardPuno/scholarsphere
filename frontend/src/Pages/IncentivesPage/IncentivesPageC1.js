import React, { useState, useEffect } from 'react';
import FileInput from '../../components/common/FileInput';
import './IncentivesPage.css';
import { Container, Row, Col, Button, ProgressBar, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const IncentivesPageC1 = ({
  handleReturn,
  handleNext,
  applicationId,
  isEditMode,
  incentivesData,
}) => {
  const [formData, setFormData] = useState({
    abstract: incentivesData.abstract || '',
    application_id: incentivesData.application_id || '',
    camp_id: incentivesData.camp_id || '',
    category_id: incentivesData.category_id || '',
    cited_date: incentivesData.cited_date || '',
    cited_where: incentivesData.cited_where || '',
    date_submitted: incentivesData.date_submitted || '',
    doi_or_full: incentivesData.doi_or_full || '',
    presentation_date: incentivesData.presentation_date || '',
    presentation_location: incentivesData.presentation_location || '',
    presented_where: incentivesData.presented_where || '',
    publication_date: incentivesData.publication_date || '',
    published_where: incentivesData.published_where || '',
    research_id: incentivesData.research_id || '',
    status_desc: incentivesData.status_desc || '',
    status_id: incentivesData.status_id || '',
    title: incentivesData.title || '',
    user_id: incentivesData.user_id || '',
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
    }, {}),
  );

  useEffect(() => {
    setFormData({
      abstract: incentivesData.abstract || '',
      application_id: incentivesData.application_id || '',
      camp_id: incentivesData.camp_id || '',
      category_id: incentivesData.category_id || '',
      cited_date: incentivesData.cited_date || '',
      cited_where: incentivesData.cited_where || '',
      date_submitted: incentivesData.date_submitted || '',
      doi_or_full: incentivesData.doi_or_full || '',
      presentation_date: incentivesData.presentation_date || '',
      presentation_location: incentivesData.presentation_location || '',
      presented_where: incentivesData.presented_where || '',
      publication_date: incentivesData.publication_date || '',
      published_where: incentivesData.published_where || '',
      research_id: incentivesData.research_id || '',
      status_desc: incentivesData.status_desc || '',
      status_id: incentivesData.status_id || '',
      title: incentivesData.title || '',
      user_id: incentivesData.user_id || '',
      authors: incentivesData.authors || [],
      departments: incentivesData.departments || [],
      deptagendas: incentivesData.deptagendas || [],
      instagendas: incentivesData.instagendas || [],
      keywords: incentivesData.keywords || [],
      students: incentivesData.students || [],
    });

    setSelectedFiles(
      incentivesData.files.reduce((acc, file) => {
        acc[file.file_type] = file;
        return acc;
      }, {}),
    );
  }, [incentivesData]);

  console.log(formData);
  console.log(selectedFiles);

  const handleChange = (event) => {
    const { name, value, files, dataset } = event.target;

    if (name === 'presentation_date' || name === 'presentation_location') {
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

  // Use shared formatDate and formatFilePath if needed

  return (
    <Container fluid style={{ height: '100vh' }}>
      <Row style={{ padding: 0, margin: 0 }}>
        <h2 className="titleFont" style={{ justifyContent: 'center', alignContent: 'center' }}>
          Research Incentives Application
        </h2>
      </Row>

      <Row style={{ alignContent: 'center', padding: 0, margin: 0 }}>
        <h3 style={{ fontSize: '0.8rem', paddingLeft: '3rem', paddingRight: '3rem' }}>
          Step 2 of 3
        </h3>
        <ProgressBar style={{ padding: 0 }} variant="warning" now={66} />
      </Row>

      <Form>
        <Row className="mb-2" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Category 1</Form.Label>
            <p className="paragraph">
              Research paper presented in national or international conferences held within the
              Philippines and/or published in the Conference proceedings (excluding regional or
              local conferences).
            </p>
          </Form.Group>

          <FileInput
            label="Acceptance Letter"
            name="acceptance_letter"
            value={selectedFiles['acceptance letter']}
            onChange={handleChange}
            dataFileType="Acceptance Letter"
            id="acceptanceLetter"
            disabled={!isEditMode}
          />
        </Row>

        <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Date of Presentation</Form.Label>
            <Form.Control
              type="date"
              name="presentation_date"
              value={formData.presentation_date ? formatDate(formData.presentation_date) : ''}
              onChange={handleChange}
              readOnly={!isEditMode}
            />
          </Form.Group>

          <FileInput
            label="Proof that paper has undergone a peer review"
            name="proof_peer_review"
            value={selectedFiles['proof that paper has undergone a peer review']}
            onChange={handleChange}
            dataFileType="Proof that paper has undergone a peer review"
            id="proofPeerReview"
            disabled={!isEditMode}
          />
        </Row>

        <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
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
            value={selectedFiles['conference proceedings']}
            onChange={handleChange}
            dataFileType="Conference Proceedings"
            id="conferenceProceedings"
            disabled={!isEditMode}
          />
        </Row>

        <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <FileInput
            label="Certificate of Presentation"
            name="presentation_certificate"
            value={selectedFiles['certificate of presentation']}
            onChange={handleChange}
            dataFileType="Certificate of Presentation"
            id="certificateOfPresentation"
            disabled={!isEditMode}
          />

          <FileInput
            label="Conference Program"
            name="conference_program"
            value={selectedFiles['conference program']}
            onChange={handleChange}
            dataFileType="Conference Program"
            id="conferenceProgram"
            disabled={!isEditMode}
          />
        </Row>
      </Form>

      <Row
        style={{
          height: '5vh',
          margin: 0,
          paddingLeft: '20rem',
          paddingRight: '20rem',
        }}
      >
        <Button variant="outline-warning" as={Col} onClick={handleReturn}>
          Return
        </Button>{' '}
        <Col md="auto"></Col>
        <Button variant="warning" as={Col} onClick={handleContinue}>
          Continue
        </Button>{' '}
      </Row>
    </Container>
  );
};

export default IncentivesPageC1;
