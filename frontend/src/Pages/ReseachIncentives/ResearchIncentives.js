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
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../../components/topbar";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import "./ResearchIncentives.css";

const ResearchIncentives = ({ type }) => {
  const location = useLocation();
  const [authors, setAuthors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [instAgenda, setInstAgenda] = useState([]);
  const [filteredDeptAgendas, setFilteredDeptAgendas] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDeptAgendas, setAllDeptAgendas] = useState([]);
  const [researchOptions, setResearchOptions] = useState([]);
  const initialFormData = location.state?.formData || {
    title: "",
    abstract: "",
    camp_id: "",
    presented_where: "",
    category: "",
    authors: [],
    departments: [],
    keywords: [],
    students: [],
    deptagendas: [],
    instagendas: [],
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedFiles, setSelectedFiles] = useState(
    location.state?.selectedFiles || {}
  );
  const navigate = useNavigate();

  console.log(formData);

  const handleAuthorChange = (e) => {
    setFormData({ ...formData, authors: e });
  };

  const handleInstAgendaChange = (e) => {
    setFormData({ ...formData, instagendas: e });
  };

  const handleDeptAgendaChange = (e) => {
    setFormData({ ...formData, deptagendas: e });
  };

  const handleKeywordsChange = (e) => {
    setFormData({ ...formData, keywords: e });
  };

  const handleDepartmentChange = (e) => {
    setFormData({ ...formData, departments: e });

    const selectedDeptIds = e.map((dept) => dept.value);
    const agendas = allDeptAgendas
      .filter((agenda) => selectedDeptIds.includes(agenda.dept_id))
      .map((agenda) => ({
        value: agenda.deptagenda_id,
        label: agenda.deptagenda_name,
      }));
    setFilteredDeptAgendas(agendas);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateKeyword = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setKeywords((prev) => [...prev, newOption]);

    // Make an API call to add the new keyword
    axios
      .post("http://localhost:5000/v1/keywords/main", {
        keywords_name: inputValue,
      })
      .then((response) => {
        const { keywords_id, keywords_name } = response.data;
        const updatedOption = {
          label: keywords_name,
          value: keywords_id,
        };

        setKeywords((prev) =>
          prev.map((option) =>
            option.label === inputValue ? updatedOption : option
          )
        );

        setFormData({
          ...formData,
          keywords: [...formData.keywords, updatedOption],
        });
      })
      .catch((error) => {
        console.error("Error creating keyword:", error);
      });
  };

  const handleCreateInstAgenda = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setInstAgenda((prev) => [...prev, newOption]);

    // Make the API call to add the new option
    axios
      .post("http://localhost:5000/v1/instagenda/main", {
        instagenda_name: inputValue,
      })
      .then((response) => {
        const { instagenda_id, instagenda_name } = response.data;
        const updatedOption = {
          label: instagenda_name,
          value: instagenda_id,
        };

        setInstAgenda((prev) =>
          prev.map((option) =>
            option.label === inputValue ? updatedOption : option
          )
        );

        setFormData({
          ...formData,
          instagendas: [...formData.instagendas, updatedOption],
        });
      })
      .catch((error) => {
        console.error("Error creating instagenda:", error);
      });
  };

  const handleCreateDeptAgenda = (inputValue) => {
    const selectedDept = formData.departments[0];

    if (selectedDept) {
      const dept_id = selectedDept.value;
      const newOption = { label: inputValue, value: inputValue };
      setFilteredDeptAgendas((prev) => [...prev, newOption]);

      axios
        .post("http://localhost:5000/v1/deptagenda/main", {
          deptagenda_name: inputValue,
          dept_id: dept_id,
        })
        .then((response) => {
          const { deptagenda_id, deptagenda_name } = response.data;
          const updatedOption = {
            label: deptagenda_name,
            value: deptagenda_id,
          };

          setFilteredDeptAgendas((prev) =>
            prev.map((option) =>
              option.label === inputValue ? updatedOption : option
            )
          );

          setFormData({
            ...formData,
            deptagendas: [...formData.deptagendas, updatedOption],
          });
        })
        .catch((error) => {
          console.error("Error creating DeptAgenda:", error);
        });
    } else {
      message.error("Please select a department first.");
    }
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
    const isEmptyField = Object.values(formData).some((value) => {
      if (typeof value === "string") {
        return value.trim() === "";
      }
      return value === null || value === undefined;
    });

    if (isEmptyField) {
      message.error("Please fill in all the required fields.");
    } else {
      const selectedCategory = formData.category;
      const targetPage = `/category-${selectedCategory}`;
      const updatedFormData = { ...formData, category_id: selectedCategory };
      console.log("Updated formData for navigation:", updatedFormData);
      navigate(targetPage, {
        state: { formData: updatedFormData, selectedFiles: selectedFiles },
      });
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    navigate("/mainSearch");
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/v1/campus/main")
      .then((response) => {
        setCampuses(response.data.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching campuses:", error);
      });

    axios
      .get("http://localhost:5000/v1/instagenda/main")
      .then((response) => {
        setInstAgenda(
          response.data.data.map((item) => ({
            value: item.instagenda_id,
            label: item.instagenda_name,
          }))
        );
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching instagenda:", error);
      });

    axios
      .get("http://localhost:5000/v1/departments/main")
      .then((response) => {
        const deptData = response.data.data;
        setAllDepartments(deptData);
        setDepartments(
          deptData.map((item) => ({
            value: item.dept_id,
            label: item.dept_name,
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });

    axios
      .get("http://localhost:5000/v1/deptagenda/main")
      .then((response) => {
        setAllDeptAgendas(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching deptagenda:", error);
      });

    axios
      .get("http://localhost:5000/v1/author/main")
      .then((response) => {
        setAuthors(
          response.data.data.map((item) => ({
            value: item.author_id,
            label: `${item.author_name} (${item.department})`,
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching authors:", error);
      });

    axios
      .get("http://localhost:5000/v1/keywords/main")
      .then((response) => {
        setKeywords(
          response.data.data.map((item) => ({
            value: item.keywords_id,
            label: item.keywords_name,
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching keywords:", error);
      });

    axios
      .get("http://localhost:5000/v1/category/main")
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

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "2.7rem",
      maxHeight: "100px",
      overflowY: "auto",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "auto",
      overflow: "visible",
      maxHeight: "100px",
      overflowY: "auto",
    }),
    multiValue: (provided) => ({
      ...provided,
      margin: "2px",
    }),
    menu: (provided) => ({
      ...provided,
      whiteSpace: "normal",
      wordWrap: "break-word",
      maxHeight: "100px",
      overflowY: "auto",
    }),
    option: (provided) => ({
      ...provided,
      whiteSpace: "normal",
      wordWrap: "break-word",
    }),
  };

  return (
    <Container fluid style={{ height: "100vh" }}>
      {type !== "profile" && ( // Conditionally render TopBar
        <Row style={{ height: "15vh" }}>
          <TopBar isLoggedIn={3} />
        </Row>
      )}

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
          <h3
            style={{
              fontSize: "0.8rem",
              paddingLeft: "3rem",
              paddingRight: "3rem",
            }}
          >
            Step 1 of 3
          </h3>
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
                name="camp_id"
                value={formData.camp_id}
                onChange={handleChange}
                required
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
              <CreatableSelect
                isMulti
                name="instagendas"
                options={instAgenda}
                className="basic-multi-select"
                classNamePrefix="select"
                value={formData.instagendas}
                onChange={handleInstAgendaChange}
                onCreateOption={handleCreateInstAgenda}
                styles={customSelectStyles}
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
                className="basic-multi-select"
                classNamePrefix="select"
                value={formData.departments}
                onChange={handleDepartmentChange}
                styles={customSelectStyles}
              />
            </Form.Group>

            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Department Research Agenda
              </Form.Label>
              <CreatableSelect
                isMulti
                name="deptagendas"
                options={filteredDeptAgendas}
                className="basic-multi-select"
                classNamePrefix="select"
                value={formData.deptagendas}
                onChange={handleDeptAgendaChange}
                onCreateOption={handleCreateDeptAgenda}
                styles={customSelectStyles}
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
                onChange={handleChange}
              />

              <Form.Label className="labelFont">Author/s</Form.Label>
              <Select
                isMulti
                name="authors"
                options={authors}
                className="basic-multi-select"
                classNamePrefix="select"
                value={formData.authors}
                onChange={handleAuthorChange}
                styles={customSelectStyles}
              />
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Label className="labelFont">Abstract</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
              />

              <Form.Label className="labelFont">Keywords</Form.Label>
              <CreatableSelect
                isMulti
                name="keywords"
                options={keywords}
                className="basic-multi-select"
                classNamePrefix="select"
                value={formData.keywords}
                onChange={handleKeywordsChange}
                onCreateOption={handleCreateKeyword}
                styles={customSelectStyles}
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

export default ResearchIncentives;
