import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import {
  setSelectedColumns,
  clearSelectedColumns,
} from "../../../redux/actions/columnActions";
import PDFTemplate from "./PDFTemplate";
import ExcelTemplate from "./ExcelTemplate";

const GenerateReportModal = ({ show, handleClose, data, columns }) => {
  const dispatch = useDispatch();

  // Redux state values
  const selectedColumns = useSelector(
    (state) => state.columnsRedux.selectedColumns
  );
  const query = useSelector((state) => state.searchQuery.query);
  const selectedDepartment = useSelector(
    (state) => state.selectedDepartment.departments
  );
  const presentationLocationRedux = useSelector(
    (state) => state.presentationLocationRedux.presentationLocation
  );
  const publicationLocationRedux = useSelector(
    (state) => state.publicationLocationRedux.publicationLocation
  );
  const selectedEndDate = useSelector((state) => state.selectedEndDate.endDate);
  const selectedStartDate = useSelector(
    (state) => state.selectedStartDate.startDate
  );
  const selectedCampus = useSelector((state) => state.selectedCampus.campus);

  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [queryParams, setQueryParams] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [header, setHeader] = useState("");
  const [subheader, setSubheader] = useState("");

  useEffect(() => {
    if (!show) {
      // Reset header and subheader when modal is closed
      setHeader("");
      setSubheader("");
    }
  }, [show]);

  const handleColumnChange = (e, col) => {
    setShowWarning(false); // Reset warning when a column is selected or deselected

    let updatedColumns;
    if (e.target.checked) {
      updatedColumns = selectedColumns ? `${selectedColumns},${col}` : col;
    } else {
      const columnArray = selectedColumns.split(",");
      updatedColumns = columnArray.filter((column) => column !== col).join(",");
    }
    dispatch(setSelectedColumns(updatedColumns));
  };

  const handleModalClose = () => {
    dispatch(clearSelectedColumns());
    handleClose();
  };

  const handleGeneratePDF = () => {
    if (!selectedColumns || selectedColumns.split(",").length === 0) {
      setShowWarning(true); // Show warning if no columns are selected
      return;
    }

    console.log("Current selected columns:", selectedColumns);
    // Prepare query parameters
    const params = {
      q: query,
      department: selectedDepartment,
      endDate: selectedEndDate,
      startDate: selectedStartDate,
      presentation: presentationLocationRedux,
      publication: publicationLocationRedux,
      camp_name: selectedCampus,
      columns: selectedColumns,
      header: header,
      subheader: subheader,
    };

    // Set query parameters for PDFTemplate component
    setQueryParams(params);

    setShowPDFModal(true); // Show the PDF modal
  };

  const handleGenerateExcel = () => {
    if (!selectedColumns || selectedColumns.split(",").length === 0) {
      setShowWarning(true); // Show warning if no columns are selected
      return;
    }

    console.log("Current selected columns:", selectedColumns);
    // Prepare query parameters
    const params = {
      q: query,
      department: selectedDepartment,
      endDate: selectedEndDate,
      startDate: selectedStartDate,
      presentation: presentationLocationRedux,
      publication: publicationLocationRedux,
      camp_name: selectedCampus,
      columns: selectedColumns,
      header: header,
      subheader: subheader,
    };

    // Set query parameters for ExcelTemplate component
    setQueryParams(params);

    setShowExcelModal(true); // Show the Excel modal
  };

  const selectedColumnArray = selectedColumns ? selectedColumns.split(",") : [];

  return (
    <>
      <Modal show={show} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showWarning && (
            <Alert variant="danger">
              Please select at least one column to generate the report.
            </Alert>
          )}
          <Form>
            {columns.map((col, index) => (
              <Form.Check
                type="checkbox"
                id={`checkbox-${index}`}
                label={col}
                key={index}
                checked={selectedColumnArray.includes(col)}
                onChange={(e) => handleColumnChange(e, col)}
              />
            ))}
            <Form.Group controlId="header">
              <Form.Label>Header</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter header"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="subheader">
              <Form.Label>Subheader</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter subheader"
                value={subheader}
                onChange={(e) => setSubheader(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleGeneratePDF}>
            Generate PDF
          </Button>
          <Button variant="success" onClick={handleGenerateExcel}>
            Generate Excel
          </Button>
        </Modal.Footer>
      </Modal>
      {queryParams && (
        <>
          <PDFTemplate
            show={showPDFModal}
            handleClose={() => setShowPDFModal(false)}
            queryParams={queryParams}
          />
          <ExcelTemplate
            show={showExcelModal}
            handleClose={() => setShowExcelModal(false)}
            queryParams={queryParams}
          />
        </>
      )}
    </>
  );
};

export default GenerateReportModal;
