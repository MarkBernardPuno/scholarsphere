import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/auth-context";
import { CiMenuBurger } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { BsPersonFill } from "react-icons/bs";
import { FaMagnifyingGlass } from "react-icons/fa6";

function RightPanel({ isLoggedIn }) {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // console.log("User Output:", user);

  const handleProfileClick = () => {
    const profilePath = `/profile/${user.author_id}/researches`; // Construct profile path
    navigate(profilePath);
  };

  const handleSearchClick = () => {
    const profilePath = `/mainSearch`; // Construct profile path
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
        <button
          onClick={() => navigate("/incentives-application")}
          className="border-0 px-3"
          style={{
            backgroundColor: "#FBC505",
            fontSize: "12px",
            fontWeight: "bolder",
            borderRadius: "15px",
            height: "35px",
          }}
        >
          Apply for Incentive
        </button>
        <div
          onClick={handleProfileClick}
          style={{ cursor: "pointer", display: "inline-block" }}
        >
          <CiMenuBurger size={25} />
        </div>
      </div>
    );
  } else if (isLoggedIn == 3) {
    return (
      <div
        className="d-flex align-items-center"
        style={{ right: "0px", gap: "30px" }}
      >
        <CiMenuBurger
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
          size={30}
        />
      </div>
    );
  } else if (isLoggedIn == 4) {
    return (
      <div
        className="d-flex align-items-center"
        style={{ right: "0px", gap: "30px" }}
      >
        <FaMagnifyingGlass
          onClick={handleSearchClick}
          style={{ cursor: "pointer" }}
          size={30}
        />
      </div>
    );
  }
}

function TopBar({ data, isLoggedIn }) {
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
            navigate("/mainSearch");
          }}
          alt="tip logo"
          style={{ height: "67px", width: "98px", cursor: "pointer" }}
        />
        <div className="d-flex flex-column justify-content-center">
          <h1
            onClick={() => {
              navigate("/mainSearch");
            }}
            style={{ fontWeight: "200", fontSize: "16px", cursor: "pointer" }}
          >
            Academic Research Unit
          </h1>
          <h2
            onClick={() => {
              navigate("/mainSearch");
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

export default TopBar;
