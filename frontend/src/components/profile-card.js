import { Button, Modal, Image, Form } from "react-bootstrap";
import { useAuthContext } from "../contexts/auth-context";
import { useState } from "react";
import { BsPersonFill } from "react-icons/bs";
import axios from "axios";
import { message } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const capitalizeFirstLetter = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const fetchProfileImage = async (userId) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:5000/v1/users/latest_image/${userId}`,
      {
        responseType: "blob",
      }
    );
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error fetching the latest image:", error);
    return "";
  }
};

function ProfileCard() {
  const { user } = useAuthContext();
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const queryClient = useQueryClient();

  const { data: profileImageUrl, refetch } = useQuery({
    queryKey: ["profileImage", user?.user_id],
    queryFn: () => fetchProfileImage(user?.user_id),
    refetchOnWindowFocus: true,
    enabled: !!user?.user_id,
  });

  const handleShow = () => {
    setShow(true);
    refetch();
  };
  const handleClose = () => setShow(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setPreview(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType !== "jpg" && fileType !== "jpeg" && fileType !== "png") {
      message.error("Please upload a JPG or PNG image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `http://127.0.0.1:5000/v1/users/upload_image/${user.user_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Image uploaded successfully!");
      message.success("Image uploaded successfully!");
      setFile(null); // Reset the file input
      setPreview(""); // Clear the preview
      refetch(); // Refresh the profile image
      handleClose(); // Close the modal
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Error uploading file.");
    }
  };

  return (
    <>
      <div
        onClick={handleShow}
        style={{ width: "100%", display: "flex", gap: "30px" }}
      >
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            roundedCircle
            style={{
              cursor: "pointer",
              width: "100px",
              height: "100px",
              objectFit: "cover",
            }}
          />
        ) : (
          <BsPersonFill style={{ cursor: "pointer" }} size={50} />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h1 style={{ fontSize: "1em", margin: "0" }}>
            {capitalizeFirstLetter(user.author_name)}
          </h1>
          <p style={{ fontSize: ".7em", margin: "0" }}>
            {user.role} at {user.dept}
          </p>
          <p style={{ fontSize: ".7em", margin: "0" }}>{user.campus}</p>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Name: {capitalizeFirstLetter(user.author_name)}</p>
          <p>Role: {capitalizeFirstLetter(user.role)}</p>
          <p>Department: {capitalizeFirstLetter(user.dept)}</p>
          <p>Email: {user.email}</p>

          {/* Upload Photo Section */}
          <Form>
            <Form.Group>
              <Form.Label>Profile Photo</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Form.Group>
            {preview && (
              <div style={{ marginTop: "10px" }}>
                <Image src={preview} roundedCircle style={{ width: "100px" }} />
              </div>
            )}
            <Button
              variant="primary"
              onClick={handleUpload}
              style={{ marginTop: "10px", backgroundColor: "#FBC505" }}
              disabled={!file}
            >
              Upload Photo
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ProfileCard;
