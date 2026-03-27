import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';

function AboutUs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{textAlign: "center"}}>MISSION</h1>
        <p style={{textAlign: "center"}}>
          The RESEARCH AND DEVELOPMENT OFFICE (RDO) of<br/>
          the Technological Institute of the Philippines (TIP) is committed
        </p>
        <CardGroup>
          <Card style={{ backgroundColor: "#f8f9fa", color: "#6c757d", width: "30%", height: "350px", margin: "10px" }}>
            <Card.Img
              variant="top"
              src="https://imageio.forbes.com/specials-images/dam/imageserve/914776002/960x0.jpg?height=474&width=711&fit=bounds"
              style={{  height: "250px" }}
            />
            <Card.Body>
              <Card.Text>
                <p>
                  To provide recent and relevant researchers to its <br/> constituents,attuned to TIP's commitment of providing quality education and
                  service to the community.
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card style={{ backgroundColor: "#f8f9fa", color: "#6c757d", width: "30%", height: "350px", margin: "10px" }}>
            <Card.Img
              variant="top"
              src="https://365financialanalyst.com/wp-content/uploads/2020/11/Defining-a-companys-Vision-Mission-Goals-and-Values-statements-thumb.jpg"
              style={{  height: "250px" }}
            />
            <Card.Body>
              <Card.Text>
                <p>
                  To establish a self-generating and independent core of<br/>
                  Research and Development manpower propelled to serve <br/>
                  the needs of industry and technological education.
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card style={{ backgroundColor: "#f8f9fa", color: "#6c757d", width: "30%", height: "350px", margin: "10px" }}>
            <Card.Img
              variant="top"
              src="https://www.chihealth.com/content/dam/chihealthcom/images/about-us/providersandpatients.jpg/_jcr_content/renditions/cq5dam.web.1440.810.jpeg"
              style={{  height: "250px" }}
            />
            <Card.Body>
              <Card.Text>
                <p>
                  To develop linkages with other research institutions/<br/>
                  organizations that will contribute in raising awareness and<br/>
                  knowledge in basic, pure and / or applied research.
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
        </CardGroup>
        <h1 style={{textAlign: "center", marginTop:"5%"}}>VISION</h1>
        <p style={{textAlign: "center"}}>
          The RESEARCH AND DEVELOPMENT OFFICE (RDO) of<br/>
          the Technological Institute of the Philippines (TIP) envisions a<br/>
          research-oriented institution that appreciates and advocates the value<br/>
          of research as a medium for educational development and transformation.
        </p>
        <h1 style={{ color: "black", textAlign: "center", fontWeight: "bold", marginTop:"5%" }}>About Us</h1>
        <p style={{ color: "black", textAlign: "center" }}>
          ScholarSphere is a cutting-edge web application designed for managing and sharing research<br/>
          theses, developed for academic institutions and researchers. It provides a secure, centralized digital<br/>
          platform for storing, preserving, and disseminating scholarly theses. By offering open access, <br/>
          ScholarSphere enhances the visibility and impact of academic research globally. The platform<br/>
          ensures long-term preservation and supports diverse content types, including datasets and <br/>
          multimedia. Its detailed metadata improves discoverability, while the user-friendly interface<br/>
          simplifies thesis management and sharing. ScholarSphere helps comply with academic standards <br/>
          and integrates with ORCID for accurate attribution. It fosters collaboration among researchers, <br/>
          facilitating knowledge sharing and advancing academic research.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;
