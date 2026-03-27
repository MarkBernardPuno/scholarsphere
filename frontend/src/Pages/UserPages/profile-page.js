import TopBar from "../../components/topbar";
import ActionsBar from "../../components/actionsbar";
import SearchBar2 from "../../components/Search-bar";
import { useAuthContext } from "../../contexts/auth-context";
import { useEffect, useState } from "react";
import axios from "axios";
import SideNav from "./side-nav";
import { useSelector, useDispatch } from "react-redux";

function format_date(x) {
  const date = new Date(x);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

const SearchItem = ({ item, index }) => {
  const [hidden, setHidden] = useState(false);

  return (
    <>
      <div
        style={
          hidden
            ? { backgroundColor: "rgba(251,197,5,.5)", cursor: "pointer" }
            : { backgroundColor: "#ffffff", cursor: "default" }
        }
        onMouseEnter={() => setHidden(true)}
        onMouseLeave={() => setHidden(false)}
      >
        <div
          style={{
            display: "flex",
            fontSize: "0.8em",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className="py-2"
        >
          {/* <img
            src="https://cdn-icons-png.flaticon.com/128/8924/8924271.png"
            alt=""
            height={20}
          /> */}
          <div
            style={{
              paddingLeft: "3rem",
              display: "flex",
              width: "95%",
              alignItems: "center",
            }}
          >
            <div style={{ width: "70%" }}>
              <p
                style={{
                  fontSize: "0.9em",
                  fontWeight: "600",
                  overflow: "clip",
                  width: "100%",
                  height: "20px",
                  margin: "0",
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  fontSize: "0.7em",
                  fontWeight: "bold",
                  overflow: "clip",
                  width: "100%",
                  margin: "0",
                }}
              >
                {item.authors}
              </p>
            </div>
          </div>
        </div>
        <hr style={{ margin: "0px" }} />
      </div>
    </>
  );
};

const ResearchesPanel = () => {
  const { user, accessToken } = useAuthContext();
  const [resultsItems, setResultItems] = useState([]);
  const researcherSearch = useSelector(
    (state) => state.searchResearcher.researcher
  );
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/v1/researchers/${user.user_id}/researches`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
          params: {
            q: researcherSearch,
          },
        }
      );
      console.log("Response Data:", response.data);
      setResultItems(response.data.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log("No research records found for this author.");
        setResultItems([]);
      } else {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [researcherSearch, user.user_id, accessToken]);

  return (
    <div className="pt-3 px-0" style={{ width: "100%" }}>
      <h1
        className="mb-3"
        style={{ fontSize: "20px", fontWeight: "900", marginLeft: "5px" }}
      >
        Researches
      </h1>
      <SearchBar2
        context="researcher-profile"
        width="90%"
        defaultValue={researcherSearch}
        style={{ marginLeft: "100px" }}
      />
      <div
        style={{
          display: "flex",
          width: "100%",
          paddingLeft: "5%",
          marginTop: "15px",
          fontSize: ".7em",
        }}
      ></div>

      <hr style={{ margin: "0" }} />

      <div
        style={{
          width: "100%",
          height: "60vh",
          display: "flex",
          flexDirection: "column",
          overflowY: "scroll",
        }}
      >
        {resultsItems.map((item, index) => (
          <SearchItem item={item} index={index} />
        ))}
      </div>
    </div>
  );
};

const ResearchMetrics = () => {
  return (
    <div
      className="p-4 col-2"
      style={{ borderLeft: "1px solid #A7A9AD", width: "25%" }}
    >
      <h1 style={{ fontSize: ".8em", fontWeight: "bold" }}>Cited By:</h1>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div>
        <TopBar isLoggedIn={4} />
      </div>
      <div style={{ height: "85vh", display: "flex" }}>
        <SideNav>
          <ActionsBar value={1} />
        </SideNav>
        <div style={{ width: "80%", display: "flex" }}>
          <ResearchesPanel />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
