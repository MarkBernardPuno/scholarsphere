import React, { useState, useEffect } from 'react';
import FileInput from '../../components/common/FileInput';
import './IncentivesPage.css';
import { Container, Row, Col, Button, ProgressBar, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const IncentivesPageC2 = ({
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatFilePath = (filePath) => {
    return filePath ? filePath.replace(/^uploads\\/, '') : 'Choose file';
  };

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
            <Form.Label className="labelFont">Category 2</Form.Label>
            <p className="paragraph">
              First Prize Winning Entry to Palanca Awards, Doreen Fernandez Food Essay Contest, NVM
              Gonzales Writing Contest and other equally prestigious national competitions
              recognized and categorized as such by the Executive Management Committee / Research
              Council
            </p>
          </Form.Group>

          <FileInput
            label="Certificate of Presentation"
            name="presentation_certificate"
            value={selectedFiles['certificate of presentation']}
            onChange={handleChange}
            dataFileType="Certificate of Presentation"
            id="certificateOfPresentation"
            disabled={!isEditMode}
          />
        </Row>

        <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Col style={{ paddingLeft: '3rem', paddingRight: '3rem' }}></Col>

          <FileInput
            label="Pictures of Award"
            name="award_pictures"
            value={selectedFiles['pictures of award']}
            onChange={handleChange}
            dataFileType="Pictures of Award"
            id="picturesOfAward"
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
            label="Copies of Souvenir Program"
            name="souvenir_program_copies"
            value={selectedFiles['copies of souvenir program']}
            onChange={handleChange}
            dataFileType="Copies of Souvenir Program"
            id="copiesOfSouvenirProgram"
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
            label="Profile of awarding organization"
            name="awarding_org"
            value={selectedFiles['profile of awarding organization']}
            onChange={handleChange}
            dataFileType="Profile of awarding organization"
            id="profileOfAwardingOrganization"
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

export default IncentivesPageC2;
