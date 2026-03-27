import React from "react";
import { Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchBar2 from "../../frontend/src/components/Search-bar";
import TopBar from "../../frontend/src/components/topbar";

const MainSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useSelector((state) => state.searchQuery.query);

  return (
    <div>
      <Row>
        <TopBar isLoggedIn={2} />
      </Row>
      <Row className="justify-content-center" style={{ marginTop: "10%" }}>
        <h1
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontFamily: "kaisei harunoumi",
            color: "#FBC505",
          }}
        >
          ScholarSphere
        </h1>
        <p style={{ fontSize: "20px", textAlign: "center" }}>
          Explore the Academic Research Unit's Research Database
        </p>
        <SearchBar2 width="70%" context="researcher" />
        <p
          style={{
            textAlign: "center",
            fontFamily: "kaisei harunoumi",
            fontSize: "15px",
          }}
        >
          Refine your search using keyword queries per column and Boolean
          operators. Enclose phrases in double quotes for exact matches.
          <br />
          Use AND to narrow. OR to broaden. and NOT to exclude terms.{" "}
          <a href="/search">Advanced Search</a>
        </p>
      </Row>
      <Row style={{ marginTop: "5%" }}>
        <h1 style={{ textAlign: "center" }}>Top Cited Researches</h1>
      </Row>
    </div>
  );
};

export default MainSearch;
