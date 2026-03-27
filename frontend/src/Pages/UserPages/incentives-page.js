import TopBar from "../../components/topbar";
import ActionsBar from "../../components/actionsbar";
import { Tabs, Tab, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LiaUserEditSolid } from "react-icons/lia";
import { MdDeleteForever } from "react-icons/md";
import SideNav from "./side-nav";
import "./researchers-page.css";
import axios from "axios";
import IncentivesPage1 from "../IncentivesPage/IncentivesPage1";
import IncentivesPage2 from "../IncentivesPage/IncentivesPage2";
import IncentivesPageC1 from "../IncentivesPage/IncentivesPageC1";
import IncentivesPageC2 from "../IncentivesPage/IncentivesPageC2";
import IncentivesPageC3 from "../IncentivesPage/IncentivesPageC3";
import IncentivesPageC4 from "../IncentivesPage/IncentivesPageC4";
import IncentivesPageC5 from "../IncentivesPage/IncentivesPageC5";
import IncentivesPageC6 from "../IncentivesPage/IncentivesPageC6";
import IncentivesPageC7 from "../IncentivesPage/IncentivesPageC7";
import { DeleteIncentivesModal } from "../../components/incentives-page-modals";
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
        <span style={{ width: "30%", fontWeight: "Bold", textAlign: "center" }}>
          Authors
        </span>
        <span style={{ width: "20%", fontWeight: "Bold", textAlign: "center" }}>
          Category
        </span>
        <span style={{ width: "10%", fontWeight: "Bold", textAlign: "center" }}>
          Actions
        </span>
      </div>
      <hr style={{ margin: "0" }} />
    </>
  );
};

