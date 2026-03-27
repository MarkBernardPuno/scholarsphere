import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import "./customModalStyles.css"; // Import the custom CSS

const PDFTemplate = ({ show, handleClose, queryParams }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPDF = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/v1/researches/generateReportPDF",
          {
            headers: {
              "Content-Type": "application/json",
            },
            params: queryParams,
            responseType: "blob",
          }
        );

        const contentType = response.headers["content-type"];
        if (
          contentType &&
          contentType.toLowerCase().includes("application/pdf")
        ) {
          const pdfBlob = new Blob([response.data], {
            type: "application/pdf",
          });
          const url = URL.createObjectURL(pdfBlob);
          setPdfUrl(url);
        } else {
          // If the response is not a PDF, assume it's an error message in JSON
          const reader = new FileReader();
          reader.onload = () => {
            const errorMsg = JSON.parse(reader.result);
            setError(errorMsg.message || "Unexpected response format");
          };
          reader.readAsText(response.data);
        }
      } catch (error) {
        setError("Error fetching PDF: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchPDF();
    }
  }, [show, queryParams]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title>PDF Report</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <iframe
            src={pdfUrl}
            className="custom-iframe"
            title="PDF Report"
          ></iframe>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PDFTemplate;
