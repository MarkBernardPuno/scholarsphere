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
import { useNavigate } from "react-router-dom";
import "./SearchDetails.css";

const SearchDetails = ({ researchId }) => {
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [researchId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/v1/researches/${researchId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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
      await axios.put(
        `http://127.0.0.1:5000/v1/researches/${researchId}`,
        formData
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  const handleDone = async () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error("Error reloading:", error);
    }
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
      await axios.delete(`http://127.0.0.1:5000/v1/researches/${researchId}`);
      // Redirect to the search page after deletion
      window.location.reload();
    } catch (error) {
      console.error("Error deleting research:", error);
    }
  };

  return (
    <Container fluid>
      {/* <Row style={{ backgroundColor: "gray" }}>
        <NavbarComp />
      </Row> */}

      <Row style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
        <h2 className="titleFont p-2">
          Research Details
          <Col>
            <Button variant="outline-warning" as={Col} onClick={handleDone}>
              Done
            </Button>{" "}
          </Col>
        </h2>
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
                <Form.Label className="labelFont">Research Title</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="title"
                  value={formData.title}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">
                  Presentation Location
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="presentation_location"
                  value={formData.presentation_location}
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
                  Department Research Agenda
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="dept_agenda"
                  value={formData.dept_agenda}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label className="labelFont">Presentation Date</Form.Label>
                <Form.Control
                  type="date"
                  name="presentation_date"
                  placeholder="DateRange"
                  value={formatDate(formData.presentation_date)}
                  readOnly={!editMode}
                  onChange={handleDateChange}
                />
                <Form.Label className="labelFont">Published Where</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="published_where"
                  value={formData.published_where}
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
                  Institutional Agenda
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
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">Publication Date</Form.Label>
                <Form.Control
                  type="date"
                  name="pu"
                  placeholder="DateRange"
                  value={formatDate(formData.publication_date)}
                  readOnly={!editMode}
                  onChange={handleDateChange}
                />
                <Form.Label className="labelFont">DOI or Full</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="doi_or_full"
                  value={formData.doi_or_full}
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
                <Form.Label className="labelFont">Presented Where</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="presented_where"
                  value={formData.presented_where}
                  readOnly={!editMode}
                  onChange={handleChange}
                />
              </Form.Group>
            </Row>
          </Form>
          <Row style={{ paddingLeft: "20rem", paddingRight: "20rem" }}>
            {editMode ? (
              <Button variant="outline-warning" onClick={handleSave}>
                Save
              </Button>
            ) : (
              <>
                <Button variant="outline-warning" as={Col} onClick={handleEdit}>
                  Edit
                </Button>{" "}
                <Col md="auto"></Col>
                <Button variant="warning" as={Col} onClick={handleDelete}>
                  Delete
                </Button>{" "}
              </>
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export default SearchDetails;
