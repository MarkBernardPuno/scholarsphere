import axios from "axios";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useAuthContext } from "../contexts/auth-context";
import { message } from "antd";
export const CreateDepartmentModal = ({
  show,
  onClose,
  val,
  trigger,
  setShow,
}) => {
  const [deptName, setDeptName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (deptName !== "") {
      await axios({
        method: "post",
        url: `http://127.0.0.1:5000/v1/departments/main`,
        data: { dept_name: deptName },
      })
        .then((res) => {
          console.log(res.data);
          message.success("Department created successfully.");
        })
        .catch((err) => {
          console.log(err);
          message.error("Failed to create department.");
        });

      setDeptName("");
      trigger(val + 1);
      setShow(false);
    } else {
      message.error("Department name is empty!");
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Department</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className="form-div d-flex justify-content-center align-items-center flex-column">
            <div className="mb-3 d-flex">
              <div className="flex-fill">
                <h1
                  style={{
                    fontSize: "16px",
                    marginBottom: "8px",
                    fontWeight: "normal",
                  }}
                >
                  Department
                </h1>
                <Form.Control
                  type="text"
                  placeholder="Enter new department"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="form-control-style"
                />
              </div>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const DeleteDepartmentModal = ({
  show,
  data,
  onClose,
  val,
  trigger,
  setShow,
}) => {
  const { accessToken } = useAuthContext();

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      const res = await axios({
        method: "delete",
        url: `http://127.0.0.1:5000/v1/departments/${data.dept_id}`,
        headers: { Authorization: "Bearer " + accessToken },
      });

      if (res.status === 200) {
        message.success("Department deleted successfully.");
        trigger(val + 1);
        setShow(false);
      } else {
        message.error(
          "Cannot delete this department because it is referenced by another record."
        );
      }
    } catch (err) {
      console.log(err);
      message.error(
        "Cannot delete this department because it is referenced by another record."
      );
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Department</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {`Are you sure you want to delete the department "${data.dept_name}"?`}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Department
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const ModifyDepartmentModal = ({
  show,
  data,
  onClose,
  val,
  trigger,
  setShow,
  updateDepartmentList,
}) => {
  const { accessToken } = useAuthContext();
  const [deptName, setDeptName] = useState(data.dept_name);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios({
      method: "put",
      url: `http://127.0.0.1:5000/v1/departments/${data.dept_id}`,
      headers: { Authorization: "Bearer " + accessToken },
      data: { dept_name: deptName },
    })
      .then((res) => {
        console.log(res.data);
        if (res.data.success) {
          updateDepartmentList(data.dept_id, deptName);
          message.success("Department name updated successfully.");
        } else {
          message.error("Failed to update department name.");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error("An error occurred while updating the department name.");
      });

    trigger(val + 1);
    setShow(false);
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Department</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className="form-div d-flex justify-content-center align-items-center flex-column">
            <Form.Group
              className="mb-3 position-relative form-group-div"
              controlId="formBasicDeptName"
            >
              <h1
                style={{
                  fontSize: "16px",
                  marginBottom: "8px",
                  fontWeight: "normal",
                }}
              >
                Department Name
              </h1>
              <Form.Control
                type="text"
                placeholder="Department Name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="form-control-style"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
