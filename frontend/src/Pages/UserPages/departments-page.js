import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Tab, Tabs } from "react-bootstrap";
import { LiaUserEditSolid } from "react-icons/lia";
import { MdDeleteForever } from "react-icons/md";
import ActionsBar from "../../components/actionsbar";
import {
  CreateDepartmentModal,
  DeleteDepartmentModal,
  ModifyDepartmentModal,
} from "../../components/department-page-modals";
import TopBar from "../../components/topbar";
import { useAuthContext } from "../../contexts/auth-context";
import "./researchers-page.css";
import SideNav from "./side-nav";

const DepartmentsTabHeader = () => {
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
        <span style={{ width: "30%", fontWeight: "Bold", textAlign: "center" }}>
          Department
        </span>
        <span
          style={{ width: "110%", fontWeight: "Bold", textAlign: "center" }}
        >
          Actions
        </span>
      </div>
      <hr style={{ margin: "0" }} />
    </>
  );
};

const DepartmentItem = ({ data, val, trigger, updateDepartmentList }) => {
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

  const [hidden, setHidden] = useState(false);

  return (
    <div style={{ fontSize: "14px" }}>
      <div
        className="d-flex align-items-center w-100 p-3"
        style={
          hidden
            ? { backgroundColor: "rgba(251,197,5,.5)", cursor: "pointer" }
            : { backgroundColor: "#ffffff", cursor: "default" }
        }
        onMouseEnter={() => setHidden(true)}
        onMouseLeave={() => setHidden(false)}
        onClick={handleShowProfile}
      >
        <span style={{ width: "38%", marginLeft: "9%" }}>
          {" "}
          {data.dept_name}{" "}
        </span>
        <span style={{ width: "19%", textAlign: "right" }}>
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
      <ModifyDepartmentModal
        show={showModifyModal}
        data={data}
        onClose={handleCloseModify}
        trigger={trigger}
        val={val}
        setShow={setShowModifyModal}
        updateDepartmentList={updateDepartmentList}
      />

      <DeleteDepartmentModal
        show={showDeleteModal}
        data={data}
        onClose={handleCloseDelete}
        trigger={trigger}
        val={val}
        setShow={setShowDeleteModal}
      />
    </div>
  );
};

const ResearchersPanel = () => {
  const { accessToken } = useAuthContext();

  const [key, setKey] = useState("Departments");
  const [change, setChange] = useState(0);

  const [departmentList, setDepartmentLIst] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const handleShowCreate = () => setShowCreateModal(true);
  const handleCloseCreate = () => setShowCreateModal(false);

  useEffect(() => {
    axios({
      method: "get",
      url: `http://127.0.0.1:5000/v1/departments/main`,
      headers: { Authorization: "Bearer " + accessToken },
    })
      .then((res) => {
        setDepartmentLIst(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    console.log("triggered");
  }, [change]);

  const updateDepartmentList = (deptId, deptName) => {
    setDepartmentLIst((prev) =>
      prev.map((dept) =>
        dept.dept_id === deptId ? { ...dept, dept_name: deptName } : dept
      )
    );
  };

  return (
    <div className="pt-3 px-0" style={{ width: "90%" }}>
      <div className="d-flex justify-content-between">
        <h1 className="mb-3" style={{ fontSize: "20px", fontWeight: "900" }}>
          Departments
        </h1>
        <Button
          className="mb-3"
          variant="warning"
          style={{ fontSize: "12px", fontWeight: "400" }}
          onClick={handleShowCreate}
        >
          New Department +
        </Button>
      </div>

      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <Tab eventKey="Departments" title="Departments">
          <DepartmentsTabHeader />
          <div style={{ overflowY: "scroll", height: "60vh" }}>
            {departmentList.map((item) => (
              <DepartmentItem
                key={item.dept_id}
                data={item}
                val={change}
                trigger={setChange}
                updateDepartmentList={updateDepartmentList}
              />
            ))}
          </div>
        </Tab>
      </Tabs>

      <CreateDepartmentModal
        show={showCreateModal}
        onClose={handleCloseCreate}
        trigger={setChange}
        val={change}
        setShow={setShowCreateModal}
      />
    </div>
  );
};

const DepartmentsPage = () => {
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
          <ActionsBar value={5} />
        </SideNav>
        <div style={{ width: "80%", display: "flex" }}>
          <ResearchersPanel />
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
