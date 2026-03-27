import axios from "axios";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useAuthContext } from "../contexts/auth-context";
import { message } from "antd";
export const CreateCategoryModal = ({
  show,
  onClose,
  val,
  trigger,
  setShow,
}) => {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (categoryName !== "") {
      await axios({
        method: "post",
        url: `http://127.0.0.1:5000/v1/category/main`,
        data: { category_description: categoryName },
      })
        .then((res) => {
          console.log(res.data);
          message.success("Category created successfully.");
        })
        .catch((err) => {
          console.log(err);
          message.error("Failed to create category.");
        });

      setCategoryName("");
      trigger(val + 1);
      setShow(false);
    } else {
      message.error("Category name is empty!");
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Category</Modal.Title>
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
                  Category
                </h1>
                <Form.Control
                  type="text"
                  placeholder="Enter new category"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
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

// Delete Category Modal
export const DeleteCategoryModal = ({
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
        url: `http://127.0.0.1:5000/v1/category/${data.category_id}`,
        headers: { Authorization: "Bearer " + accessToken },
      });

      if (res.status === 200) {
        message.success("Category deleted successfully.");
        trigger(val + 1);
        setShow(false);
      } else {
        message.error(
          "Cannot delete this category because it is referenced by another record."
        );
      }
    } catch (err) {
      console.log(err);
      message.error(
        "Cannot delete this category because it is referenced by another record."
      );
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {`Are you sure you want to delete the category "${data.category_name}"?`}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Category
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// Modify Category Modal
export const ModifyCategoryModal = ({
  show,
  data,
  onClose,
  val,
  trigger,
  setShow,
  updateCategoryList,
}) => {
  const { accessToken } = useAuthContext();
  const [categoryName, setCategoryName] = useState(data.category_description);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios({
      method: "put",
      url: `http://127.0.0.1:5000/v1/category/${data.category_id}`,
      headers: { Authorization: "Bearer " + accessToken },
      data: { category_description: categoryName },
    })
      .then((res) => {
        console.log(res.data);
        if (res.data.success) {
          updateCategoryList(data.category_id, categoryName);
          message.success("Category description updated successfully.");
        } else {
          message.error("Failed to update category description.");
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(
          "An error occurred while updating the category description."
        );
      });

    trigger(val + 1);
    setShow(false);
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className="form-div d-flex justify-content-center align-items-center flex-column">
            <Form.Group
              className="mb-3 position-relative form-group-div"
              controlId="formBasicCategoryName"
            >
              <h1
                style={{
                  fontSize: "16px",
                  marginBottom: "8px",
                  fontWeight: "normal",
                }}
              >
                Category Description
              </h1>
              <Form.Control
                type="text"
                placeholder="Category Description"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
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
