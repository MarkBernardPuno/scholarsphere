import TopBar from "../../components/topbar";
import ActionsBar from "../../components/actionsbar";
import { Tabs, Tab, Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDataContext } from "../../contexts/data-context";
import SideNav from "./side-nav";
import EvaluateApplication1 from "../EvaluateApplication/EvaluateApplication1";
import EvaluateApplication2 from "../EvaluateApplication/EvaluateApplication2";
import EvaluateApplication3 from "../EvaluateApplication/EvaluateApplication3";
import EvaluateApplication4 from "../EvaluateApplication/EvaluateApplication4";
import EvaluateApplication6 from "../EvaluateApplication/EvaluateApplication6";
import AgendaAlignment1 from "../CheckinIncentives/AgendaAlignment1";
import AgendaAlignment2 from "../CheckinIncentives/AgendaAlignment2";
import AgendaAlignment3 from "../CheckinIncentives/AgendaAlignment3";
import AgendaAlignment4 from "../CheckinIncentives/AgendaAlignment4";
import AgendaAlignment5 from "../CheckinIncentives/AgendaAlignment5";
import CheckEvaluation from "../CheckinIncentives/CheckEvaluation";
import "./researchers-page.css";
import { message } from "antd";
const TabHeader = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          marginTop: "15px",
          fontSize: ".7em",
        }}
      >
        <span style={{ width: "30%", fontWeight: "Bold", textAlign: "center" }}>
          Title
        </span>
        <span style={{ width: "10%", fontWeight: "Bold", textAlign: "center" }}>
          Department
        </span>
        <span style={{ width: "20%", fontWeight: "Bold", textAlign: "center" }}>
          Authors
        </span>
        <span style={{ width: "30%", fontWeight: "Bold", textAlign: "center" }}>
          Status
        </span>
        <span
          style={{
            marginRight: "2%",
            width: "10%",
            fontWeight: "Bold",
            textAlign: "center",
          }}
        >
          Actions
        </span>
      </div>
      <hr style={{ margin: "0" }} />
    </>
  );
};

