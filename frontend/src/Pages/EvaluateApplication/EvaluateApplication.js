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
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";

const EvaluateApplication = ({ handleReturn, handleNext }) => {
  const location = useLocation();
  const [authors, setAuthors] = useState([]);
  const initialFormData = location.state?.formData || {
    campus: "",
    department: "",
    title: "",
    authors: [],
    inst_agenda: "",
    dept_agenda: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const navigate = useNavigate();

  console.log(formData);
  const handleAuthorChange = (e) => {
    setFormData({ ...formData, authors: e });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
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
      .get("http://localhost:5000/v1/departments/main")
      .then((response) => {
        setDepartments(response.data.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
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
  }, []);

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
    <Container fluid>
      <Row
        lassName="d-flex align-items-center"
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

      <ProgressBar variant="warning" now={100} className="mb-3" />

      <Form>
        <Row
          className="mb-1"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        >
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Campus</Form.Label>
            <Form.Select
              name="campus"
              value={formData.campus}
              onChange={handleChange}
              required
            >
              <option value="">Select Campus</option>
              {campuses.map((campus) => (
                <option key={campus.camp_id} value={campus.camp_id}>
                  {campus.camp_name?.toUpperCase() || "Unknown"}
                </option>
              ))}
            </Form.Select>

            <Form.Label className="labelFont">Department</Form.Label>
            <Form.Select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.dept_id} value={dept.dept_id}>
                  {dept.dept_name?.toUpperCase() || "Unknown"}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">
              Institutional Research Agenda
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="inst_agenda"
              value={formData.inst_agenda}
              onChange={handleChange}
              required
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
              rows={1}
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
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
              required
              styles={customSelectStyles} // Apply custom styles here
            />
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label className="labelFont">
              Department Research Agenda
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="dept_agenda"
              value={formData.dept_agenda}
              onChange={handleChange}
              required
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
          <Button
            variant="warning"
            as={Col}
            onClick={() => handleNext(formData)}
          >
            Continue
          </Button>{" "}
        </Row>
      </Form>
    </Container>
  );
};

export default EvaluateApplication;
