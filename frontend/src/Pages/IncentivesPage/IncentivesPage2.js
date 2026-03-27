import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, ProgressBar, Row,} from "react-bootstrap";
import { message } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../contexts/auth-context";
import "./IncentivesPage.css";

const IncentivesPage2 = ({ handleReturn, applicationId, isEditMode, incentivesData, formData, selectedFiles, onClose, fetchIncentives}) => {
  const { user } = useAuthContext();
  console.log(user);
  const location = useLocation();
  const navigate = useNavigate();

  const [formState, setFormState] = useState(
    formData || location.state?.formData || {}
  );
  const [selectedFilesCurrent, setSelectedFilesCurrent] = useState(
    selectedFiles ||
      location.state?.selectedFiles || {
        eval_form: null,
        turnitin: null,
        grammarly: null,
        full_paper: null,
        incentive_form: null,
      }
  );

  useEffect(() => {
    if (formData) {
      setFormState(formData);
    }
    if (selectedFiles) {
      setSelectedFilesCurrent(selectedFiles);
    }
  }, [formData, selectedFiles]);

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString();

  useEffect(() => {
    setFormState((prevFormState) => ({
      ...prevFormState,
      formattedDate: formattedDate,
      user_id: user.user_id,
    }));
  }, [formattedDate, user.user_id]);

  console.log("formState:", formState);
  console.log("selectedFilesCurrent:", selectedFilesCurrent);

  const handleChange = (event) => {
    const { name, files, dataset } = event.target;

    if (files && files.length > 0) {
      const file = files[0];
      const fileType = dataset.fileType;

      const customFile = new File([file], file.name, {
        type: fileType,
        lastModified: file.lastModified,
      });

      setSelectedFilesCurrent({
        ...selectedFilesCurrent,
        [name]: customFile,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const applicationUpdateResponse = await axios.put(
        `http://localhost:5000/v1/incentivesapplication/main/${applicationId}`,
        formState
      );
  
      if (applicationUpdateResponse.status === 200) {
        const generatedResearchId = applicationUpdateResponse.data.research_id;
  
        for (const key in selectedFilesCurrent) {
          if (selectedFilesCurrent.hasOwnProperty(key)) {
            const currentFile = selectedFilesCurrent[key];
            const originalFile = selectedFiles[key];
  
            // Check if the file has changed or if it's a new file
            if (currentFile && (!originalFile || currentFile !== originalFile)) {
              const uploadData = new FormData();
              uploadData.append("research_id", generatedResearchId);
              uploadData.append("category_id", formState.category_id);
              uploadData.append("file_type", currentFile.type);
              uploadData.append("file", currentFile);
  
              // Debugging: Print FormData contents
              for (let [key, value] of uploadData.entries()) {
                console.log(key, value);
              }
  
              try {
                const uploadResponse = await axios.put(
                  "http://localhost:5000/v1/file/upload",
                  uploadData,
                  {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );
  
                if (uploadResponse.status !== 200) {
                  console.error("Failed to upload file:", currentFile.name);
                  return;
                } else {
                  console.log(`File ${currentFile.name} uploaded successfully`);
                }
              } catch (error) {
                console.error("Error uploading file:", currentFile.name, error);
                return;
              }
            }
          }
        }
  
        message.success("Research data and files updated successfully!");
        if (onClose) onClose();
        if (fetchIncentives) fetchIncentives();
        navigate(`/profile/${user.author_id}/researches`);
      } else {
        message.error("Failed to update research data");
        console.error("Failed to update research data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  const returnToCategoryPage = () => {
    if (incentivesData && incentivesData.categoryId) {
      handleReturn(incentivesData.categoryId);
    } else {
      handleReturn(0); // Default to page 1 if category is not set
    }
  };

  const formatFilePath = (filePath) => {
    return filePath ? filePath.replace(/^uploads\\/, "") : "Choose file";
  };

  return (
    <Container fluid style={{ height: "100vh" }}>
      <Row style={{ padding: 0, margin: 0 }}>
        <h2
          className="titleFont p-2"
          style={{
            justifyContent: "center",
            alignContent: "center",
            width: "100vw",
          }}
        >
          Research Incentives Application
        </h2>
      </Row>

      <Row style={{ alignContent: "center", padding: 0, margin: 0 }}>
        <h3
          style={{
            fontSize: "0.8rem",
            paddingLeft: "3rem",
            paddingRight: "3rem",
          }}
        >
          Step 3 of 3
        </h3>
        <ProgressBar style={{ padding: 0 }} variant="warning" now={100} />
      </Row>

      <Form>
        <Row
          className="mb-2"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        >
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="titleFont">
              Research Evaluation Form
            </Form.Label>
            <p className="paragraph">
              Please attach the following forms and supporting documents:
            </p>
          </Form.Group>

          <Col></Col>
        </Row>

        <Row
          className="mb-4"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        >
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">
              Research Evaluation Form (TIP - ARU - 036)
            </Form.Label>
            <div className="custom-file-input-wrapper">
              <input
                type="file"
                id="researchEvaluationForm"
                name="eval_form"
                className="custom-file-input"
                data-file-type="TIP-ARU-036"
                onChange={handleChange}
                disabled={!isEditMode}
              />
              <label
                htmlFor="researchEvaluationForm"
                className="custom-file-label"
              >
                {formatFilePath(selectedFiles["tip-aru-036"]?.file_path) ||
                  "Choose file"}
              </label>
            </div>
          </Form.Group>

          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Full Paper</Form.Label>
            <div className="custom-file-input-wrapper">
              <input
                type="file"
                id="fullPaper"
                name="full_paper"
                className="custom-file-input"
                data-file-type="Full Paper"
                onChange={handleChange}
                disabled={!isEditMode}
              />
              <label htmlFor="fullPaper" className="custom-file-label">
                {formatFilePath(selectedFiles["full paper"]?.file_path) ||
                  "Choose file"}
              </label>
            </div>
          </Form.Group>
        </Row>

        <Row
          className="mb-4"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        >
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Turnitin</Form.Label>
            <div className="custom-file-input-wrapper">
              <input
                type="file"
                id="turnitin"
                name="turnitin"
                className="custom-file-input"
                data-file-type="Turnitin"
                onChange={handleChange}
                disabled={!isEditMode}
              />
              <label htmlFor="turnitin" className="custom-file-label">
                {formatFilePath(selectedFiles["turnitin"]?.file_path) ||
                  "Choose file"}
              </label>
            </div>
          </Form.Group>

          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">
              Research Incentive Form (TIP - ARU - 028)
            </Form.Label>
            <div className="custom-file-input-wrapper">
              <input
                type="file"
                id="researchIncentiveForm"
                name="incentive_form"
                className="custom-file-input"
                data-file-type="TIP-ARU-028"
                onChange={handleChange}
                disabled={!isEditMode}
              />
              <label
                htmlFor="researchIncentiveForm"
                className="custom-file-label"
              >
                {formatFilePath(selectedFiles["tip-aru-028"]?.file_path) ||
                  "Choose file"}
              </label>
            </div>
          </Form.Group>
        </Row>

        <Row
          className="mb-4"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        >
          <Form.Group as={Col} xs lg="6">
            <Form.Label className="labelFont">Grammarly</Form.Label>
            <div className="custom-file-input-wrapper">
              <input
                type="file"
                id="grammarly"
                name="grammarly"
                className="custom-file-input"
                data-file-type="Grammarly"
                onChange={handleChange}
                disabled={!isEditMode}
              />
              <label htmlFor="grammarly" className="custom-file-label">
                {formatFilePath(selectedFiles["grammarly"]?.file_path) ||
                  "Choose file"}
              </label>
            </div>
          </Form.Group>

          <Col></Col>
        </Row>
      </Form>

      <Row
        style={{
          height: "5vh",
          margin: 0,
          paddingLeft: "20rem",
          paddingRight: "20rem",
        }}
      >
        <Button
          variant="outline-warning"
          as={Col}
          onClick={returnToCategoryPage}
        >
          Return
        </Button>
        <Col md="auto"></Col>
        {isEditMode ? (
          <Button variant="warning" as={Col} onClick={handleSubmit}>
            Submit
          </Button>
        ) : (
          <Button variant="warning" as={Col} onClick={onClose}>
            Close
          </Button>
        )}
      </Row>
    </Container>
  );
};

export default IncentivesPage2;