const EvaluationModal = ({ show, onClose, type, evaluationId, fetchApplications }) => {
  const { formData, updateFormData, resetFormData } = useDataContext();
  const [curPage, setCurPage] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (show) {
      setCurPage(0);
    }
  }, [show]);

  const handleClose = () => {
    resetFormData();
    onClose();
  };

  const changePage = () => {
    if (type === "evaluate") {
      switch (curPage) {
        case 0:
          return (
            <EvaluateApplication1
              handleReturn={handleClose}
              handleNext={() => setCurPage(1)}
              formData={formData}
              updateFormData={updateFormData}
            />
          );
        case 1:
          return (
            <EvaluateApplication2
              handleReturn={() => setCurPage(0)}
              handleNext={() => setCurPage(2)}
              formData={formData}
              updateFormData={updateFormData}
            />
          );
        case 2:
          return (
            <EvaluateApplication3
              handleReturn={() => setCurPage(1)}
              handleNext={() => setCurPage(3)}
              formData={formData}
              updateFormData={updateFormData}
            />
          );
        case 3:
          return (
            <EvaluateApplication4
              handleReturn={() => setCurPage(2)}
              handleNext={() => setCurPage(4)}
              formData={formData}
              updateFormData={updateFormData}
            />
          );
        case 4:
          return (
            <EvaluateApplication6
              handleReturn={() => setCurPage(3)}
              handleNext={handleClose}
              updateFormData={updateFormData}
              fetchApplications={fetchApplications}
            />
          );
        default:
          return null;
      }
    } else if (type === "agenda") {
      switch (curPage) {
        case 0:
          return (
            <CheckEvaluation
              handleReturn={handleClose}
              handleNext={() => setCurPage(1)}
              evaluationId={evaluationId}
              formData={formData}
              updateFormData={updateFormData}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
          );
        case 1:
          return (
            <AgendaAlignment1
              handleReturn={() => setCurPage(0)}
              handleNext={() => setCurPage(2)}
              formData={formData}
              updateFormData={updateFormData}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
          );
        case 2:
          return (
            <AgendaAlignment2
              handleReturn={() => setCurPage(1)}
              handleNext={() => setCurPage(3)}
              formData={formData}
              updateFormData={updateFormData}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
          );
        case 3:
          return (
            <AgendaAlignment3
              handleReturn={() => setCurPage(2)}
              handleNext={() => setCurPage(4)}
              formData={formData}
              updateFormData={updateFormData}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
          );
        case 4:
          return (
            <AgendaAlignment5
              handleReturn={() => setCurPage(3)}
              evaluationId={evaluationId}
              formData={formData}
              updateFormData={updateFormData}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="researcher-div-modal"
    >
      <div
        style={{ height: "90vh", width: "100%", overflowY: "scroll" }}
        className="d-flex py-4"
      >
        {changePage()}
      </div>
    </Modal>
  );
};

const ApplicationItem = ({ data }) => {
  const [hidden, setHidden] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
  const navigate = useNavigate();

  const handleCloseAgendaModal = () => {
    setShowAgendaModal(false);
  };

  const handleOpenAgendaModal = (evaluationId) => {
    setSelectedEvaluationId(evaluationId);
    setShowAgendaModal(true);
  };

  const handleApplyIncentive = (evaluationId) => {
    navigate(`/apply-incentive/${evaluationId}`);
  };

  const shouldShowApplyButton = () => {
    const statusId = data.evaluations.map((evaluation) => evaluation.status_id);
    return statusId.includes(3) || statusId.includes(4) || statusId.includes(5);
  };

  return (
    <div style={{ fontSize: "14px" }}>
      <div
        className="d-flex align-items-center w-100 py-3"
        style={
          hidden
            ? { backgroundColor: "rgba(251,197,5,.5)", cursor: "pointer" }
            : { backgroundColor: "#ffffff", cursor: "default" }
        }
        onMouseEnter={() => setHidden(true)}
        onMouseLeave={() => setHidden(false)}
        onClick={() => handleOpenAgendaModal(data.evaluations[0].evaluation_id)}
      >
        <span
          title={data.title}
          style={{
            width: "30%",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.title}
        </span>
        <span style={{ width: "10%", textAlign: "center" }}>
          {data.departments
            .map((department) => department.dept_name)
            .join(", ")}
        </span>
        <span
          title={data.authors}
          style={{
            width: "20%",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.authors}
        </span>
        <span
          style={{
            width: "30%",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.evaluations
            .map((evaluation) => evaluation.status_desc)
            .join(", ")}
        </span>
        <span style={{ marginLeft: "1%", marginRight: "1%", width: "8%" }}>
          {shouldShowApplyButton() && (
            <Button
              variant="warning"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApplyIncentive(data.evaluations[0].evaluation_id);
              }}
            >
              Apply for Incentive
            </Button>
          )}
        </span>
      </div>
      <hr className="m-0" />

      <EvaluationModal
        show={showAgendaModal}
        evaluationId={selectedEvaluationId}
        onClose={handleCloseAgendaModal}
        type="agenda"
      />
    </div>
  );
};

const ApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [curPage, setCurPage] = useState(0);
  const [key, setKey] = useState("All");

  const handleCloseEvaluateModal = () => {
    setShowEvaluateModal(false);
  };

  const handleOpenEvaluateModal = () => {
    setShowEvaluateModal(true);
  };

  useEffect(() => {
    if (showEvaluateModal) {
      setCurPage(0);
    }
  }, [showEvaluateModal]);

  const fetchApplications = () => {
    axios({
      method: "get",
      url: `http://localhost:5000/v1/incentivesevaluation/main`,
    })
      .then((res) => {
        if (res.data.success) {
          const formattedData = res.data.data.map((application) => ({
            ...application,
            authors: application.authors
              .map((author) => author.author_name)
              .join(", "),
          }));
          setApplications(formattedData);
        } else {
          message.error("There are no applications.");
        }
      })
      .catch(() => {
        message.error("There are no applications.");
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);


  return (
    <div className="pt-3 px-0" style={{ width: "90%" }}>
      <div className="d-flex justify-content-between">
        <h1 className="mb-3" style={{ fontSize: "20px", fontWeight: "900" }}>
          Evaluations
        </h1>
        <Button
          className="mb-3"
          variant="warning"
          style={{ fontSize: "12px", fontWeight: "400" }}
          onClick={handleOpenEvaluateModal}
        >
          Evaluate Application
        </Button>
      </div>

      <Tabs
        id="controlled-tab-notifications"
        activeKey={key}
        onSelect={(k) => setKey(k)} // Update key state on tab change
      >
        <Tab eventKey="All" title="All">
          <TabHeader />
          <div style={{ overflowY: "scroll", height: "60vh" }}>
            {applications.map((item) => (
              <ApplicationItem key={item.id} data={item} />
            ))}
          </div>
        </Tab>
      </Tabs>

      <EvaluationModal
        show={showEvaluateModal}
        onClose={handleCloseEvaluateModal}
        type="evaluate"
        fetchApplications={fetchApplications}
      />
    </div>
  );
};

const ApplicationsPage = () => {
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
          <ActionsBar value={2} />
        </SideNav>
        <div style={{ width: "80%", display: "flex" }}>
          <ApplicationsPanel />
        </div>
      </div>
    </div>
  );
};

export default ApplicationsPage;
