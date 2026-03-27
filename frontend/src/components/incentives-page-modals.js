import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import { useAuthContext } from "../contexts/auth-context";
import { message } from "antd";
export const DeleteIncentivesModal = ({
  show,
  applicationId,
  onClose,
  setShow,
  fetchIncentives
}) => {
  const { accessToken } = useAuthContext();

  const handleDelete = async (e) => {
    e.preventDefault();

    try {
      const res = await axios({
        method: "delete",
        url: `http://localhost:5000/v1/incentivesapplication/main/${applicationId}`,
        headers: { Authorization: "Bearer " + accessToken },
      });

      if (res.status === 200) {
        message.success("Incentives Application deleted successfully.");
        setShow(false);
        onClose();
        fetchIncentives();
      } else {
        message.error(
          "Cannot delete this incentives application because it is referenced by another record."
        );
      }
    } catch (err) {
      console.log(err);
      message.error(
        "Cannot delete this incentives application because it is referenced by another record."
      );
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Incentives Application</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {`Are you sure you want to delete the incentives application?`}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Incentives Application
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
