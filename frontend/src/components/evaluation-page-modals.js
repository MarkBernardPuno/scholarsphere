import axios from "axios";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useAuthContext } from "../contexts/auth-context";
import { message } from "antd";
export const DeleteEvaluationModal = ({
  show,
  evaluationId,
  onClose,
  trigger,
  setShow,
}) => {
  const { accessToken } = useAuthContext();

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      const res = await axios({
        method: "delete",
        url: `http://localhost:5000/v1/incentivesevaluation/main/${evaluationId}`,
        headers: { Authorization: "Bearer " + accessToken },
      });

      if (res.status === 200) {
        message.success("Evaluation deleted successfully.");
        trigger(evaluationId + 1);
        setShow(false);
      } else {
        message.success(
          "Cannot delete this evaluation because it is referenced by another record."
        );
      }
    } catch (err) {
      console.log(err);
      message.error(
        "Cannot delete this evaluation because it is referenced by another record."
      );
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Evaluation</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {`Are you sure you want to delete the evaluation ?`}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Evaluation
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
