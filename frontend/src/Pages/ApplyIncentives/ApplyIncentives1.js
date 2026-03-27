import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TopBar from "../../components/topbar";
import { useAuthContext } from "../../contexts/auth-context";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import "./ApplyIncentives.css";

const ApplyIncentives1 = () => {
  const { evaluationId } = useParams();
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [evaluationData, setEvaluationData] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [instAgenda, setInstAgenda] = useState([]);
  const [filteredDeptAgendas, setFilteredDeptAgendas] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDeptAgendas, setAllDeptAgendas] = useState([]);
  const [researchOptions, setResearchOptions] = useState([]);
  const initialFormData = location.state?.formData || {
    camp_id: "",
    title: "",
    abstract: "",
    authors: [],
    instagendas: [],
    deptagendas: [],
    keywords: [],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFiles, setSelectedFiles] = useState(
    location.state?.selectedFiles || {}
  );
  
  useEffect(() => {
    if (evaluationId) {
      axios.get(`http://localhost:5000/v1/incentivesevaluation/main/${evaluationId}`)
        .then(response => {
          console.log(response.data.data);
          setEvaluationData(response.data.data);
        })
        .catch(error => console.error("Error fetching evaluation data:", error));
    }
  }, [evaluationId]);

  useEffect(() => {
    if (evaluationData) {
      const {
        camp_id,
        user_id,
        research_id,
        title,
        abstract,
        authors,
        departments,
        deptagendas,
        instagendas,
        keywords
      } = evaluationData;

      setFormData({
        ...formData,
        camp_id,
        user_id,
        research_id,
        title,
        abstract,
        authors: authors.map(author => ({ value: author.author_id, label: author.author_name })),
        departments: departments.map(dept => ({ value: dept.dept_id, label: dept.dept_name })),
        deptagendas: deptagendas.map(agenda => ({ value: agenda.deptagenda_id, label: agenda.deptagenda_name })),
        instagendas: instagendas.map(agenda => ({ value: agenda.instagenda_id, label: agenda.instagenda_name })),
        keywords: keywords.map(keyword => ({ value: keyword.keyword_id, label: keyword.keywords_name }))
      });
    }
  }, [evaluationData]);

  console.log(evaluationData);
  console.log(formData);

  useEffect(() => {
    axios.get("http://localhost:5000/v1/campus/main")
      .then(response => setCampuses(response.data.data))
      .catch(error => console.error("Error fetching campuses:", error));

    axios.get("http://localhost:5000/v1/instagenda/main")
      .then(response => setInstAgenda(response.data.data))
      .catch(error => console.error("Error fetching instagenda:", error));

    axios.get("http://localhost:5000/v1/departments/main")
      .then(response => {
        const deptData = response.data.data;
        setAllDepartments(deptData);
        setDepartments(deptData.map(item => ({
          value: item.dept_id,
          label: item.dept_name,
        })));
      })
      .catch(error => console.error("Error fetching departments:", error));
      
    axios.get("http://localhost:5000/v1/deptagenda/main")
      .then(response => setAllDeptAgendas(response.data.data))
      .catch(error => console.error("Error fetching deptagenda:", error));

    axios.get("http://localhost:5000/v1/author/main")
      .then(response => setAuthors(response.data.data.map(item => ({
        value: item.author_id,
        label: `${item.author_name} (${item.department})`,
      }))))
      .catch(error => console.error("Error fetching authors:", error));
    
    axios.get("http://localhost:5000/v1/keywords/main")
      .then(response => setKeywords(response.data.data.map(item => ({
        value: item.keywords_id,
        label: item.keywords_name,
      }))))
      .catch(error => console.error("Error fetching keywords:", error));

    axios.get("http://localhost:5000/v1/category/main")
      .then((response) => {
        setCategories(response.data.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
    
    axios
      .get("http://localhost:5000/v1/incentivesapplication/main")
      .then((response) => {
        const options = response.data.data.map((item) => ({
          value: item.research_id,
          label: item.presented_where,
        }));
        setResearchOptions(options);
      })
      .catch((error) => {
        console.error("Error fetching research data:", error);
      });
  }, []);


  const handleChange = event => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePresentedWhereChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        presented_where: selectedOption.value, // Store value only
        selectedPresentedWhereOption: selectedOption, // Keep the full option for display
      }));
    } else {
      setFormData({ ...formData, presented_where: "", selectedPresentedWhereOption: null });
    }
  };
  
  const handleCreatePresentedWhere = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setResearchOptions((prev) => [...prev, newOption]);
    setFormData((prev) => ({
      ...prev,
      presented_where: newOption.value, // Store only the value in formData
      selectedPresentedWhereOption: newOption, // Store the full option for display in CreatableSelect
    }));
  };

  const handleContinue = () => {
    const selectedCategory = formData.category;
    const targetPage = `/apply-category-${selectedCategory}/${evaluationId}`;
    const updatedFormData = { ...formData, category_id: selectedCategory };
    console.log("Updated formData for navigation:", updatedFormData);
    navigate(targetPage, {
      state: { formData: updatedFormData, selectedFiles: selectedFiles, evaluationId },
    });
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    navigate("/profile/${user.author_id}/researches");
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "2.7rem",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "2.7rem",
      overflow: "auto",
    }),
  };

  return (
    <Container fluid style={{ height: "100vh" }}>
      <Row style={{ height: "15vh" }}>
        <TopBar isLoggedIn={3} />
      </Row>

      <Row style={{ height: "80vh", margin: 0 }}>
        <Row style={{ padding: 0, margin: 0 }}>
          <h2
            className="titleFont"
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
          <h3 style={{fontSize: "0.8rem", paddingLeft: "3rem", paddingRight: "3rem"}}>Step 1 of 3</h3>
          <ProgressBar style={{ padding: 0 }} variant="warning" now={33} />
        </Row>

        <Form>
          <Row
            className="mb-1"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Campus</Form.Label>
              <Form.Select
                name="campus"
                value={formData.camp_id}
                disabled
              >
                <option value="">Select Campus</option>
                {campuses.map((campus) => (
                  <option key={campus.camp_id} value={campus.camp_id}>
                    {campus.camp_name || "Unknown"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Institutional Research Agenda
              </Form.Label>
              <Select
                isMulti
                name="instagendas"
                options={instAgenda}
                classNamePrefix="select"
                value={formData.instagendas}
                styles={customSelectStyles}
                isDisabled
              />
            </Form.Group>
          </Row>

          <Row
            className="mb-3"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Department</Form.Label>
              <Select
                isMulti
                name="departments"
                options={departments}
                classNamePrefix="select"
                value={formData.departments}
                styles={customSelectStyles}
                isDisabled
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Department Research Agenda
              </Form.Label>
              <Select
                isMulti
                name="deptagendas"
                options={filteredDeptAgendas}
                classNamePrefix="select"
                value={formData.deptagendas}
                styles={customSelectStyles}
                isDisabled
              />
            </Form.Group>
          </Row>

          <Row
            className="mb-3"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col}>
              <Form.Label className="labelFont">Research Title</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="title"
                value={formData.title}
                readOnly
              />

              <Form.Label className="labelFont">Author/s</Form.Label>
              <Select
                isMulti
                name="authors"
                options={authors}
                classNamePrefix="select"
                value={formData.authors}
                styles={customSelectStyles}
                isDisabled
              />
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Label className="labelFont">Abstract</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="abstract"
                value={formData.abstract}
                readOnly
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
                isDisabled
              />
            </Form.Group>
          </Row>

          <Row
            className="mb-3"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col}>
              <Form.Label className="labelFont">
                Conference Title / Refereed Journal
              </Form.Label>
              <CreatableSelect
                isClearable
                name="presented_where"
                options={researchOptions}
                className="basic-select"
                classNamePrefix="select"
                value={formData.selectedPresentedWhereOption}
                onChange={handlePresentedWhereChange}
                onCreateOption={handleCreatePresentedWhere} // Handle creating new options
                styles={customSelectStyles}
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
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {`${index + 1}. ${
                      category.category_description?.toUpperCase() || "Unknown"
                    }`}
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
              height: "5vh",
              margin: 0,
              paddingLeft: "20rem",
              paddingRight: "20rem",
            }}
          >
            <Button variant="outline-warning" as={Col} onClick={handleCancel}>
              Cancel
            </Button>{" "}
            <Col md="auto"></Col>
            <Button variant="warning" as={Col} onClick={handleContinue}>
              Continue
            </Button>{" "}
          </Row>
        </Form>
      </Row>
    </Container>
  );
};

export default ApplyIncentives1;
