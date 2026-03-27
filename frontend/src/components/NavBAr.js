import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/auth-context";
import Form from 'react-bootstrap/Form';

function RightPanel({ isLoggedIn }) {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // console.log("User Output:", user);

  const handleProfileClick = () => {
    const profilePath = `/profile/${user.author_id}/researches`; // Construct profile path
    navigate(profilePath);
  };

  if (isLoggedIn == 1) {
    return <></>;
  } else if (isLoggedIn == 2) {
    return (
      <div
        className="d-flex align-items-center"
        style={{ right: "0px", gap: "30px" }}
      >
        <input
  type="text"
  onChange={(e) => navigate("/incentives-application")}
  className="border-0 px-3"
  style={{
    backgroundColor: "#FBC505",
    fontSize: "12px",
    fontWeight: "bolder",
    borderRadius: "15px",
    height: "40px",
    width: "150px"
  }}
  placeholder="Enter Email "
/>


<input
  type="text"
  onChange={(e) => navigate("/incentives-application")}
  className="border-0 px-3"
  style={{
    backgroundColor: "#FBC505",
    fontSize: "12px",
    fontWeight: "bolder",
    borderRadius: "15px",
    height: "40px",
    width: "150px"
  }}
  placeholder="Enter Password"
/>

        <button
          onClick={() => navigate("/incentives-application")}
          className="border-0 px-3"
          style={{
            backgroundColor: "#FBC505",
            fontSize: "12px",
            fontWeight: "bolder",
            borderRadius: "15px",
            height: "40px",
          }}
        >
          Log In
        </button>
      
      </div>
    );
  } else if (isLoggedIn == 3) {
    return (
      <div
        className="d-flex align-items-center"
        style={{ right: "0px", gap: "30px" }}
      >
        <Image
          onClick={handleProfileClick}
          src={require(".././assets/images.jpg")}
          roundedCircle
          height={50}
          style={{ cursor: "pointer" }}
        />
      </div>
    );
  }
}

function Bar({ data, isLoggedIn }) {
  const navigate = useNavigate();
  return (
    <div
      className="m-0 text-white px-5 d-flex align-items-center justify-content-between"
      style={{ backgroundColor: "#2D2D2D", height: "15vh" }}
    >
      <div className="m-0 d-flex align-items-center" style={{ gap: "30px" }}>
        <img
          src={require("../assets/tipLogo.png")}
          onClick={() => {
            navigate("/researcher/profile");
          }}
          alt="tip logo"
          style={{ height: "67px", width: "98px", cursor: "pointer" }}
        />
        <div className="d-flex flex-column justify-content-center">
          <h1
            onClick={() => {
              navigate("/crud");
            }}
            style={{ fontWeight: "200", fontSize: "16px", cursor: "pointer" }}
          >
            Academic Research Unit
          </h1>
          <h2
            onClick={() => {
              navigate("/search");
            }}
            style={{ fontWeight: "100", fontSize: "12px", cursor: "pointer" }}
          >
            Technological Institute of the Philippines
          </h2>
        </div>
      </div>
      <RightPanel isLoggedIn={isLoggedIn} />
    </div>
  );
}

export default Bar;