const ResearchIncentiveModal = ({ show, onClose, applicationId, isEditMode, fetchIncentives}) => {
  const [curPage, setCurPage] = useState(0);
  const [categoryId, setCategoryId] = useState(0);
  const [incentivesData, setIncentivesData] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    if (show) {
      setCurPage(0);
    }
  }, [show]);

  const handleCurPageCategory = (
    newCategoryId,
    data,
    formData,
    selectedFiles
  ) => {
    setCategoryId(newCategoryId);
    setIncentivesData(data);
    setFormData(formData);
    setSelectedFiles(selectedFiles);
    setCurPage(newCategoryId);
  };

  const handleReturnToPage = (categoryPage) => {
    setCurPage(categoryPage);
  };

  const changePage = () => {
    switch (curPage) {
      case 0:
        return (
          <IncentivesPage1
            handleReturn={onClose}
            handleNext={handleCurPageCategory}
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 1:
        return (
          <IncentivesPageC1
            handleReturn={() => setCurPage(0)}
            handleNext={(formData, selectedFiles) =>
              handleCurPageCategory(8, incentivesData, formData, selectedFiles)
            }
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 2:
        return (
          <IncentivesPageC2
            handleReturn={() => setCurPage(0)}
            handleNext={(formData, selectedFiles) =>
              handleCurPageCategory(8, incentivesData, formData, selectedFiles)
            }
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 3:
        return (
          <IncentivesPageC3
            handleReturn={() => setCurPage(0)}
            handleNext={(formData, selectedFiles) =>
              handleCurPageCategory(8, incentivesData, formData, selectedFiles)
            }
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 4:
        return (
          <IncentivesPageC4
            handleReturn={() => setCurPage(0)}
            handleNext={(formData, selectedFiles) =>
              handleCurPageCategory(8, incentivesData, formData, selectedFiles)
            }
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 5:
        return (
          <IncentivesPageC5
            handleReturn={() => setCurPage(0)}
            handleNext={(formData, selectedFiles) =>
              handleCurPageCategory(8, incentivesData, formData, selectedFiles)
            }
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 6:
        return (
          <IncentivesPageC6
            handleReturn={() => setCurPage(0)}
            handleNext={(formData, selectedFiles) =>
              handleCurPageCategory(8, incentivesData, formData, selectedFiles)
            }
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 7:
        return (
          <IncentivesPageC7
            handleReturn={() => setCurPage(0)}
            handleNext={(formData, selectedFiles) =>
              handleCurPageCategory(8, incentivesData, formData, selectedFiles)
            }
            applicationId={applicationId}
            incentivesData={incentivesData}
            isEditMode={isEditMode}
          />
        );
      case 8:
        return (
          <IncentivesPage2
            handleReturn={handleReturnToPage}
            applicationId={applicationId}
            incentivesData={incentivesData}
            formData={formData}
            selectedFiles={selectedFiles}
            isEditMode={isEditMode}
            onClose={onClose}
            fetchIncentives={fetchIncentives}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      dialogClassName="custom-research-incentive-modal"
    >
      <div
        style={{ height: "100%", width: "100%" }}
        className="d-flex flex-column"
      >
        {changePage()}
      </div>
    </Modal>
  );
};

const IncentiveItem = ({ data, fetchIncentives }) => {
  const [hidden, setHidden] = useState(false);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const handleCloseIncentiveModal = () => {
    setShowIncentiveModal(false);
  };

  const handleOpenIncentiveModal = (applicationId, editMode = false) => {
    setSelectedApplicationId(applicationId);
    setShowIncentiveModal(true);
    setIsEditMode(editMode);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenDeleteModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    if (data.applications && data.applications[0].category_id) {
      axios({
        method: "get",
        url: `http://localhost:5000/v1/category/main`,
      })
        .then((res) => {
          if (res.data.success) {
            const category = res.data.data.find(
              (category) =>
                category.category_id === data.applications[0].category_id
            );
            setCategoryDescription(
              category ? category.category_description : "Unknown"
            );
          }
        })
        .catch((error) => {
          console.error("Unable to fetch category description", error);
          setCategoryDescription("Unknown");
        });
    }
  }, [data]);

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
        onClick={() =>
          handleOpenIncentiveModal(data.applications[0].application_id)
        }
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
            width: "30%",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.authors}
        </span>
        <span style={{ width: "20%", textAlign: "center" }}>
          {categoryDescription}
        </span>
        <span style={{ width: "10%", textAlign: "right" }}>
          <span
            style={{
              display: "inline-block",
              cursor: "pointer",
              opacity: 1,
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.5)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenIncentiveModal(
                data.applications[0].application_id,
                true
              );
            }}
          >
            <LiaUserEditSolid className="mr-3 h5" />
          </span>

          <span
            style={{
              display: "inline-block",
              cursor: "pointer",
              opacity: 1,
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.5)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteModal(data.applications[0].application_id);
            }}
          >
            <MdDeleteForever className="mr-2 h5" />
          </span>
        </span>
      </div>
      <hr className="m-0" />

      <ResearchIncentiveModal
        show={showIncentiveModal}
        applicationId={selectedApplicationId}
        onClose={handleCloseIncentiveModal}
        isEditMode={isEditMode}
      />

      <DeleteIncentivesModal
        show={showDeleteModal}
        applicationId={selectedApplicationId}
        onClose={handleCloseDeleteModal}
        setShow={setShowDeleteModal}
      />
    </div>
  );
};

const IncentivesPanel = () => {
  const [key, setKey] = useState("All");
  const [incentives, setIncentives] = useState([]);
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);

  const handleCloseIncentiveModal = () => {
    setShowIncentiveModal(false);
  };

  const handleOpenIncentiveModal = () => {
    setShowIncentiveModal(true);
  };

  useEffect(() => {
    if (showIncentiveModal) {
      setKey("All");
    }
  }, [showIncentiveModal]);

  const fetchIncentives = () => {
    axios({
      method: "get",
      url: "http://localhost:5000/v1/incentivesapplication/main",
    })
      .then((res) => {
        if (res.data.success) {
          const formattedData = res.data.data.map((incentives) => {
            return {
              ...incentives,
              authors: incentives.authors
                .map((author) => author.author_name)
                .join(", "),
            };
          });
          setIncentives(formattedData);
        } else {
          message.error("There are no incentive applications.");
        }
      })
      .catch((error) => {
        message.error("There are no incentive applications.");
      });
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  return (
    <div className="pt-3 px-0" style={{ width: "90%" }}>
      <div className="d-flex justify-content-between">
        <h1 className="mb-3" style={{ fontSize: "20px", fontWeight: "900" }}>
          Incentives
        </h1>
      </div>

      <Tabs
        id="controlled-tab-notifications"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <Tab eventKey="All" title="All">
          <TabHeader />
          <div style={{ overflowY: "scroll", height: "60vh" }}>
            {incentives.map((item) => (
              <IncentiveItem key={item.id} data={item} />
            ))}
          </div>
        </Tab>
      </Tabs>

      <ResearchIncentiveModal
        show={showIncentiveModal}
        onClose={handleCloseIncentiveModal}
        fetchIncentives={fetchIncentives}
      />
    </div>
  );
};

const IncentivesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleOpenIncentiveModal = () => setShowModal(true);
  const handleCloseIncentiveModal = () => setShowModal(false);

  const handleIncentiveEvaluation = () => {
    navigate("/incentives-application");
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
        <TopBar isLoggedIn={4} />
      </div>
      <div style={{ height: "85vh", display: "flex" }}>
        <SideNav>
          <ActionsBar value={3} />
        </SideNav>
        <div style={{ width: "80%", display: "flex" }}>
          <IncentivesPanel
            showModal={showModal}
            handleOpenIncentiveModal={handleOpenIncentiveModal}
            handleCloseIncentiveModal={handleCloseIncentiveModal}
          />
        </div>
      </div>
    </div>
  );
};

export default IncentivesPage;
