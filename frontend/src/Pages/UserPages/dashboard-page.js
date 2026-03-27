import TopBar from "../../components/topbar";
import ActionsBar from "../../components/actionsbar";
import { Tabs, Tab, Image, Modal, Button, Form, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../../contexts/auth-context";


const DashboardPage = () => {
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

      <div style={{ height: "85vh", display: "flex" }}>
        Hello
      </div>
    </div>
  );
};

export default DashboardPage;
