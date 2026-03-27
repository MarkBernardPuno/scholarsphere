// ResearchIncentives.js

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
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "../../components/topbar";
import {
  clearIncentiveApplication,
  setIncentiveApplication,
} from "../../redux/actions/researchIncentiveActions";
import "./ResearchIncentives.css";

const ResearchIncentives = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const incentiveApplicationRedux = useSelector(
    (state) => state.researchIncentive.formData
  );

  const defaultValue = incentiveApplicationRedux || {
    department: "",
    title: "",
    authors: "",
    inst_agenda: "",
    dept_agenda: "",
    presented_where: "",
    category: "",
  };

  const [formData, setFormData] = useState(defaultValue);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setFormData(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/v1/departments")
      .then((response) => {
        const defaultDepartment = response.data.data[0]?.dept_id || "";
        setDepartments(response.data.data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          department: prevFormData.department || defaultDepartment,
        }));
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, [defaultValue]); // Add defaultValue to dependencies

  useEffect(() => {
    axios
      .get("http://localhost:5000/v1/category")
      .then((response) => {
        const defaultCategory = response.data.data[0]?.category_id || "";
        setCategories(response.data.data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          category: prevFormData.category || defaultCategory,
        }));
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [defaultValue]); // Add defaultValue to dependencies

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContinue = () => {
    const isEmptyField = Object.values(formData).some(
      (value) => value.trim() === ""
    );

    if (isEmptyField) {
      message.error("Please fill in all the required fields.");
    } else {
      const selectedCategory = formData.category;
      const targetPage = `/category-${selectedCategory}`;
      const updatedFormData = { ...formData, category_id: selectedCategory };
      dispatch(setIncentiveApplication(updatedFormData));
      navigate(targetPage, { state: { formData: updatedFormData } });
    }
  };

  const handleCancel = () => {
    dispatch(clearIncentiveApplication());
    navigate("/mainSearch");
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
          <ProgressBar style={{ padding: 0 }} variant="warning" now={33} />
        </Row>

        <Form>
          <Row
            className="mb-1"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col} xs lg="6">
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
                    {dept.dept_name.toUpperCase()}
                  </option>
                ))}
              </Form.Select>

              <Form.Label className="labelFont">Research Title</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
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
              <Form.Label className="labelFont">Author/s</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="authors"
                value={formData.authors}
                onChange={handleChange}
                required
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
            className="mb-3"
            style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
          >
            <Form.Group as={Col}>
              <Form.Label className="labelFont">
                Conference Title / Refereed Journal
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="presented_where"
                value={formData.presented_where}
                onChange={handleChange}
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
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_description.toUpperCase()}
                  </option>
                ))}
              </Form.Select>
              <p className="moreInfo underline-on-hover">More Information</p>
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
