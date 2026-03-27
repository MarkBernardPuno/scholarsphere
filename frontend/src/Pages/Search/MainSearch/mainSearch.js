import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SearchBar2 from '../../../components/Search-bar';
import TopBar from '../../../components/topbar';
import backgroundImage from '../../../assets/10.png';
import AboutUs from '../../../components/About';
import CustomFooter from '../../../components/CustomFooTer';
import image10 from '../../../assets/image10.png';
import { useAuthContext } from '../../../contexts/auth-context';

const backgroundImages = [image10];

const MostCitedCard = ({ title, citations }) => {
  return (
    <Col md={2} className="text-start">
      <h2 style={{ fontSize: '12px', textAlign: 'center' }}>
        <a href="/research/1" style={{ color: 'inherit', textDecoration: 'underline' }}>
          {title}
        </a>
      </h2>
      <p style={{ fontSize: '12px', textAlign: 'center' }}>Citations: {citations}</p>
    </Col>
  );
};

const MainSearch = () => {
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const dispatch = useDispatch();
  const query = useSelector((state) => state.searchQuery.query);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: '0px',
          left: '0px',
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          backgroundImage: `url(${backgroundImages[currentBackgroundIndex]})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          transition: 'background-image 1s ease-in-out',
        }}
      ></div>
      <div>
        <Row>
          <TopBar isLoggedIn={2} />
        </Row>
        <Row className="justify-content-center" style={{ marginTop: '10%' }}>
          <h1
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: 'kaisei harunoumi',
              color: '#FBC505',
            }}
          >
            ScholarSphere
          </h1>
          <p style={{ fontSize: '20px', textAlign: 'center', color: 'black' }}>
            Explore the Academic Research Unit's Research Database
          </p>
          <SearchBar2 width="65%" context="researcher" />
          <p
            style={{
              textAlign: 'center',
              fontFamily: 'kaisei harunoumi',
              fontSize: '12px',
              color: 'black',
            }}
          >
            Refine your search using keyword queries per column and Boolean operators. Enclose
            phrases in double quotes for exact matches.
            <br />
            Use AND to narrow. OR to broaden. and NOT to exclude terms.{' '}
            <span
              onClick={() => navigate('/search')}
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                color: 'blue',
              }}
            >
              Advanced Search
            </span>
          </p>
        </Row>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <CustomFooter />
      </div>
    </div>
  );
};

export default MainSearch;
