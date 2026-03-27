import React, { useEffect, useState } from "react";
import { Col, Image } from "react-bootstrap";
import axios from "axios";

const ResearcherDetails = ({ authorId }) => {
  const [resultsItems, setResultItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/v1/search", {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            author_id: authorId,
          },
        });
        setResultItems(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [authorId]);

  return (
    <Col>
      <div className="researcher-details">
        {resultsItems.map((item, index) => (
          <div key={index}>
            <Image
              src={require(`../../assets/${item.image}`)}
              roundedCircle
              height={150}
            />
            <div>
              <h1>{item.author_name}</h1>
              <p>{item.dept_name}</p>
            </div>
          </div>
        ))}
      </div>
    </Col>
  );
};

export default ResearcherDetails;
