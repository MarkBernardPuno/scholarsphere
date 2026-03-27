import React, { useEffect, useState, useRef } from "react";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import * as XLSX from "xlsx";
import "./customModalStyles.css";

const ExcelTemplate = ({ show, handleClose, queryParams }) => {
  const [xlsxData, setXlsxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [xlsxBlob, setXlsxBlob] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchXLSX = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/v1/researches/generateReportExcel",
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
          contentType
            .toLowerCase()
            .includes(
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        ) {
          const xlsxBlob = new Blob([response.data], {
            type: contentType,
          });
          setXlsxBlob(xlsxBlob); // Set the blob for downloading
          const arrayBuffer = await xlsxBlob.arrayBuffer();
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const htmlString = XLSX.utils.sheet_to_html(worksheet, {
            header: "Excel Preview",
            skipHeader: true, // Ensure headers are included
          });
          setXlsxData(htmlString);
        } else {
          // If the response is not an XLSX, assume it's an error message in JSON
          const reader = new FileReader();
          reader.onload = () => {
            const errorMsg = JSON.parse(reader.result);
            setError(errorMsg.message || "Unexpected response format");
          };
          reader.readAsText(response.data);
        }
      } catch (error) {
        setError("Error fetching XLSX: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchXLSX();
    }
  }, [show, queryParams]);

  const handleDownload = () => {
    if (xlsxBlob) {
      const url = URL.createObjectURL(xlsxBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      dialogClassName="custom-modal-dialog"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Excel Report</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>{error}</div>
        ) : xlsxData ? (
          <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: xlsxData }}
            className="custom-table" // Apply the custom table styles
            style={{ width: "100%", overflowX: "auto" }}
          />
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          Download
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExcelTemplate;
