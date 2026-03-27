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
import { useParams } from "react-router-dom";


const EvaluationChecklist = ({handleReturn, handleNext}) => {
  const { research_id } = useParams();
  console.log(research_id);
  const [data, setData] = useState([]);
  const [editMode, setEditMode] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, [research_id]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/v1/search/main`, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          research_id: research_id,
        },
      });
      setData(response.data.data);
      setFormData(response.data.data[0]); // Set form data with fetched data
      // outputs the data on the console
      console.log("API Response:", response.data.data);
      if (response.data.data.length > 0) {
        console.log(response.data.data[0].title);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    console.log("Edit mode:", editMode);
  }, [editMode]);

  const handleEdit = () => {
    setEditMode(true);
    console.log("Edit mode:", editMode);
  };

  const handleSave = async () => {
    try {
      console.log("Pressed Save");
      await axios.put(`http://127.0.0.1:5000/v1/researches/5`, formData);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  

  // const handleReturn = async () => {
  //   try {
  //     const agendaAlignment1 = `/mainSearch`;
  //     navigate(agendaAlignment1);
  //   } catch (error) {
  //     console.error("Error reloading:", error);
  //   }
  // };

  // const handleContinue = async () => {
  //   try {
  //     const agendaAlignment1 = `/agenda-alignment-1`;
  //     navigate(agendaAlignment1);
  //   } catch (error) {
  //     console.error("Error reloading:", error);
  //   }
  // };
  const handlePublicationDateChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, publication_date: value });
  };

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = new Date(date).toISOString().split("T")[0];
    return formattedDate;
  };

  const handleDateChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, presentation_date: value });
  };

  const handleDelete = async () => {
    try {
      console.log("Delete button clicked");
      await axios.delete(`http://127.0.0.1:5000/v1/researches/5`);
      const backtoSearch = `/search`;
    } catch (error) {
      console.error("Error deleting research:", error);
    }
  };

  return (
    <Container fluid>
      <Row
        lassName="d-flex align-items-center"
        style={{
          paddingLeft: "1rem",
          gap: "20px",
          paddingRight: "1rem",
          // fontFamily: "Kaisei",
        }}
      >
        <Col>
          <h2 className="titleFont p-2">Research Evaluation Checklist</h2>
        </Col>
        <Col xs={6} style={{ paddingLeft: "50vh", paddingTop: "5px" }}></Col>
      </Row>

      <ProgressBar variant="warning" now={100} className="mb-3" />

      {data.length > 0 && (
        <>
          <Form>
            <Row
              className="mb-1"
              style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
            >
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">Department</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="doi_or_full"
                  value={formData.dept_name}
                  readOnly={!editMode}
                  onChange={handleChange}
                />

                <Form.Label className="labelFont">Research Title</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="doi_or_full"
                  value={formData.title}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group as={Col} xs={12} lg={6}>
                <Form.Label className="labelFont">
                  Institutional Research Agenda
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="inst_agenda"
                  value={formData.inst_agenda}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
            </Row>
          </Form>
          <Form>
            <Row
              className="mb-1"
              style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
            >
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">Author/s</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="inst_agenda"
                  value={formData.author_name}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label className="labelFont">
                  Department Research Agenda
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="title"
                  value={formData.dept_agenda}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
            </Row>
          </Form>
          <Form>
            <Row
              className="mb-1"
              style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
            >
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">
                  Conference Title/ Refereed Journal
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="presented_where"
                  value={formData.presented_where}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">Category</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="inst_agenda"
                  value={formData.category_description}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
            </Row>
          </Form>
          <Form>
            <Row
              className="mb-1"
              style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
            ></Row>
          </Form>
          <Row style={{ paddingLeft: "20rem", paddingRight: "20rem" }}>
            {editMode ? (
              <Button variant="outline-warning" onClick={handleSave}>
                Save
              </Button>
            ) : (
              <>
                <Button
                  variant="outline-warning"
                  as={Col}
                  onClick={handleReturn}
                >
                  Return
                </Button>{" "}
                <Col md="auto"></Col>
                <Button variant="warning" as={Col} onClick={handleNext}>
                  Continue
                </Button>{" "}
              </>
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export default EvaluationChecklist;
