import React from "react";
import { Col } from "react-bootstrap";

const ResearchList = ({ authorId }) => {
  const getYearFromPublicationDate = (publicationDate) => {
    return new Date(publicationDate).getFullYear();
  };

  // Mock data for demonstration
  const resultsItems = [
    { title: "Title 1", publication_date: "2023-01-01" },
    { title: "Title 2", publication_date: "2022-01-01" },
  ];

  return (
    <Col>
      <div className="research-list">
        <table className="research-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Cited By</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {resultsItems.map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>{/* Add cited by data */}</td>
                <td>{getYearFromPublicationDate(item.publication_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Col>
  );
};

export default ResearchList;
