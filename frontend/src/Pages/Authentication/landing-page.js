import { Container } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import back from "../../assets/backdesign.png";
import TopBar from '../../components/topbar';

function LandingPage() {
  return (
    <Container fluid style={{ minHeight: "100vh", position: "relative" }}>
      <img
        src={back}
        alt=""
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Row>
          <TopBar isLoggedIn={1}/>
        </Row>

        <Row style={{ minHeight: "calc(100vh - 22vh)", color: 'black', padding: '20px', alignContent:"center"}}>
          <Col style={{ textAlign: 'end', paddingRight:"50px", fontFamily:"kaesei haruonomi" }}>
            <h1 style={{ color: '#FBC505', fontSize: '32px' }}>ScholarSphere</h1>
            <h2 style={{fontWeight:"bold", fontSize:"36px"}}>Elevating TIP's Research Landscape </h2>
            <p style={{ fontSize: '16px' }}>
              Dive into the heart of academic exploration with the Academic<br/>
              Research Unit (ARU) at Technological Institute of the Philippines.<br/>
              Uncover, share, and incentivize groundbreaking research at  ScholarSphere.<br/>
            </p>
          
            <Link to="/login">
              <Button variant="outline-dark" style={{ backgroundColor: '#FBC505', color: 'black', border: 'none', padding: '8px 16px 8px 16px'}}>
                Login or Sign Up
              </Button>
            </Link>
          </Col>
        </Row>
      
      </div>
    </Container>
  );
}

export default LandingPage;