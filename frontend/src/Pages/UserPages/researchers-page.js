import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Image, Modal, Tab, Table, Tabs } from "react-bootstrap";
import { IoMdClose } from "react-icons/io";
import { LiaUserEditSolid } from "react-icons/lia";
import { MdDeleteForever } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import SearchBarSelect from "../../components/Search-bar-select";
import ActionsBar from "../../components/actionsbar";
import { BsPersonFill } from "react-icons/bs";
import {
  CreateResearcherModal,
  DeleteResearcherModal,
  ModifyResearcherModal,
  ShowResearcherModal,
} from "../../components/researchers-page-modals";
import TopBar from "../../components/topbar";
import { useAuthContext } from "../../contexts/auth-context";
import "./researchers-page.css";
import SideNav from "./side-nav";

const TabHeader = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          paddingLeft: "5%",
          marginTop: "15px",
          fontSize: ".7em",
        }}
      >
        <span style={{ width: "20%", marginLeft: "2%", fontWeight: "Bold" }}>
          Name
        </span>
        <span style={{ width: "10%", fontWeight: "Bold", textAlign: "center" }}>
          Department
        </span>
        <span style={{ width: "15%", fontWeight: "Bold", textAlign: "center" }}>
          Role
        </span>
        <span style={{ width: "25%", fontWeight: "Bold", textAlign: "center" }}>
          Email Address
        </span>
        <span style={{ width: "15%", fontWeight: "Bold", textAlign: "center" }}>
          Account Status
        </span>
        <span style={{ width: "15%", fontWeight: "Bold", textAlign: "center" }}>
          Actions
        </span>
      </div>
      <hr style={{ margin: "0" }} />
    </>
  );
};

const SearchItem = (item, index) => {
  function format_date(x) {
    const date = new Date(x);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          fontSize: "0.8em",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", width: "95%", alignItems: "center" }}>
          <div style={{ width: "70%" }} className="pl-3">
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
            <p
              style={{
                fontSize: "0.8em",
                overflow: "hidden",
                overflow: "clip",
                width: "100%",
                margin: "0",
                color: "#2D2D2D",
              }}
            >
              {item.publication}
            </p>
          </div>
          <div style={{ width: "10%", textAlign: "center" }}>
            {item.citations}
          </div>
          <div style={{ width: "20%", textAlign: "center" }}>
            {format_date(item.year)}
          </div>
        </div>
      </div>
      <hr style={{ margin: "0" }} />
    </>
  );
};

const CoAuthorCard = ({ data }) => {
  return (
    <div className="d-flex align-items-center my-2">
      <Image
        src={require("../../assets/images.jpg")}
        roundedCircle
        height={32}
      />
      <div className="ml-2">
        <p style={{ fontSize: "14px", margin: "0px" }}>{data.name}</p>
        <p
          style={{ fontSize: "10px", margin: "0px" }}
        >{`${data.role} at ${data.department} department`}</p>
      </div>
    </div>
  );
};

