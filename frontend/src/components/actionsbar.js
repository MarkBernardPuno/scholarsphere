import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/auth-context";

const capitalizeFirstLetter = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

function ActionsItems({ text, img, isHighlighted, onClick }) {
  return (
    <div
      style={{
        display: "flex",
        height: "40px",
        marginBottom: "10px",
        backgroundColor: isHighlighted
          ? "rgba(251,197,5,.5)"
          : "rgba(251,197,5,.1)",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div
        style={{ width: "10px", backgroundColor: "rgba(251,197,5,.31)" }}
      ></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "40px",
          paddingLeft: "10px",
        }}
      >
        <img src={img} alt="" height={25} />
        <p style={{ margin: "0" }}>{text}</p>
      </div>
    </div>
  );
}

function ActionsBar({ value }) {
  const navigate = useNavigate();
  const sidebarItems = [
    {
      id: 1,
      text: "researches",
      imglink: "https://cdn-icons-png.flaticon.com/128/5460/5460934.png",
    },
    // {
    //   id: 2,
    //   text: "notifications",
    //   imglink: "https://cdn-icons-png.flaticon.com/128/2645/2645890.png",
    // },
    {
      id: 2,
      id: 2,
      text: "Research Evaluation",
      imglink: "https://cdn-icons-png.flaticon.com/128/4797/4797927.png",
    },
    {
      id: 3,
      id: 3,
      text: "Research Incentives",
      imglink: "https://cdn-icons-png.flaticon.com/128/4797/4797927.png",
    },
    // {
    //   id: 5,
    //   text: "In-house Research",
    //   imglink: "https://cdn-icons-png.flaticon.com/128/4797/4797927.png",
    // },
    {
      id: 4,
      id: 4,
      text: "researchers",
      imglink: "https://cdn-icons-png.flaticon.com/128/681/681494.png",
    },
    {
      id: 5,
      id: 5,
      text: "departments",
      imglink: "https://cdn-icons-png.flaticon.com/512/1570/1570933.png",
    },
    {
      id: 6,
      id: 6,
      text: "Categories",
      imglink: "https://cdn-icons-png.flaticon.com/512/10516/10516056.png",
    },
    // {
    //   id: 7,
    //   text: "Search",
    //   imglink:
    //     "https://img.icons8.com/?size=100&id=7695&format=png&color=000000",
    // },
    {
      id: 8,
      text: "logout",
      imglink: "https://cdn-icons-png.flaticon.com/128/1828/1828479.png",
    },
  ];
  const [selected, setSelected] = useState(value);
  const [modalLogOut, setModalVisibility] = useState(false);
  const { user } = useAuthContext();

  const handleConfirm = () => {
    setModalVisibility(false);
    navigate("/login");
  };

  const handleShow = () => setModalVisibility(true);
  const handleClose = () => setModalVisibility(false);

  const handleClick = (id) => {
    const selectedItem = sidebarItems.find((item) => item.id === id);

    if (selectedItem) {
      if (selectedItem.text === "logout") {
        handleShow();
      } else if (selectedItem.text === "researches") {
        setSelected(id);
        navigate(`/profile/${user.author_id}/researches`);
      } else {
        setSelected(id);
        navigate(`/profile/${selectedItem.text}`);
      }
    }
  };

  return (
    <>
      {sidebarItems.map((item) => (
        <ActionsItems
          key={item.id}
          text={capitalizeFirstLetter(item.text)}
          img={item.imglink}
          isHighlighted={selected === item.id}
          onClick={() => handleClick(item.id)}
        />
      ))}
      <Modal show={modalLogOut} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout?</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ActionsBar;
