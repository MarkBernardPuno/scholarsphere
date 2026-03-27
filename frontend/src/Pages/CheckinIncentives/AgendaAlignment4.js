import { Checkbox, Form, Input } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, ProgressBar, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const AgendaAlignment4 = ({ handleReturn, handleNext }) => {
  const { research_id } = useParams();
  console.log(research_id);
  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      text2:
        '1. Is the Research Paper Conference / Journal classified as not Predatory and is included in the list of accepted conferences and journals? (See Appendices for the list of accepted conferences and journals)',
      checkbox1: false,
      checkbox2: false,
      textarea: '',
    },
    {
      key: '2',
      text2:
        '2.a Did the Research Paper require obtaining ethics clearance because of possible risk of injury to people, animals, or nature? (if applicable)',
      checkbox1: false,
      checkbox2: false,
      textarea: '',
    },
    {
      key: '3',
      text2: '2.b If yes, did the research paper obtain ethics clearance? (if applicable)',
      checkbox1: false,
      checkbox2: false,
      textarea: '',
    },
    {
      key: '4',
      text2:
        '3.a Did the Research Paper involve extensive data (personal, and technical) covered by data privacy or non-disclosure agreement? (if applicable)',
      checkbox1: false,
      checkbox2: false,
      textarea: '',
    },
    {
      key: '5',
      text2:
        '3.b. If yes, DId the Research Paper obtain consent/approval for disclosure? (if applicable)',
      checkbox1: false,
      checkbox2: false,
      textarea: '',
    },
    {
      key: '5',
      text2:
        '4. Does the research paper meet the criteria for the allowable Originality check percentage result using Turnitin, Unicheck, or any similarity tool <15%?',
      checkbox1: false,
      checkbox2: false,
      textarea: '',
    },
    {
      key: '6',
      text2: '5. Does the research paper have an overall score of at least 90% in grammarly?',
      checkbox1: false,
      checkbox2: false,
      textarea: '',
    },
  ]);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({
    title: '',
    inst_agenda: '',
    dept_agenda: '',
    presented_where: '',
    presentation_location: '',
    presentation_date: '',
    published_where: '',
    publication_date: '',
    doi_or_full: '',
  });

  useEffect(() => {
    fetchData();
  }, [research_id]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/v1/search/main`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          research_id: research_id,
        },
      });
      setData(response.data.data);
      setFormData(response.data.data[0]); // Set form data with fetched data
      // outputs the data on the console
      console.log('API Response:', response.data.data);
      if (response.data.data.length > 0) {
        console.log(response.data.data[0].title);
      } else {
        console.log('No data available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    console.log('Edit mode:', editMode);
  }, [editMode]);

  const handleEdit = () => {
    setEditMode(true);
    console.log('Edit mode:', editMode);
  };

  const handleSave = async () => {
    try {
      console.log('Pressed Save');
      await axios.put(`http://127.0.0.1:5000/v1/researches/5`, formData);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handlePublicationDateChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, publication_date: value });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const formattedDate = new Date(date).toISOString().split('T')[0];
    return formattedDate;
  };

  const handleDateChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, presentation_date: value });
  };

  const handleDelete = async () => {
    try {
      console.log('Delete button clicked');
      await axios.delete(`http://127.0.0.1:5000/v1/researches/5`);
      const backtoSearch = `/search`;
    } catch (error) {
      console.error('Error deleting research:', error);
    }
  };
  const columns = [
    {
      title: 'Criteria',
      dataIndex: 'text2',
      key: 'text2',
      Ellipsis: true,
      width: '50%',
      aligh: 'center',
      render: (text) => (
        <div>
          {text.split('\n').map((line, index) => (
            <p key={index} style={{ margin: 0 }}>
              {line}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: 'Yes',
      dataIndex: 'checkbox1',
      key: 'checkbox1',
      render: (checked, record, index) => (
        <Checkbox checked={checked} onChange={(e) => handleCheckboxChange(e, index, 'checkbox1')} />
      ),
    },
    {
      title: 'No',
      dataIndex: 'checkbox2',
      key: 'checkbox2',
      render: (checked, record, index) => (
        <Checkbox
          checked={checked}
          style={dataSource[index].isCheckbox2Clicked ? yellowCheckboxStyle : undefined}
          onChange={(e) => handleCheckboxChange(e, index, 'checkbox2')}
        />
      ),
    },
    {
      title: 'Remarks',
      title: 'Remarks',
      dataIndex: 'textarea',
      key: 'textarea',
      render: (text, record, index) => (
        <Input.TextArea
          rows={4}
          value={text}
          readOnly={!editMode}
          onChange={(e) => handleTextareaChange(e, index)}
        />
      ),
    },
  ];
  const yellowCheckboxStyle = {
    backgroundColor: 'yellow', // Set background color to yellow
    border: '1px solid yellow', // Set border color to yellow
  };
  const handleCheckboxChange = (e, index, key) => {
    const newData = [...dataSource];
    newData[index][key] = e.target.checked;
    setDataSource(newData);
  };

  const handleTextareaChange = (e, index) => {
    const newData = [...dataSource];
    newData[index].textarea = e.target.value;
    setDataSource(newData);
  };

  return (
    <Container fluid>
      <Row
        lassName="d-flex align-items-center"
        style={{
          paddingLeft: '1rem',
          gap: '20px',
          paddingRight: '1rem',
          fontFamily: 'Kaisei',
        }}
      >
        <Col>
          <h2 className="titleFont p-2">Research Evaluation Checklist</h2>
        </Col>
        <Col xs={6} style={{ paddingLeft: '50vh', paddingTop: '5px' }}></Col>
      </Row>

      <ProgressBar variant="warning" now={100} className="mb-3" />

      {data.length > 0 && (
        <>
          <Form>
            <Row>
              <Col style={{ marginLeft: '40px', marginTop: '0px' }}>
                <h2 className="titleFont p-2">IV. Supporting Documents </h2>
              </Col>
            </Row>
          </Form>
          <div style={{ marginLeft: '20px', marginRight: '20px' }}></div>
          <Form>
            <Row className="mb-1" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}></Row>
          </Form>
          <Row style={{ paddingLeft: '20rem', paddingRight: '20rem' }}>
            {editMode ? (
              <Button variant="outline-warning" onClick={handleSave}>
                Save
              </Button>
            ) : (
              <>
                <Button variant="outline-warning" as={Col} onClick={handleReturn}>
                  Return
                </Button>{' '}
                <Col md="auto"></Col>
                <Button variant="warning" as={Col} onClick={handleNext}>
                  Continue
                </Button>{' '}
              </>
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export default AgendaAlignment4;
