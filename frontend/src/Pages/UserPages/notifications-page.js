import TopBar from '../../components/topbar';
import ActionsBar from '../../components/actionsbar';
import { Tabs, Tab, Image, Modal, Button, Form, Table } from "react-bootstrap";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuthContext } from '../../contexts/auth-context';
import SideNav from './side-nav';


const NotificationItem = ({data, pov, type}) => {
  const NotifTemplate = ({children}) => {
    const [hidden, setHidden] = useState(false);
    return (
      <>
        <div 
          className='d-flex align-items-center'
          style={hidden ? {backgroundColor:'rgba(251,197,5,.5)',cursor:'pointer'} : {backgroundColor:'#ffffff', cursor:'default'}}
          onMouseEnter={()=>setHidden(true)}
          onMouseLeave={()=>setHidden(false)}
        >
          <Image
            src={require("../../assets/images.jpg")}
            roundedCircle
            height={36}
            className="flex-shrink-1 mr-3"
          />
          <div className="d-flex justify-content-between align-items-center w-100" style={{height:'60px'}}>
            {children}
            <span style={{fontSize:"14px"}} className="mr-3">{data.time}</span>
          </div>
        </div>
        <hr style={{margin:'0'}}/>
      </>
    );
  }

  switch(pov) {
    case 'researcher':
      switch(type) {
        case 'application':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>You</span> submitted a new application.</p>
            </NotifTemplate>
          );
        case 'program_chair_evaluation':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>{data.name} (Program Chair)</span> evaluated your application.</p>
            </NotifTemplate>
          );
        case 'research_admin_evaluation':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>{data.name} (Research Admin)</span> evaluated your application.</p>
            </NotifTemplate>
          );
      }
      
    case 'program_chair':
      switch(type) {
        case 'application':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>{data.name}</span> submitted a new application.</p>
            </NotifTemplate>
          );
        case 'program_chair_evaluation':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>You</span> evaluated {data.name}'s application.</p>
            </NotifTemplate>
          );
        case 'research_admin_evaluation':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>{data.name} (Research Admin)</span> evaluated {data.name}'s application.</p>
            </NotifTemplate>
          );
      }

    case 'research_admin':
      switch(type) {
        case 'application':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>{data.name}, faculty of {data.department}</span> submitted a new application.</p>
            </NotifTemplate>
          );
        case 'program_chair_evaluation':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>{data.name}, program chair of {data.department}</span> evaluated {data.name}'s application.</p>
            </NotifTemplate>
          );
        case 'research_admin_evaluation':
          return (
            <NotifTemplate>
              <p style={{fontSize:"14px",margin:'0'}}><span style={{fontWeight:'600'}}>You</span> evaluated {data.name}'s ({data.department}) application.</p>
            </NotifTemplate>
          );
      }
  }
}

const NotificationsPanel = () => {
  const {user} = useAuthContext();
  const [key, setKey] = useState("All");

  return (
    <div className="pt-3 px-0" style={{ width: "90%" }}>
      <div className="d-flex justify-content-between">
        <h1 className="mb-3" style={{ fontSize: "20px", fontWeight: "900" }}>
          Notifications
        </h1>
      </div>

      <Tabs
        id="controlled-tab-notifications"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <Tab eventKey="All" title="All">
          <div style={{ overflowY: "scroll", height: "60vh" }}>
            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='researcher' type='application'/>
            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='researcher' type='program_chair_evaluation'/>
            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='researcher' type='research_admin_evaluation'/>

            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='program_chair' type='application'/>
            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='program_chair' type='program_chair_evaluation'/>
            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='program_chair' type='research_admin_evaluation'/>

            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='research_admin' type='application'/>
            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='research_admin' type='program_chair_evaluation'/>
            <NotificationItem data={{name:"Carlo",time:"2 hrs ago"}} pov='research_admin' type='research_admin_evaluation'/>
          </div>
        </Tab>
        <Tab eventKey="Applications" title="Applications">
          <div style={{ overflowY: "scroll", height: "60vh" }}>
          </div>
        </Tab>
        <Tab eventKey="Evaluations" title="Evaluations">
          <div style={{ overflowY: "scroll", height: "60vh" }}>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

const NotificationPage = () => {
    return(
    <div style={{height:'100vh',width:'100vw',display:'flex',flexDirection:'column'}}>
        <div>
          <TopBar isLoggedIn={2}/>
        </div>
        <div style={{height:'85vh',display:'flex'}}>
          <SideNav>
            <ActionsBar value={2}/>
          </SideNav>
          <div style={{width:'80%',display:'flex'}}>
            <NotificationsPanel />
          </div>
        </div>
    </div>
    );
  };
  
export default NotificationPage;