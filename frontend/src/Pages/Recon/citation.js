import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/topbar";
import ProfileCard from "../../components/profilecard";
import {Col, Row} from "react-bootstrap";
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { CDBContainer } from 'cdbreact';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Col, Row } from 'react-bootstrap';
const Citation = () => {

    return (
        <div style={{height:'100vh',width:'100vw',display:'flex',flexDirection:'column'}}>
            <div>
            <TopBar isLoggedIn={2}/>
            </div>
            <div>
               <Col> </Col>
            </div>
        </div>

    );
};

export default Citation;