import axios from "axios";
import React, { useState } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../../../components/topbar";

const Create = () => {
  const [formData, setFormData] = useState({
    title: "",
    inst_agenda: "",
    dept_agenda: "",
    presented_where: "",
    presentation_location: "",
    presentation_date: "",
    published_where: "",
    publication_date: "",
    doi_or_full: "",
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/v1/researches", formData);
      navigate("/search");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <Container fluid>
      <Row style={{ height: "15vh" }}>
        <TopBar />
      </Row>
      <Row
        className="d-flex align-items-center"
        style={{ fontFamily: "Kaisei" }}
      >
        <Col>
          <h2 className="titleFont p-2">Research Incentive</h2>
        </Col>
        <Col style={{ paddingLeft: "115vh" }}>
          <Link to="/search">
            <Button
              style={{ paddingLeft: "10vh", paddingRight: "10vh" }}
              variant="warning"
            >
              Back
            </Button>
          </Link>
        </Col>
      </Row>
      <ProgressBar variant="warning" now={100} className="mb-3" />

      <Row style={{ paddingLeft: "1rem", paddingRight: "1rem" }}></Row>
      <Row style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
        <Form style={{ width: "100%" }}>
          <Row className="mb-1">
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Research Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Presentation Location
              </Form.Label>
              <Form.Control
                type="text"
                name="presentation_location"
                value={formData.presentation_location}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Row className="mb-1">
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Department Research Agenda
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="dept_agenda"
                value={formData.dept_agenda}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Presentation Date</Form.Label>
              <Form.Control
                type="date"
                name="presentation_date"
                value={formData.presentation_date}
                onChange={handleChange}
              />
              <Form.Label className="labelFont">Published Where</Form.Label>
              <Form.Control
                type="text"
                name="published_where"
                value={formData.published_where}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Row className="mb-1">
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">
                Institutional Agenda
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="inst_agenda"
                value={formData.inst_agenda}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Publication Date</Form.Label>
              <Form.Control
                type="date"
                name="publication_date"
                value={formData.publication_date}
                onChange={handleChange}
              />
              <Form.Label className="labelFont">DOI or Full</Form.Label>
              <Form.Control
                type="text"
                name="doi_or_full"
                value={formData.doi_or_full}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Row className="mb-1">
            <Form.Group as={Col} xs lg="6">
              <Form.Label className="labelFont">Presented Where</Form.Label>
              <Form.Control
                type="text"
                name="presented_where"
                value={formData.presented_where}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          <Row className="mb-1"></Row>
        </Form>
      </Row>
      <Row style={{ paddingLeft: "30rem", paddingRight: "30rem" }}>
        <Button variant="outline-warning" onClick={handleSave}>
          Save
        </Button>
      </Row>
    </Container>
  );
};

export default Create;
