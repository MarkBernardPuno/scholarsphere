import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SearchBar2 from '../../../components/Search-bar';
import Sidebar2 from '../../../components/sidebar';
import TopBar from '../../../components/topbar';
import SearchDetails from '../Admin/SearchDetails';
import SearchPagination from '../pagination';
import './SearchResearcher.css';
import { format } from 'date-fns';

const SearchResearcher = () => {
  const [data, setData] = useState([]);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(itemsPerPage);
  const navigate = useNavigate();
  const componentPDF = useRef();
  const initialRender = useRef(true);

  const query = useSelector((state) => state.searchQuery.query);
  const selectedDepartment = useSelector((state) => state.selectedDepartment.departments);

  const selectedCampus = useSelector((state) => state.selectedCampus.campus);

  const presentationLocationRedux = useSelector(
    (state) => state.presentationLocationRedux.presentationLocation,
  );
  const publicationLocationRedux = useSelector(
    (state) => state.publicationLocationRedux.publicationLocation,
  );
  const selectedEndDate = useSelector((state) => state.selectedEndDate.endDate);
  const selectedStartDate = useSelector((state) => state.selectedStartDate.startDate);

  useEffect(() => {
    fetchData(); // Fetch data initially when component mounts
  }, []);

  useEffect(() => {
    if (!initialRender.current) {
      fetchData(); // Fetch data whenever dependencies change
    } else {
      initialRender.current = false;
    }
  }, [
    query,
    selectedDepartment,
    selectedEndDate,
    selectedStartDate,
    presentationLocationRedux,
    selectedEndDate,
    publicationLocationRedux,
    selectedCampus,
  ]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/v1/researches/main', {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          q: query,
          department: selectedDepartment,
          endDate: selectedEndDate,
          startDate: selectedStartDate,
          presentation: presentationLocationRedux,
          publication: publicationLocationRedux,
          camp_name: selectedCampus,
        },
      });
      console.log('Response Data:', response.data);
      setData(response.data.data);

      // Calculate start and end indexes for pagination
      const start = (activePage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setStartIndex(start);
      setEndIndex(end);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error('Server Response:', error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.error('No Response:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error Message:', error.message);
      }
    }
  };

  const currentData = data.slice(startIndex, endIndex);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const highlightSearchQuery = (text) => {
    if (typeof text !== 'string' || !query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, index) => {
      if (query && part.toLowerCase() === query.toLowerCase()) {
        return (
          <span key={index} style={{ fontWeight: 'bold', backgroundColor: 'yellow' }}>
            {part}
          </span>
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  };
  const highlightSearchQueryArray = (texts) => {
    if (!Array.isArray(texts) || !query) return texts;

    return texts.map((text, index) => {
      if (typeof text !== 'string') return text;

      const parts = text.split(new RegExp(`(${query})`, 'gi'));

      return (
        <span key={index}>
          {parts.map((part, partIndex) => {
            if (query && part.toLowerCase() === query.toLowerCase()) {
              return (
                <span key={partIndex} style={{ fontWeight: 'bold', backgroundColor: 'yellow' }}>
                  {part}
                </span>
              );
            } else {
              return <span key={partIndex}>{part}</span>;
            }
          })}
        </span>
      );
    });
  };

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
    setStartIndex((pageNumber - 1) * itemsPerPage);
    setEndIndex(pageNumber * itemsPerPage);
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const formattedDate = format(date, 'MMMM d, yyyy');
    return formattedDate;
  };
  return (
    <Container fluid style={{ overflow: 'hidden' }}>
      <Row style={{ height: '15vh' }}>
        <TopBar isLoggedIn={2} />
      </Row>
      <Row style={{ height: '85vh' }}>
        <Col sm={2} style={{ backgroundColor: '#FBC505' }}>
          <Sidebar2 />
        </Col>
        <Col sm={10} style={{ overflowY: 'auto' }}>
          {selectedResearch ? (
            <SearchDetails researchId={selectedResearch.research_id} />
          ) : (
            <>
              <Row style={{ height: '10vh' }} className="mt-3 align-items-center">
                <Col xs={8}>
                  <h1 style={{ color: '#FBC505', fontSize: '40px' }}>ScholarSphere</h1>
                  <h3 style={{ paddingTop: '0px', fontSize: '16px' }}>
                    Explore the Academic Research Unit's Research Database
                  </h3>
                </Col>
                <Col xs={4} className="text-end">
                  <Button
                    onClick={() => navigate('/crud')}
                    className="border-0 px-3"
                    variant="warning"
                    style={{
                      marginRight: '90px',
                    }}
                  >
                    Admin
                  </Button>
                </Col>
              </Row>
              <Row style={{ height: '65vh' }} className="d-flex justify-content-center">
                <Col className="mt-" xs={12}>
                  <Row style={{ marginTop: '2vh' }}>
                    <Col>
                      <SearchBar2 width="100%" context="researcher" defaultValue={query} />
                      <div
                        style={{
                          fontFamily: 'kaisei harunoumi',
                          marginLeft: '2rem',
                          marginTop: '1rem',
                        }}
                      >
                        {data.length} Results
                      </div>
                      <div ref={componentPDF}></div>
                      {currentData.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            fontFamily: 'kaisei harunoumi',
                            marginTop: '1rem',
                            marginLeft: '4.5rem',
                          }}
                        >
                          <h1 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                            {highlightSearchQuery(item.title)}
                          </h1>
                          <h2
                            style={{
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              textDecoration: 'underline',
                            }}
                          >
                            {highlightSearchQueryArray(item.author_names)}
                          </h2>
                          <h3 style={{ fontSize: '0.8rem' }}>
                            {highlightSearchQuery(item.camp_name)}
                          </h3>
                          <h3 style={{ fontSize: '0.8rem' }}>
                            {highlightSearchQuery(item.published_where)}
                          </h3>
                          <h3 style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
                            {item.cited_date && <p>Citation Date: {formatDate(item.cited_date)}</p>}
                            {item.publication_date && (
                              <p>Publication Date: {formatDate(item.publication_date)}</p>
                            )}
                            {item.presentation_date && (
                              <p>Presentation Date: {formatDate(item.presentation_date)}</p>
                            )}

                            {highlightSearchQuery(item.dept_names.join(', '))}
                          </h3>

                          <h3 style={{ fontSize: '0.8rem' }}>
                            {highlightSearchQuery(item.presentation_location)}
                          </h3>
                          <p style={{ fontSize: '0.8rem', marginLeft: '2rem' }}>
                            <h3
                              style={{
                                fontFamily: 'kaisei harunoumi',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                              }}
                            >
                              Abstract
                            </h3>
                            {highlightSearchQuery(item.abstract)}
                          </p>

                          <p style={{ fontSize: '0.8rem', marginLeft: '2rem' }}>
                            <h3
                              style={{
                                fontFamily: 'kaisei harunoumi',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                              }}
                            >
                              Institutional Agenda
                            </h3>
                            {highlightSearchQueryArray(item.inst_agendas)}
                          </p>
                          <p style={{ fontSize: '0.8rem', marginLeft: '2rem' }}>
                            <h3
                              style={{
                                fontFamily: 'kaisei harunoumi',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                              }}
                            >
                              Departmental Agenda
                            </h3>
                            {highlightSearchQueryArray(item.dept_agendas)}
                          </p>
                        </div>
                      ))}
                    </Col>
                  </Row>
                  {data.length > 0 && (
                    <div className="d-flex justify-content-center mt-3">
                      <SearchPagination
                        activePage={activePage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SearchResearcher;
