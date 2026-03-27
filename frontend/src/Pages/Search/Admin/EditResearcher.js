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
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../../../components/topbar";
import Select from "react-select";
import { message } from "antd";
const Edit = () => {
  const navigate = useNavigate();
  const { application_id } = useParams();
  console.log(application_id);
  const [formData, setFormData] = useState({
    department: "",
    title: "",
    authors: [],
    inst_agenda: "",
    dept_agenda: "",
    presented_where: "",
    category: "",
    presentation_date: "",
    presentation_location: "",
    published_where: "",
    publication_date: "",
    citation_date: "",
    doi_or_full: "",
    files: [], // Include files in formData
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  console.log(formData);
  console.log(selectedFiles);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [departmentsResponse, authorsResponse, dataResponse] =
          await Promise.all([
            axios.get(`http://localhost:5000/v1/departments/main`),
            axios.get(`http://localhost:5000/v1/author/main`),
            axios.get(
              `http://localhost:5000/v1/incentivesapplication/application_data/${application_id}`
            ),
          ]);

        const fetchedDepartments = departmentsResponse.data.data;
        const fetchedAuthors = authorsResponse.data.data.map((author) => ({
          value: author.author_id,
          label: `${author.author_name} (${author.department})`,
        }));
        const fetchedData = dataResponse.data.data;

        console.log("Fetched authors:", fetchedAuthors);
        console.log("Fetched departments:", fetchedDepartments);
        console.log("Fetched application data:", fetchedData);

        if (!Array.isArray(fetchedDepartments)) {
          throw new Error("Fetched departments data is not an array");
        }

        setDepartments(fetchedDepartments);

        const department = fetchedDepartments.find(
          (dept) => dept.dept_id === fetchedData.dept_id
        );

        // Merge data into formData
        setFormData({
          ...formData,
          ...fetchedData,
          department: department ? department.dept_name : "",
          title: fetchedData.research_title,
          authors: fetchedData.authors.map((author) => ({
            value: author.author_id,
            label: `${author.author_name}`,
          })),
          files: fetchedData.files || [], // Ensure files are copied to formData
        });

        // Set selectedFiles if files are present in fetchedData
        if (fetchedData.files && fetchedData.files.length > 0) {
          const initialSelectedFiles = fetchedData.files.map((file, index) => ({
            file: null,
            details: file,
          }));
          setSelectedFiles(initialSelectedFiles);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    if (application_id) {
      fetchInitialData();
    } else {
      console.error("Application ID is undefined");
    }
  }, [application_id]);

  const handleChange = (event, index) => {
    const { name, value, files } = event.target;

    if (files && files.length > 0) {
      // If files are selected, update selectedFiles state
      const updatedSelectedFiles = [...selectedFiles];
      updatedSelectedFiles[index] = {
        file: files[0],
        details: formData.files[index],
      };
      setSelectedFiles(updatedSelectedFiles);
    } else {
      // If input value changes but no files are selected, update form data
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAuthorChange = (selectedOptions) => {
    const selectedAuthors = selectedOptions.map((option) => ({
      value: option.value,
      label: option.label,
    }));
    setFormData({ ...formData, authors: selectedAuthors });
  };

  const handleDepartmentChange = (selectedOption) => {
    setFormData({ ...formData, department: selectedOption });
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = () => {
    setEditMode(true);
    console.log("Edit mode:", editMode);
  };

  useEffect(() => {
    console.log("Edit mode:", editMode);
  }, [editMode]);

  const handleSave = async () => {
    try {
      console.log("Pressed Save");
      console.log("formData:", formData); // Log formData before sending the request

      await axios.put(
        `http://localhost:5000/v1/incentivesapplication/application_data/${application_id}`,
        formData
      );

      const research_id = formData.research_id;
      const category_id = formData.category_id;
      console.log("Research ID:", research_id);
      console.log("Category ID:", category_id);

      for (const fileData of selectedFiles) {
        if (fileData.file) {
          const uploadData = new FormData();
          uploadData.append("file", fileData.file);
          uploadData.append("research_id", research_id);
          uploadData.append("category_id", category_id);
          uploadData.append("file_type", fileData.details.file_type);

          await axios.put("http://localhost:5000/v1/file/upload", uploadData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }

      setEditMode(false);
    } catch (error) {
      console.error("Error saving data:", error.response); // Log error.response to see the detailed error message
    }
  };

  const handleDone = async () => {
    try {
      const backtoSearch = `/crud`;
      navigate(backtoSearch);
    } catch (error) {
      console.error("Error reloading:", error);
    }
  };

  const handlePublicationDateChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, publication_date: value });
  };

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = new Date(date).toISOString().split("T")[0];
    return formattedDate;
  };

  const handleDelete = async () => {
    try {
      console.log("Delete button clicked");
      await axios.delete(
        `http://localhost:5000/v1/incentivesapplication/application_data/${application_id}`
      );
      const backtoSearch = `/search`;
      message.success("Research deleted successfully");
      navigate(backtoSearch);
    } catch (error) {
      console.error("Error deleting research:", error);
    }
  };

  const filesPerColumn = Math.ceil(formData.files.length / 2);

  return (
    <Container fluid>
      <Row style={{ height: "15vh" }}>
        <TopBar />
      </Row>
      <Row
        lassName="d-flex align-items-center"
        style={{
          paddingLeft: "1rem",
          gap: "20px",
          paddingRight: "1rem",
          fontFamily: "Kaisei",
        }}
      >
        <Col>
          <h2 className="titleFont p-2">Research Details</h2>
        </Col>
        <Col style={{ paddingLeft: "115vh", paddingTop: "5px" }}>
          <Button
            variant="outline-warning"
            onClick={handleDone}
            style={{ paddingLeft: "5rem", paddingRight: "5rem" }}
          >
            Done
          </Button>
        </Col>
      </Row>

      <ProgressBar variant="warning" now={100} className="mb-3" />

      {formData ? (
        <>
          <Form>
            <Row
              className="mb-1"
              style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
            >
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">Department</Form.Label>
                {editMode ? (
                  <Form.Select
                    name="department"
                    value={
                      departments.find(
                        (dept) => dept.dept_name === formData.department
                      )?.dept_id || ""
                    }
                    onChange={handleDepartmentChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.dept_name.toUpperCase()}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    value={formData.department}
                    readOnly
                  />
                )}

                <Form.Label className="labelFont">Research Title</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="title"
                  value={formData.title}
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
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
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
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
                {editMode ? (
                  <Select
                    isMulti
                    name="authors"
                    options={authors}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    value={formData.authors}
                    onChange={handleAuthorChange}
                    required
                  />
                ) : (
                  <Form.Control
                    type="text"
                    value={formData.authors
                      .map((author) => author.label)
                      .join(", ")}
                    readOnly
                  />
                )}
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
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
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
                <Form.Label className="labelFont">Presentation Date</Form.Label>
                <Form.Control
                  type="date"
                  name="presentation_date"
                  placeholder="DateRange"
                  value={formatDate(formData.presentation_date)}
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
                />
                <Form.Label className="labelFont">
                  Presentation Location
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="presentation_location"
                  value={formData.presentation_location}
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
                />
              </Form.Group>
              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">Publication Date</Form.Label>
                <Form.Control
                  type="date"
                  name="publication_date"
                  placeholder="DateRange"
                  value={formatDate(formData.publication_date)}
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
                />
                <Form.Label className="labelFont">Published Where</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="published_where"
                  value={formData.published_where}
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
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
                  Conference Title / Refereed Journal
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="presented_where"
                  value={formData.presented_where}
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
                />
              </Form.Group>

              <Form.Group as={Col} xs lg="6">
                <Form.Label className="labelFont">DOI or Full</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={1}
                  name="doi_or_full"
                  value={formData.doi_or_full}
                  readOnly={!editMode}
                  onChange={(e) => handleChange(e, -1)}
                />
              </Form.Group>
            </Row>
          </Form>

          {formData.files.length > 0 && (
            <>
              <Row>
                {/* First column */}
                <Col>
                  {formData.files
                    .slice(0, filesPerColumn)
                    .map((file, index) => (
                      <Row
                        key={index}
                        className="mb-4"
                        style={{ paddingLeft: "3rem" }}
                      >
                        <Form.Group as={Col} xs lg="12">
                          <Form.Label className="labelFont">
                            {file.file_type}
                          </Form.Label>
                          <div className="custom-file-input-wrapper">
                            <input
                              type="file"
                              id={`fileInput_${index}`}
                              name={file.file_path.replace(/^uploads\\/, "")}
                              className="custom-file-input"
                              data-file-type={file.file_type}
                              onChange={(e) => handleChange(e, index)}
                              disabled={!editMode}
                            />
                            <label
                              htmlFor={`fileInput_${index}`}
                              className="custom-file-label"
                            >
                              {selectedFiles[index]?.details
                                ? selectedFiles[
                                    index
                                  ].details.file_path.replace(/^uploads\\/, "")
                                : file.file_path.replace(/^uploads\\/, "")}
                            </label>
                          </div>
                        </Form.Group>
                      </Row>
                    ))}
                </Col>
                {/* Second column */}
                <Col>
                  {formData.files.slice(filesPerColumn).map((file, index) => (
                    <Row
                      key={index}
                      className="mb-4"
                      style={{ paddingRight: "3rem" }}
                    >
                      <Form.Group as={Col} xs lg="12">
                        <Form.Label className="labelFont">
                          {file.file_type}
                        </Form.Label>
                        <div className="custom-file-input-wrapper">
                          <input
                            type="file"
                            id={`fileInput_${index}`}
                            name={file.file_path.replace(/^uploads\\/, "")}
                            className="custom-file-input"
                            data-file-type={file.file_type}
                            onChange={(e) => handleChange(e, index)}
                            disabled={!editMode}
                          />
                          <label
                            htmlFor={`fileInput_${index}`}
                            className="custom-file-label"
                          >
                            {selectedFiles[index]?.details
                              ? selectedFiles[index].details.file_path.replace(
                                  /^uploads\\/,
                                  ""
                                )
                              : file.file_path.replace(/^uploads\\/, "")}
                          </label>
                        </div>
                      </Form.Group>
                    </Row>
                  ))}
                </Col>
              </Row>
            </>
          )}

          <Row
            style={{
              paddingTop: "1rem",
              paddingBottom: "1rem",
              paddingLeft: "20rem",
              paddingRight: "20rem",
            }}
          >
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
      ) : (
        <p>Loading...</p>
      )}
    </Container>
  );
};

export default Edit;
