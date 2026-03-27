import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, ProgressBar, Row } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/auth-context';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import './IncentivesPage.css';

const IncentivesPage1 = ({ handleReturn, handleNext, applicationId, isEditMode }) => {
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [incentivesData, setincentivesData] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [instAgenda, setInstAgenda] = useState([]);
  const [filteredDeptAgendas, setFilteredDeptAgendas] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDeptAgendas, setAllDeptAgendas] = useState([]);
  const initialFormData = location.state?.formData || {
    camp_id: '',
    title: '',
    abstract: '',
    authors: [],
    instagendas: [],
    deptagendas: [],
    keywords: [],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFiles, setSelectedFiles] = useState(location.state?.selectedFiles || {});

  useEffect(() => {
    if (applicationId) {
      axios
        .get(`http://localhost:5000/v1/incentivesapplication/main/${applicationId}`)
        .then((response) => {
          console.log(response.data.data);
          setincentivesData(response.data.data);
        })
        .catch((error) => console.error('Error fetching evaluation data:', error));
    }
  }, [applicationId]);

  useEffect(() => {
    if (incentivesData) {
      const {
        camp_id,
        user_id,
        research_id,
        category_id,
        title,
        abstract,
        presented_where,
        authors,
        departments,
        deptagendas,
        instagendas,
        keywords,
      } = incentivesData;

      setFormData({
        ...formData,
        camp_id,
        user_id,
        research_id,
        title,
        abstract,
        presented_where,
        category: category_id,
        authors: authors.map((author) => ({ value: author.author_id, label: author.author_name })),
        departments: departments.map((dept) => ({ value: dept.dept_id, label: dept.dept_name })),
        deptagendas: deptagendas.map((agenda) => ({
          value: agenda.deptagenda_id,
          label: agenda.deptagenda_name,
        })),
        instagendas: instagendas.map((agenda) => ({
          value: agenda.instagenda_id,
          label: agenda.instagenda_name,
        })),
        keywords: keywords.map((keyword) => ({
          value: keyword.keyword_id,
          label: keyword.keywords_name,
        })),
      });
    }
  }, [incentivesData]);

  console.log('incentivesData', incentivesData);
  console.log('formData', formData);

  useEffect(() => {
    axios
      .get('http://localhost:5000/v1/campus/main')
      .then((response) => setCampuses(response.data.data))
      .catch((error) => console.error('Error fetching campuses:', error));

    axios
      .get('http://localhost:5000/v1/instagenda/main')
      .then((response) => setInstAgenda(response.data.data))
      .catch((error) => console.error('Error fetching instagenda:', error));

    axios
      .get('http://localhost:5000/v1/departments/main')
      .then((response) => {
        const deptData = response.data.data;
        setAllDepartments(deptData);
        setDepartments(
          deptData.map((item) => ({
            value: item.dept_id,
            label: item.dept_name,
          })),
        );
      })
      .catch((error) => console.error('Error fetching departments:', error));

    axios
      .get('http://localhost:5000/v1/deptagenda/main')
      .then((response) => setAllDeptAgendas(response.data.data))
      .catch((error) => console.error('Error fetching deptagenda:', error));

    axios
      .get('http://localhost:5000/v1/author/main')
      .then((response) =>
        setAuthors(
          response.data.data.map((item) => ({
            value: item.author_id,
            label: `${item.author_name} (${item.department})`,
          })),
        ),
      )
      .catch((error) => console.error('Error fetching authors:', error));

    axios
      .get('http://localhost:5000/v1/keywords/main')
      .then((response) =>
        setKeywords(
          response.data.data.map((item) => ({
            value: item.keywords_id,
            label: item.keywords_name,
          })),
        ),
      )
      .catch((error) => console.error('Error fetching keywords:', error));

    axios
      .get('http://localhost:5000/v1/category/main')
      .then((response) => {
        setCategories(response.data.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContinue = () => {
    const selectedCategory = formData.category;
    handleNext(selectedCategory, incentivesData);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    navigate('/profile/${user.author_id}/researches');
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '2.7rem',
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '2.7rem',
      overflow: 'auto',
    }),
  };

  return (
    <Container fluid style={{ height: '100vh' }}>
      <Row style={{ padding: 0, margin: 0 }}>
        <h2
          className="titleFont"
          style={{
            justifyContent: 'center',
            alignContent: 'center',
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
        <h3 style={{ fontSize: '0.8rem', paddingLeft: '3rem', paddingRight: '3rem' }}>
          Step 1 of 3
        </h3>
        <ProgressBar style={{ padding: 0 }} variant="warning" now={33} />
      </Row>

      <Form>
        <Row className="mb-1" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Campus</Form.Label>
            <Form.Select name="campus" value={formData.camp_id} disabled={!isEditMode}>
              <option value="">Select Campus</option>
              {campuses.map((campus) => (
                <option key={campus.camp_id} value={campus.camp_id}>
                  {campus.camp_name || 'Unknown'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Institutional Research Agenda</Form.Label>
            <Select
              isMulti
              name="instagendas"
              options={instAgenda}
              classNamePrefix="select"
              value={formData.instagendas}
              styles={customSelectStyles}
              isDisabled={!isEditMode}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Department</Form.Label>
            <Select
              isMulti
              name="departments"
              options={departments}
              classNamePrefix="select"
              value={formData.departments}
              styles={customSelectStyles}
              isDisabled={!isEditMode}
            />
          </Form.Group>

          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Department Research Agenda</Form.Label>
            <Select
              isMulti
              name="deptagendas"
              options={filteredDeptAgendas}
              classNamePrefix="select"
              value={formData.deptagendas}
              styles={customSelectStyles}
              isDisabled={!isEditMode}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col}>
            <Form.Label className="labelFont">Research Title</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="title"
              value={formData.title}
              readOnly={!isEditMode}
            />

            <Form.Label className="labelFont">Author/s</Form.Label>
            <Select
              isMulti
              name="authors"
              options={authors}
              classNamePrefix="select"
              value={formData.authors}
              styles={customSelectStyles}
              isDisabled={!isEditMode}
            />
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label className="labelFont">Abstract</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="abstract"
              value={formData.abstract}
              readOnly={!isEditMode}
            />

            <Form.Label className="labelFont">Keywords</Form.Label>
            <CreatableSelect
              isMulti
              name="keywords"
              options={keywords}
              className="basic-multi-select"
              classNamePrefix="select"
              value={formData.keywords}
              styles={customSelectStyles}
              isDisabled={!isEditMode}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3" style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
          <Form.Group as={Col}>
            <Form.Label className="labelFont">Conference Title / Refereed Journal</Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              name="presented_where"
              value={formData.presented_where}
              onChange={handleChange}
              readOnly={!isEditMode}
            />
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label className="labelFont">Category</Form.Label>
            <Form.Select
              aria-label="Default select example"
              required
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={!isEditMode}
            >
              <option value="">Select Category</option>
              {categories.map((category, index) => (
                <option key={category.category_id} value={category.category_id}>
                  {`${index + 1}. ${category.category_description?.toUpperCase() || 'Unknown'}`}
                </option>
              ))}
            </Form.Select>
            <p className="moreInfo">
              <span className="underline-on-hover">More Information</span>
            </p>
          </Form.Group>
        </Row>

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
      </Form>
    </Container>
  );
};

export default IncentivesPage1;
