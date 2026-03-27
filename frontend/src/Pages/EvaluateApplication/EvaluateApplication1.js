import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { useDataContext } from "../../contexts/data-context";
import { useAuthContext } from "../../contexts/auth-context";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { message } from "antd";

const EvaluateApplication1 = ({ handleReturn, handleNext }) => {
  const { user } = useAuthContext();
  const { formData, updateFormData } = useDataContext();
  const [authors, setAuthors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [instAgenda, setInstAgenda] = useState([]);
  const [filteredDeptAgendas, setFilteredDeptAgendas] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDeptAgendas, setAllDeptAgendas] = useState([]);
  const [isValid, setIsValid] = useState(true);
  console.log(user);
  console.log(formData);

  useEffect(() => {
    if (user) {
      updateFormData({
        ...formData,
        user_id: user.user_id,
        evaluated_by: user.user_id,
      });
    }
  }, [user]);

  const handleAuthorChange = (e) => {
    updateFormData({ ...formData, authors: e });
  };

  const handleDepartmentChange = (e) => {
    updateFormData({ ...formData, departments: e });

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
    if (name === "campus") {
      updateFormData({ ...formData, camp_id: value });
    } else {
      updateFormData({ ...formData, [name]: value });
    }
  };

  const handleInstAgendaChange = (e) => {
    updateFormData({ ...formData, instagendas: e });
  };

  const handleDeptAgendaChange = (e) => {
    updateFormData({ ...formData, deptagendas: e });
  };

  const handleKeywordsChange = (e) => {
    updateFormData({ ...formData, keywords: e });
  };

  const validateForm = () => {
    const requiredFields = [
      "camp_id",
      "departments",
      "instagendas",
      "deptagendas",
      "title",
      "authors",
      "abstract",
      "keywords",
    ];

    for (let field of requiredFields) {
      if (
        !formData[field] ||
        (Array.isArray(formData[field]) && formData[field].length === 0)
      ) {
        setIsValid(false);
        return false;
      }
    }

    setIsValid(true);
    return true;
  };

  const handleNextClick = () => {
    if (validateForm()) {
      handleNext(formData);
    }
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

  const getValidationClass = (field) => {
    if (
      !isValid &&
      (!formData[field] ||
        (Array.isArray(formData[field]) && formData[field].length === 0))
    ) {
      return "is-invalid";
    }
    return "";
  };

  const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, ""),
  });

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

        updateFormData({
          ...formData,
          keywords: [...formData.keywords, updatedOption],
        });
      })
      .catch((error) => {
        console.error("Error creating keyword:", error);
      });
  };

  const handleCreateInstAgenda = (inputValue) => {
    // Create a temporary option before making the API call
    const tempOption = { label: inputValue, value: inputValue };

    // Add the temporary option to the state
    setInstAgenda((prev) => [...prev, tempOption]);

    // Make the API call to add the new option
    axios
      .post("http://localhost:5000/v1/instagenda/main", {
        instagenda_name: inputValue,
      })
      .then((response) => {
        // Update the option with the correct ID returned from the API
        const { instagenda_id, instagenda_name } = response.data;
        const updatedOption = { label: instagenda_name, value: instagenda_id };

        // Replace the temporary option with the updated option
        setInstAgenda((prev) =>
          prev.map((option) =>
            option.label === inputValue ? updatedOption : option
          )
        );

        // Update formData with the correct option
        updateFormData({
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

          updateFormData({
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

  return (
    <Container fluid>
      <Row
        className="d-flex align-items-center"
        style={{
          paddingLeft: "1rem",
          gap: "20px",
          paddingRight: "1rem",
        }}
      >
        <Col>
          <h2 className="titleFont p-2">Research Evaluation Checklist</h2>
        </Col>
        <Col xs={6} style={{ paddingLeft: "50vh", paddingTop: "5px" }}></Col>
      </Row>

      <h3
        style={{
          fontSize: "0.8rem",
          paddingLeft: "3rem",
          paddingRight: "3rem",
        }}
      >
        Step 1 of 5
      </h3>
      <ProgressBar variant="warning" now={20} className="mb-3" />

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
              onChange={handleChange}
              className={getValidationClass("camp_id")}
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
              className={`basic-multi-select ${getValidationClass(
                "instagendas"
              )}`}
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
              className={`basic-multi-select ${getValidationClass(
                "departments"
              )}`}
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
              className={`basic-multi-select ${getValidationClass(
                "deptagendas"
              )}`}
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
              className={getValidationClass("title")}
            />

            <Form.Label className="labelFont">Author/s</Form.Label>
            <Select
              isMulti
              name="authors"
              options={authors}
              className={`basic-multi-select ${getValidationClass("authors")}`}
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
              className={getValidationClass("abstract")}
            />

            <Form.Label className="labelFont">Keywords</Form.Label>
            <CreatableSelect
              isMulti
              name="keywords"
              options={keywords}
              className={`basic-multi-select ${getValidationClass("keywords")}`}
              classNamePrefix="select"
              value={formData.keywords}
              onChange={handleKeywordsChange}
              onCreateOption={handleCreateKeyword}
              styles={customSelectStyles}
            />
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
          <Button variant="outline-warning" as={Col} onClick={handleReturn}>
            Cancel
          </Button>{" "}
          <Col md="auto"></Col>
          <Button variant="warning" as={Col} onClick={handleNextClick}>
            Continue
          </Button>{" "}
        </Row>
      </Form>
    </Container>
  );
};

export default EvaluateApplication1;
