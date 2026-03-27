import React, { useState } from "react";
import { Checkbox, Form, Input, Table } from "antd";
import { Button, Col, Container, ProgressBar, Row } from "react-bootstrap";
import { useDataContext } from "../../contexts/data-context";

const EvaluateApplication3 = ({ handleReturn, handleNext }) => {
  const { formData, updateFormData } = useDataContext();
  console.log("formData:", formData);

  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      text1: "TITLE",
      text2: "The title is clear and specifically stated.",
      checkbox1: formData.is_title === true,
      checkbox2: formData.is_title === false,
      textarea: formData.is_title_remarks || "",
    },
    {
      key: "2",
      text1: "PROBLEM",
      text2:
        "The problem statement is concrete and concise.",
      checkbox1: false,
      checkbox2: false,
      textarea: "",
    },
    {
      key: "3",
      text1: "PROBLEM",
      text2:
        "The research provides concrete details of the identified research gaps of problems to be addressed.",
      checkbox1: false,
      checkbox2: false,
      textarea: "",
    },
    {
      key: "4",
      text1: "SIGNIFICANCE OF THE STUDY",
      text2:
        "The study has practical value to the researcher, the school or the community.",
      checkbox1: false,
      checkbox2: false,
      textarea: "",
    },
    {
      key: "5",
      text1: "SIGNIFICANCE OF THE STUDY",
      text2:
        "The research findings are innovative and have practical applications.",
      checkbox1: false,
      checkbox2: false,
      textarea: "",
    },
    {
      key: "6",
      text1: "SIGNIFICANCE OF THE STUDY",
      text2:
        "The research findings satisfy a specific knowledge gap.",
      checkbox1: false,
      checkbox2: false,
      textarea: "",
    },
    {
      key: "7",
      text1: "SIGNIFICANCE OF THE STUDY",
      text2:
        "The research findings lead to an improvement in existing practice.",
      checkbox1: false,
      checkbox2: false,
      textarea: "",
    },
  ]);
  const [form] = Form.useForm();

  const columns = [
    {
      title: "Research Components",
      dataIndex: "text1",
      key: "text1",
      width: "20%",
      align: "center",
      render: (text, _, index) => {
        const obj = {
          children: text,
          props: {},
        };
        if (text === "PROBLEM" && index === 1) {
          obj.props.rowSpan = 2; // Span 2 rows
        }
        if (text === "PROBLEM" && index === 2) {
          obj.props.rowSpan = 0; // Merge with the first row
        }
        if (text === "SIGNIFICANCE OF THE STUDY" && index === 3) {
          obj.props.rowSpan = 4; // Span 4 rows
        }
        if (text === "SIGNIFICANCE OF THE STUDY" && index > 3) {
          obj.props.rowSpan = 0; // Merge with the first row
        }
        return obj;
      },
    },
    {
      title: "Criteria",
      dataIndex: "text2",
      key: "text2",
      width: "50%",
      render: (text) => (
        <div>
          {text.split("\n").map((line, index) => (
            <p key={index} style={{ margin: 0 }}>
              {line}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: "Yes",
      dataIndex: "checkbox1",
      key: "checkbox1",
      render: (checked, record, index) => (
        <Checkbox
          checked={checked}
          onChange={(e) => handleCheckboxChange(e, index, "checkbox1")}
        />
      ),
    },
    {
      title: "No",
      dataIndex: "checkbox2",
      key: "checkbox2",
      render: (checked, record, index) => (
        <Checkbox
          checked={checked}
          onChange={(e) => handleCheckboxChange(e, index, "checkbox2")}
        />
      ),
    },
    {
      title: "Remarks",
      dataIndex: "textarea",
      key: "textarea",
      render: (text, record, index) => (
        <Input.TextArea
          rows={4}
          value={text}
          onChange={(e) => handleTextareaChange(e, index)}
        />
      ),
    },
  ];

  const handleCheckboxChange = (e, index, key) => {
    const newData = [...dataSource];
    newData[index][key] = e.target.checked;

    if (newData[index].key === "1") {
      if (key === "checkbox1" && e.target.checked) {
        updateFormData({ ...formData, is_title: true });
        newData[index].checkbox2 = false;
      } else if (key === "checkbox2" && e.target.checked) {
        updateFormData({ ...formData, is_title: false });
        newData[index].checkbox1 = false;
      } else {
        updateFormData({ ...formData, is_title: false });
      }
    }

    else if (newData[index].key === "2") {
      if (key === "checkbox1" && e.target.checked) {
        updateFormData({ ...formData, is_problem1: true });
        newData[index].checkbox2 = false;
      } else if (key === "checkbox2" && e.target.checked) {
        updateFormData({ ...formData, is_problem1: false });
        newData[index].checkbox1 = false;
      } else {
        updateFormData({ ...formData, is_problem1: false });
      }
    }

    else if (newData[index].key === "3") {
      if (key === "checkbox1" && e.target.checked) {
        updateFormData({ ...formData, is_problem2: true });
        newData[index].checkbox2 = false;
      } else if (key === "checkbox2" && e.target.checked) {
        updateFormData({ ...formData, is_problem2: false });
        newData[index].checkbox1 = false;
      } else {
        updateFormData({ ...formData, is_problem2: false });
      }
    }

    else if (newData[index].key === "4") {
      if (key === "checkbox1" && e.target.checked) {
        updateFormData({ ...formData, is_significance1: true });
        newData[index].checkbox2 = false;
      } else if (key === "checkbox2" && e.target.checked) {
        updateFormData({ ...formData, is_significance1: false });
        newData[index].checkbox1 = false;
      } else {
        updateFormData({ ...formData, is_significance1: false });
      }
    }

    else if (newData[index].key === "5") {
      if (key === "checkbox1" && e.target.checked) {
        updateFormData({ ...formData, is_significance2: true });
        newData[index].checkbox2 = false;
      } else if (key === "checkbox2" && e.target.checked) {
        updateFormData({ ...formData, is_significance2: false });
        newData[index].checkbox1 = false;
      } else {
        updateFormData({ ...formData, is_significance2: false });
      }
    }

    else if (newData[index].key === "6") {
      if (key === "checkbox1" && e.target.checked) {
        updateFormData({ ...formData, is_significance3: true });
        newData[index].checkbox2 = false;
      } else if (key === "checkbox2" && e.target.checked) {
        updateFormData({ ...formData, is_significance3: false });
        newData[index].checkbox1 = false;
      } else {
        updateFormData({ ...formData, is_significance3: false });
      }
    }

    else if (newData[index].key === "7") {
      if (key === "checkbox1" && e.target.checked) {
        updateFormData({ ...formData, is_significance4: true });
        newData[index].checkbox2 = false;
      } else if (key === "checkbox2" && e.target.checked) {
        updateFormData({ ...formData, is_significance4: false });
        newData[index].checkbox1 = false;
      } else {
        updateFormData({ ...formData, is_significance4: false });
      }
    }
    
    setDataSource(newData);
  };

  const handleTextareaChange = (e, index) => {
    const newData = [...dataSource];
    newData[index].textarea = e.target.value;

    if (newData[index].key === "1") {
      updateFormData({ ...formData, is_title_remarks: e.target.value });
    }

    else if (newData[index].key === "2") {
      updateFormData({ ...formData, is_problem1_remarks: e.target.value });
    }

    else if (newData[index].key === "3") {
      updateFormData({ ...formData, is_problem2_remarks: e.target.value });
    }

    else if (newData[index].key === "4") {
      updateFormData({ ...formData, is_significance1_remarks: e.target.value });
    }

    else if (newData[index].key === "5") {
      updateFormData({ ...formData, is_significance2_remarks: e.target.value });
    }

    else if (newData[index].key === "6") {
      updateFormData({ ...formData, is_significance3_remarks: e.target.value });
    }

    else if (newData[index].key === "7") {
      updateFormData({ ...formData, is_significance4_remarks: e.target.value });
    }

    setDataSource(newData);
  };

  return (
    <Container fluid>
      <Row
        className="d-flex align-items-center"
        style={{
          paddingLeft: "1rem",
          gap: "20px",
          paddingRight: "1rem",
          fontFamily: "Kaisei",
        }}
      >
        <Col>
          <h2 className="titleFont">Research Evaluation Checklist</h2>
        </Col>
        <Col xs={6} style={{ paddingLeft: "50vh", paddingTop: "5px" }}></Col>
      </Row>
      
      <h3 style={{fontSize: "0.8rem", paddingLeft: "3rem", paddingRight: "3rem"}}>Step 3 of 5</h3>
      <ProgressBar variant="warning" now={60} className="mb-3" />

      <Form>
        <Row>
          <Col style={{ marginLeft: "40px", marginTop: "0px" }}>
            <h2 className="titleFont p-2">
              II. Research Components, Criteria, and Evaluation
            </h2>
          </Col>
        </Row>
      </Form>
      <div style={{ marginLeft: "20px", marginRight: "20px" }}>
        <Form form={form}>
          <Table dataSource={dataSource} columns={columns} pagination={false} />
        </Form>
      </div>
      <Form>
        <Row
          className="mb-1"
          style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
        ></Row>
      </Form>
      <Row style={{ padding: "2rem",paddingLeft: "18rem", paddingRight: "18rem" }}>
        <>
          <Button variant="outline-warning" as={Col} onClick={handleReturn}>
            Return
          </Button>{" "}
          <Col md="auto"></Col>
          <Button variant="warning" as={Col} onClick={handleNext}>
            Continue
          </Button>{" "}
        </>
      </Row>
    </Container>
  );
};

export default EvaluateApplication3;