const fetchProfileImage = async (userId) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:5000/v1/users/latest_image/${userId}`,
      {
        responseType: "blob",
      }
    );
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("No profile image.");
    return null;
  }
};

const ResearcherItem = ({ data, val, trigger }) => {
  const [showModifyModal, setShowModifyModal] = useState(false);
  const handleShowModify = (e) => {
    e.stopPropagation();
    setShowModifyModal(true);
  };
  const handleCloseModify = () => setShowModifyModal(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };
  const handleCloseDelete = () => setShowDeleteModal(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const handleShowProfile = () => setShowProfileModal(true);
  const handleCloseProfile = () => setShowProfileModal(false);

  const {
    data: profileImageUrl,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profileImage", data.user_id],
    queryFn: () => fetchProfileImage(data.user_id),
    refetchOnWindowFocus: true,
    // refetchInterval: 1000,
  });

  return (
    <div style={{ fontSize: "14px" }}>
      <div
        className="d-flex align-items-center w-100 p-3"
        style={{
          backgroundColor: "#ffffff",
          cursor: "default",
        }}
        onClick={handleShowProfile}
      >
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            roundedCircle
            height={32}
            width={32}
            alt="Profile"
            style={{ marginRight: "10px" }}
          />
        ) : (
          <BsPersonFill size={32} style={{ marginRight: "10px" }} />
        )}
        <span style={{ width: "20%", marginLeft: "2%" }}> {data.name} </span>
        <span style={{ width: "14%", textAlign: "center" }}>
          {" "}
          {data.department}{" "}
        </span>
        <span style={{ width: "15%", textAlign: "center" }}> {data.role} </span>
        <span style={{ width: "25%", textAlign: "center" }}>
          {" "}
          {data.email}{" "}
        </span>
        <span style={{ width: "15%", textAlign: "right" }}>
          {" "}
          {data.activated ? "Created" : "Activated"}{" "}
        </span>
        <span style={{ width: "15%", textAlign: "right" }}>
          <LiaUserEditSolid
            className="mr-3 h5"
            onClick={(e) => handleShowModify(e)}
          />
          <MdDeleteForever
            className="h5"
            onClick={(e) => handleShowDelete(e)}
          />
        </span>
      </div>

      <hr className="m-0" />

      <ModifyResearcherModal
        show={showModifyModal}
        data={data}
        onClose={handleCloseModify}
        trigger={trigger}
        val={val}
        setShow={setShowModifyModal}
      />

      <DeleteResearcherModal
        show={showDeleteModal}
        data={data}
        onClose={handleCloseDelete}
        trigger={trigger}
        val={val}
        setShow={setShowDeleteModal}
      />

      <ShowResearcherModal
        show={showProfileModal}
        data={data}
        onClose={handleCloseProfile}
        setShow={setShowProfileModal}
      />
    </div>
  );
};

const ResearchersPanel = () => {
  const { accessToken } = useAuthContext();

  const [key, setKey] = useState("Researchers");
  const [change, setChange] = useState(0);

  const [researchers, setResearchers] = useState([]);
  const [program_chairs, setProgramChairs] = useState([]);
  const [research_admins, setResearchAdmins] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const handleShowCreate = () => setShowCreateModal(true);
  const handleCloseCreate = () => setShowCreateModal(false);
  const researcherSearch = useSelector(
    (state) => state.searchResearcher.researcher
  );
  const selectedDepartment = useSelector(
    (state) => state.selectedDepartment.departments
  );

  useEffect(() => {
    axios({
      method: "get",
      url: "http://127.0.0.1:5000/v1/researchers/",
      headers: { Authorization: "Bearer " + accessToken },
      params: { q: selectedDepartment },
    })
      .then((res) => {
        console.log("Researchers Response", res.data.data);
        setResearchers(res.data.data.researchers || []);
        setProgramChairs(res.data.data.program_chairs || []);
        setResearchAdmins(res.data.data.research_admin || []);
      })
      .catch((err) => {
        console.log(err);
      });

    console.log("triggered");
  }, [change, researcherSearch, selectedDepartment]);

  return (
    <div className="pt-3 px-0" style={{ width: "90%" }}>
      <div className="d-flex justify-content-between">
        <h1 className="mb-3" style={{ fontSize: "20px", fontWeight: "900" }}>
          Researchers
        </h1>
        <Button
          className="mb-3"
          variant="warning"
          style={{ fontSize: "12px", fontWeight: "400" }}
          onClick={handleShowCreate}
        >
          New User +
        </Button>
      </div>
      <SearchBarSelect></SearchBarSelect>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <Tab eventKey="Researchers" title="Researchers">
          <TabHeader />
          <div style={{ overflowY: "scroll", height: "60vh" }}>
            {researchers.length > 0 ? (
              researchers.map((item) => (
                <ResearcherItem
                  key={item.user_id}
                  data={item}
                  val={change}
                  trigger={setChange}
                />
              ))
            ) : (
              <p>No researchers available</p>
            )}
          </div>
        </Tab>
        <Tab eventKey="Program Chairs" title="Program Chairs">
          <TabHeader />
          <div style={{ overflowY: "scroll", height: "60vh" }}>
            {program_chairs.length > 0 ? (
              program_chairs.map((item) => (
                <ResearcherItem
                  key={item.user_id}
                  data={item}
                  val={change}
                  trigger={setChange}
                />
              ))
            ) : (
              <p>No researchers available</p>
            )}
          </div>
        </Tab>
        <Tab eventKey="Research Admin" title="Research Admin">
          <TabHeader />
          <div style={{ overflowY: "scroll", height: "60vh" }}>
            {research_admins.length > 0 ? (
              research_admins.map((item) => (
                <ResearcherItem
                  key={item.user_id}
                  data={item}
                  val={change}
                  trigger={setChange}
                />
              ))
            ) : (
              <p>No researchers available</p>
            )}
          </div>
        </Tab>
      </Tabs>

      <CreateResearcherModal
        show={showCreateModal}
        onClose={handleCloseCreate}
        trigger={setChange}
        val={change}
        setShow={setShowCreateModal}
      />
    </div>
  );
};

const ResearchersPage = () => {
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
          <ActionsBar value={4} />
        </SideNav>
        <div style={{ width: "80%", dispflay: "flex" }}>
          <ResearchersPanel />
        </div>
      </div>
    </div>
  );
};

export default ResearchersPage;
