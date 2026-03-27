import apiClient from '../../api/apiClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, ProgressBar, Row, Spinner } from 'react-bootstrap';
import FileInput from '../../components/common/FileInput';
import { message } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TopBar from '../../components/topbar';
import { useAuthContext } from '../../contexts/auth-context';
import './ApplyIncentives.css';

const ApplyIncentives2 = () => {
  const { evaluationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  console.log(user);
  const [formData, setFormData] = useState(location.state?.formData);
  const initialSelectedFiles = location.state?.selectedFiles || {
    eval_form: null,
    turnitin: null,
    grammarly: null,
    full_paper: null,
    incentive_form: null,
  };
  const [selectedFiles, setSelectedFiles] = useState(initialSelectedFiles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedFiles(initialSelectedFiles);
  }, [location.state]);

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString();

  console.log(formData);
  console.log(selectedFiles);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      formattedDate: formattedDate,
      user_id: user.user_id,
    }));
  }, [formattedDate, user.user_id]);

  const handleChange = (event) => {
    const { name, files, dataset } = event.target;
    if (files && files.length > 0) {
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
    }
  };

  const handleReturn = () => {
    const selectedCategory = formData.category_id;
    const targetPage = `/apply-category-${selectedCategory}/${evaluationId}`;
    navigate(targetPage, {
      state: { formData, selectedFiles: selectedFiles },
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        '/incentivesapplication/update_research',
        {
          formData: formData,
        },
      );

      if (response.status === 201) {
        const generatedResearchId = response.data.research_id;

        for (const key in selectedFiles) {
          if (selectedFiles.hasOwnProperty(key)) {
            const file = selectedFiles[key];
            if (file) {
              const uploadData = new FormData();
              uploadData.append('research_id', generatedResearchId);
              uploadData.append('category_id', formData.category_id);
              uploadData.append('file_type', file.type);
              uploadData.append('file', file);

              try {
                const uploadResponse = await apiClient.post(
                  '/file/upload',
                  uploadData,
                  {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  },
                );

                if (uploadResponse.status !== 200) {
                  console.error('Failed to upload file:', file.name);
                  return;
                } else {
                  console.log(`File ${file.name} uploaded successfully`);
                }
              } catch (error) {
                console.error('Error uploading file:', file.name, error);
                message.error('Failed to upload file: ' + file.name);
                return;
              }
            }
          }
        }

        message.success('Research data and files submitted successfully!');
        console.log('Research data and files submitted successfully!');
        navigate('/profile/${user.author_id}/researches');
      } else if (response.status === 500) {
        message.error('Submission failed: Resource not found (404).');
        console.error('Submission failed: Resource not found (404).');
      } else {
        message.error('Failed to submit research data');
        console.error('Failed to submit research data');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid style={{ height: '100vh' }}>
      <Row style={{ height: '15vh' }}>
        <TopBar isLoggedIn={3} />
      </Row>

      <Row style={{ height: '80vh', margin: 0 }}>
        <Row style={{ padding: 0, margin: 0 }}>
          <h2
            className="titleFont p-2"
            style={{
              padding: 0,
              margin: 0,
              justifyContent: 'center',
              alignContent: 'center',
              width: '100vw',
            }}
          >
            Research Incentives Application
          </h2>
        </Row>

        <Row
          style={{
            alignContent: 'center',
            padding: 0,
            margin: 0,
          }}
        >
          <ProgressBar style={{ padding: 0 }} variant="warning" now={100} className="mb-3" />
        </Row>

        <Form>
          <Row className="mb-2" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="titleFont">Research Evaluation Form</Form.Label>
              <p className="paragraph">
                Please attach the following forms and supporting documents:
              </p>
            </Form.Group>

            <Col></Col>
          </Row>

          <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <FileInput
              label="Research Evaluation Form (TIP - ARU - 036)"
              name="eval_form"
              value={selectedFiles.eval_form}
              onChange={handleChange}
              dataFileType="TIP-ARU-036"
              id="researchEvaluationForm"
            />
            <FileInput
              label="Full Paper"
              name="full_paper"
              value={selectedFiles.full_paper}
              onChange={handleChange}
              dataFileType="Full Paper"
              id="fullPaper"
            />
          </Row>

          <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <FileInput
              label="Turnitin"
              name="turnitin"
              value={selectedFiles.turnitin}
              onChange={handleChange}
              dataFileType="Turnitin"
              id="turnitin"
            />
            <FileInput
              label="Research Incentive Form (TIP - ARU - 028)"
              name="incentive_form"
              value={selectedFiles.incentive_form}
              onChange={handleChange}
              dataFileType="TIP-ARU-028"
              id="researchIncentiveForm"
            />
          </Row>

          <Row className="mb-4" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            <FileInput
              label="Grammarly"
              name="grammarly"
              value={selectedFiles.grammarly}
              onChange={handleChange}
              dataFileType="Grammarly"
              id="grammarly"
            />
            <Col></Col>
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
          <Button variant="warning" as={Col} onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Submit'}
          </Button>{' '}
        </Row>
      </Row>
    </Container>
  );
};

export default ApplyIncentives2;
