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
import { DeleteEvaluationModal } from "../../components/evaluation-page-modals";

const CheckEvaluation = ({ handleReturn, handleNext, evaluationId, isEditMode, setIsEditMode}) => {
  const { user } = useAuthContext();
  const { formData, updateFormData } = useDataContext();
  const [evaluationData, setEvaluationData] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [instAgenda, setInstAgenda] = useState([]);
  const [filteredDeptAgendas, setFilteredDeptAgendas] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allDeptAgendas, setAllDeptAgendas] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      updateFormData({
        ...formData,
        user_id: user.user_id,
        evaluated_by: user.user_id,
      });
    }
  }, [user]);

  useEffect(() => {
    if (evaluationId) {
      axios
        .get(
          `http://localhost:5000/v1/incentivesevaluation/main/${evaluationId}`
        )
        .then((response) => {
          console.log(response.data.data);
          setEvaluationData(response.data.data);
          updateFormData(response.data.data);
        })
        .catch((error) =>
          console.error("Error fetching evaluation data:", error)
        );
    }
  }, [evaluationId]);

  console.log(formData);

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

      updateFormData({
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

  useEffect(() => {
    axios
      .get("http://localhost:5000/v1/campus/main")
      .then((response) => setCampuses(response.data.data))
      .catch((error) => console.error("Error fetching campuses:", error));

    axios
      .get("http://localhost:5000/v1/instagenda/main")
      .then((response) => setInstAgenda(response.data.data))
      .catch((error) => console.error("Error fetching instagenda:", error));

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
      .catch((error) => console.error("Error fetching departments:", error));

    axios
      .get("http://localhost:5000/v1/deptagenda/main")
      .then((response) => setAllDeptAgendas(response.data.data))
      .catch((error) => console.error("Error fetching deptagenda:", error));

    axios
      .get("http://localhost:5000/v1/author/main")
      .then((response) =>
        setAuthors(
          response.data.data.map((item) => ({
            value: item.author_id,
            label: `${item.author_name} (${item.department})`,
          }))
        )
      )
      .catch((error) => console.error("Error fetching authors:", error));

    axios
      .get("http://localhost:5000/v1/keywords/main")
      .then((response) =>
        setKeywords(
          response.data.data.map((item) => ({
            value: item.keywords_id,
            label: item.keywords_name,
          }))
        )
      )
      .catch((error) => console.error("Error fetching keywords:", error));
  }, []);

  const handleAuthorChange = (e) => updateFormData({ ...formData, authors: e });

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

  const handleInstAgendaChange = (e) =>
    updateFormData({ ...formData, instagendas: e });

  const handleDeptAgendaChange = (e) =>
    updateFormData({ ...formData, deptagendas: e });

  const handleKeywordsChange = (e) =>
    updateFormData({ ...formData, keywords: e });

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

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const handleEditClick = () => setIsEditMode(true);

  const handleCancelEdit = () => setIsEditMode(false);

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "2.7rem",
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      height: `auto`,
      overflow: "visible",
    }),
    multiValue: (provided, state) => ({
      ...provided,
      margin: "2px",
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
    const newOption = createOption(inputValue);
    setKeywords((prev) => [...prev, newOption]);

    axios
      .post("http://localhost:5000/v1/keywords/main", {
        keywords_name: inputValue,
      })
      .then((response) => {
        setKeywords((prev) => [
          ...prev,
          {
            value: response.data.keywords_id,
            label: response.data.keywords_name,
          },
        ]);
        updateFormData({
          ...formData,
          keywords: [...formData.keywords, newOption],
        });
      })
      .catch((error) => console.error("Error creating keyword:", error));
  };

  console.log("Departments:", departments); // Log the departments array
  console.log("Selected Departments:", formData.departments);
  console.log("InstAgendas:", instAgenda);
  console.log("Selected InstAgendas:", formData.instagendas);

  return (
    <Container fluid>
      <Row
        className="d-flex align-items-center"
        style={{ paddingLeft: "1rem", gap: "20px", paddingRight: "1rem" }}
      >
        <Col>
          <h2 className="titleFont m-0 p-0">Research Evaluation Checklist</h2>
        </Col>
        <Col className="d-flex justify-content-end">
          {!isEditMode ? (
            <Button variant="warning" onClick={handleEditClick} style={{marginLeft: "0.5rem"}}>
              Edit
            </Button>
          ):(
            <Button variant="outline-warning" onClick={handleCancelEdit} style={{marginLeft: "0.5rem"}}>
              Cancel Edit
            </Button>
          )}
          <Button variant="warning" onClick={handleDelete} style={{marginLeft: "0.5rem"}}>Delete</Button>
        </Col>
      </Row>

      <h3 style={{fontSize: "0.8rem", paddingLeft: "3rem", paddingRight: "3rem", }}>
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
              disabled={!isEditMode}
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
            <Select
              isMulti
              name="instagendas"
              options={instAgenda}
              className={`basic-multi-select ${getValidationClass(
                "instagendas"
              )}`}
              classNamePrefix="select"
              value={formData.instagendas}
              onChange={handleInstAgendaChange}
              isDisabled={!isEditMode}
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
              isDisabled={!isEditMode}
              styles={customSelectStyles}
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
              className={`basic-multi-select ${getValidationClass(
                "deptagendas"
              )}`}
              classNamePrefix="select"
              value={formData.deptagendas}
              onChange={handleDeptAgendaChange}
              isDisabled={!isEditMode}
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
              readOnly={!isEditMode}
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
              isDisabled={!isEditMode}
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
              readOnly={!isEditMode}
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
              isDisabled={!isEditMode}
              styles={customSelectStyles}
            />
          </Form.Group>
        </Row>

        <Row style={{ height: "5vh", margin: 0, paddingLeft: "20rem", paddingRight: "20rem" }}>
          <Button variant="outline-warning" as={Col} onClick={handleReturn}>
            Return
          </Button>
          <Col md="auto"></Col>
          <Button variant="warning" as={Col} onClick={handleNextClick}>
            Continue
          </Button>
        </Row>
      </Form>

      <DeleteEvaluationModal
        show={showDeleteModal}
        evaluationId={evaluationId}
        onClose={() => setShowDeleteModal(false)}
        trigger={handleReturn} // Use handleReturn to refresh or redirect after deletion
        setShow={setShowDeleteModal}
      />
    </Container>
  );
};

export default CheckEvaluation;
