import axios from "axios";
import React, { useEffect, useState } from "react";
import { Col, Image } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Chart from "../../components/BarChart";
import TopBar from "../../components/topbar";
import "./Research-Profile.css";

const ResearcherProfile = () => {
  const { author_id } = useParams();
  const [resultsItems, setResultItems] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/v1/search", {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          author_id: author_id,
        },
      });
      setResultItems(response.data.data);
      // console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const ResearcherDetails = () => {
    useEffect(() => {
      fetchData();
    }, [author_id]);

    return (
      <div>
        <Col>
          <div
            style={{
              width: "100%",
              display: "flex",
              gap: "30px",
              marginLeft: "7rem",
            }}
          >
            <Image
              src={require("../../assets/images.png")}
              roundedCircle
              height={150}
            />
            {/* <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h1 style={{ fontSize: "2rem", margin: "0" }}>
              {user.author_name}
            </h1>
            <p style={{ fontSize: ".9rem", margin: "0" }}>{user.dept}</p>
          </div> */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {resultsItems.map((item, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center w-100 p-3"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  {index === 0 && (
                    <div
                      style={{
                        paddingRight: "5rem",
                        marginTop: "1rem",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      <h1 style={{ fontSize: "2rem", margin: "0" }}>
                        {item.author_name}
                      </h1>
                      <p
                        style={{
                          fontSize: ".9rem",
                          margin: "0",
                          alignContent: "left-align",
                        }}
                      >
                        {item.dept_name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Col>
      </div>
    );
  };

  const ResearchList = () => {
    const getYearFromPublicationDate = (publicationDate) => {
      return new Date(publicationDate).getFullYear();
    };
    return (
      <div>
        <table
          className="w3-table w3-bordered"
          style={{
            height: "5vh",
            marginTop: "1vh",
            width: "85%",
            fontSize: "12px",
            overflow: "hidden",
            marginLeft: "7rem",
          }}
        >
          <thead className="thead-dark">
            <tr>
              <th
                scope="col"
                className="text-center"
                style={{ width: "40%", verticalAlign: "middle" }}
              >
                Title
              </th>
              <th
                scope="col"
                className="text-center"
                style={{ width: "20%", verticalAlign: "middle" }}
              >
                Cited By:
              </th>
              <th
                scope="col"
                className="text-center"
                style={{ width: "10%", verticalAlign: "middle" }}
              >
                Year
              </th>
            </tr>
          </thead>
          <tbody style={{ marginTop: "20px" }}>
            {resultsItems.map((item, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ width: "40%", verticalAlign: "middle" }}>
                  <span style={{ fontSize: "0.8rem" }}>{item.title}</span>
                </td>
                <td style={{ width: "20%", verticalAlign: "middle" }}></td>
                <td
                  style={{
                    width: "10%",
                    textAlign: "center",
                    verticalAlign: "middle",
                    fontSize: "0.8rem",
                    paddingLeft: "4rem",
                  }}
                >
                  {getYearFromPublicationDate(item.publication_date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const Citation = () => {
    return (
      <div style={{ marginLeft: "0rem" }}>
        <h1 style={{ fontSize: "0.9rem" }}>Citation</h1>
        <table
          className="w3-table w3-bordered"
          style={{
            height: "5vh",
            marginTop: "1vh",
            fontSize: "12px",
            overflow: "hidden",
            marginLeft: "5rem",
          }}
        >
          <thead className="thead-dark ">
            <tr>
              <th
                scope="col"
                className="text-center citation-content"
                style={{ width: "20%", verticalAlign: "middle" }}
              >
                All
              </th>
              <th
                scope="col"
                className="text-center citation-content"
                style={{ width: "10%", verticalAlign: "middle" }}
              >
                Since
              </th>
            </tr>
          </thead>
        </table>
        <table style={{ width: "100%" }}>
          <thead>
            <tr></tr>
          </thead>
          <tbody>
            <tr>
              <td
                className="text-center citation-content"
                style={{
                  verticalAlign: "middle",
                  marginRight: "1rem",
                  width: "1rem",
                  textAlign: "left",
                }}
              >
                Citations
              </td>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "middle", width: "15rem" }}
              >
                1234
              </td>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "right" }}
              >
                1234
              </td>
            </tr>
            <tr>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "left", textAlign: "left" }}
              >
                h-index
              </td>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "middle" }}
              >
                56
              </td>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "right" }}
              >
                1234
              </td>
            </tr>
            <tr>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "middle", textAlign: "left" }}
              >
                i-index
              </td>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "middle" }}
              >
                78
              </td>
              <td
                className="text-center citation-content"
                style={{ verticalAlign: "right" }}
              >
                1234
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

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
        <TopBar isLoggedIn={2} />
      </div>
      <div style={{ display: "flex", marginTop: "2rem" }}>
        <Col style={{ flex: 1.5, padding: "0px" }}>
          <ResearcherDetails />
          <div style={{ marginTop: "0.5rem" }}>
            <ResearchList />
          </div>
        </Col>
        <Col
          className="column-divider"
          style={{ flex: 0.65, paddingTop: "6rem", paddingRight: "4.5rem" }}
        >
          <Citation />
          <div style={{ marginTop: "1rem" }}>
            <Chart />
          </div>
        </Col>
      </div>
    </div>
  );
};

export default ResearcherProfile;
