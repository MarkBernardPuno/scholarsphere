import React, { useState, useEffect } from 'react';
import FileInput from '../../components/common/FileInput';
import './IncentivesPage.css';
import { Container, Row, Col, Button, ProgressBar, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const IncentivesPageC5 = ({
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

    if (name === 'publication_date' || name === 'published_where') {
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
            <Form.Label className="titleFont">Category 5</Form.Label>
            <p className="paragraph">
              Research paper published in an international refereed Journal <br /> <br />
              International Refereed Journals - are journals included in the Thomson Reuters Master
              Journal List/Clarivate Master List of Scopus Indexed Journals or International
              Scientific Indexing (ISI) Journals
            </p>
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
          <FileInput
            label="Screencap of Proof of International Refereed Journal"
            name="screencap_of_proof"
            value={selectedFiles['screencap of proof of national refereed journal']}
            onChange={handleChange}
            dataFileType="Screencap of Proof of International Refereed Journal"
            id="screencapOfProof"
            disabled={!isEditMode}
          />
        </Row>

        <Row
          className="mb-4"
          style={{
            paddingLeft: '3rem',
            paddingRight: '3rem',
            paddingTop: '1rem',
          }}
        >
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Date of Publication</Form.Label>
            <Form.Control
              type="date"
              name="publication_date"
              value={formData.publication_date ? formatDate(formData.publication_date) : ''}
              onChange={handleChange}
              readOnly={!isEditMode}
            />
          </Form.Group>

          <FileInput
            label="Screencap of Abstract in the journal website"
            name="screencap_of_abstract"
            value={selectedFiles['screencap of abstract in the journal website']}
            onChange={handleChange}
            dataFileType="Screencap of Abstract in the journal website"
            id="screencapOfAbstract"
            disabled={!isEditMode}
          />
        </Row>

        <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
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
              readOnly={!isEditMode}
            />
          </Form.Group>

          <FileInput
            label="Screencap of Editorial Board"
            name="screencap_of_editorial"
            value={selectedFiles['screencap of editorial board']}
            onChange={handleChange}
            dataFileType="Screencap of Editorial Board"
            id="screencapOfEditorial"
            disabled={!isEditMode}
          />
        </Row>

        <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <FileInput
            label="Full paper/ DOI of the paper"
            name="full_or_doi"
            value={selectedFiles['full paper/ doi of the paper']}
            onChange={handleChange}
            dataFileType="Full paper/ DOI of the paper"
            id="doiOrFull"
            disabled={!isEditMode}
          />

          <FileInput
            label="Screencap of Acceptance Policy"
            name="screencap_of_acceptance"
            value={selectedFiles['screencap of acceptance policy']}
            onChange={handleChange}
            dataFileType="Screencap of Acceptance Policy"
            id="screencapOfAcceptance"
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

export default IncentivesPageC5;
