import {
  DeleteOutlined,
  EditOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SearchBar2 from '../../../components/Search-bar';
import Sidebar2 from '../../../components/sidebar';
import TopBar from '../../../components/topbar';
import SearchPagination from '../pagination';
import GenerateReportModal from './GenerateReportModal';
import './SearchAdmin.css';
import SearchDetails from './SearchDetails';

const SearchAdmin = () => {
  const [data, setData] = useState([]);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: 'title',
    direction: 'ascending',
  });
  const [show, setShow] = useState(false);

  const componentPDF = useRef();

  const navigate = useNavigate();

  const query = useSelector((state) => state.searchQuery.query);
  const selectedDepartment = useSelector((state) => state.selectedDepartment.departments);
  const presentationLocationRedux = useSelector(
    (state) => state.presentationLocationRedux.presentationLocation,
  );
  const publicationLocationRedux = useSelector(
    (state) => state.publicationLocationRedux.publicationLocation,
  );
  const selectedEndDate = useSelector((state) => state.selectedEndDate.endDate);
  const selectedStartDate = useSelector((state) => state.selectedStartDate.startDate);
  const selectedCampus = useSelector((state) => state.selectedCampus.campus);

  useEffect(() => {
    fetchData(); // Fetch data initially when component mounts
  }, []);

  useEffect(() => {
    setActivePage(1); // Reset to first page whenever `query` changes
    fetchData();
  }, [
    query,
    selectedDepartment,
    selectedEndDate,
    selectedStartDate,
    presentationLocationRedux,
    publicationLocationRedux,
    selectedCampus,
  ]);

  useEffect(() => {
    // Update start and end indexes for pagination whenever `activePage` changes
    const start = (activePage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setStartIndex(start);
    setEndIndex(end);
  }, [activePage, itemsPerPage]);
  useEffect(() => {
    fetchData();
  }, []);
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
      const fetchedData = response.data.data || [];

      // Sort the fetched data based on the default sort configuration
      const sortedData = sortDataByKey(fetchedData, sortConfig.key, sortConfig.direction);
      setData(sortedData);

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

  const highlightAndTruncateText = (text, query, maxLength) => {
    if (!text || !query) return text;

    const queryIndex = text.toLowerCase().indexOf(query.toLowerCase());

    if (queryIndex === -1) {
      return truncateText(text, maxLength);
    }

    const preQueryText = text.substring(0, queryIndex);
    const queryText = text.substring(queryIndex, queryIndex + query.length);
    const postQueryText = text.substring(queryIndex + query.length);

    const combinedText = preQueryText + queryText + postQueryText;

    if (combinedText.length <= maxLength) {
      return (
        <>
          {preQueryText}
          <span style={{ backgroundColor: 'yellow' }}>{queryText}</span>
          {postQueryText}
        </>
      );
    }

    const truncatedPreQueryText = preQueryText.substring(0, maxLength - queryText.length) + '...';
    const truncatedPostQueryText =
      postQueryText.substring(0, maxLength - preQueryText.length - queryText.length - 3) + '...';

    return (
      <>
        {truncatedPreQueryText}
        <span style={{ backgroundColor: 'yellow' }}>{queryText}</span>
        {truncatedPostQueryText}
      </>
    );
  };

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

  const highlightText = (text, query) => {
    if (!text || !query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ backgroundColor: 'yellow' }}>
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
    setStartIndex((pageNumber - 1) * itemsPerPage);
    setEndIndex(pageNumber * itemsPerPage);
  };

  const handleApplicationClick = (application) => {
    console.log(application.application_id);
    const selectedApplicationId = application.application_id;
    const targetPage = `/search/${selectedApplicationId}`;
    navigate(targetPage);
  };

  const handleDelete = async (applicationId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/v1/incentivesapplication/application_data/${applicationId}`,
      );
      fetchData();
    } catch (error) {
      console.error('Error deleting application:', error);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    // Define date fields to handle date sorting
    const dateFields = ['cited_date', 'publication_date', 'presentation_date'];

    let sortedData;

    if (dateFields.includes(key)) {
      sortedData = sortDate(data, key, direction);
    } else {
      sortedData = sortDataByKey(data, key, direction);
    }

    setData(sortedData);
    setSortConfig({ key, direction });
  };

  const sortDate = (data, key, direction) => {
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);

      if (direction === 'ascending') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return sortedData;
  };

  const sortDataByKey = (data, key, direction) => {
    return [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const columns = [
    'Author/s',
    'Title',
    'Abstract',
    'Institutional Agenda',
    'Department Agenda',
    'Presentation Location',
    'Presentation Date',
    'Publication Date',
    'Citation Date',
    'Department Name',
    'Campus',
  ];

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
          {selectedApplication ? (
            <SearchDetails applicationId={selectedApplication.application_id} />
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
                  <Button style={{ marginRight: '8vh' }} variant="warning" onClick={handleShow}>
                    Generate Report
                  </Button>
                  <GenerateReportModal
                    show={show}
                    handleClose={handleClose}
                    data={currentData}
                    columns={columns}
                  />
                </Col>
              </Row>
              <Row style={{ height: '65vh' }} className="d-flex justify-content-center">
                <Col className="mt-" xs={12}>
                  <Row style={{ marginTop: '2vh' }}>
                    <Col>
                      <SearchBar2 context="admin" width="100%" defaultValue={query} />
                    </Col>
                  </Row>
                  <div ref={componentPDF} style={{ width: '100%' }}>
                    <table
                      className="table table-bordered"
                      style={{
                        height: '5vh',
                        marginTop: '1vh',
                        width: '100%',
                        fontSize: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <thead className="thead-dark">
                        <tr>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '10%', verticalAlign: 'middle' }}
                            onClick={() => sortData('author_names')}
                          >
                            Author/s
                            {sortConfig.key === 'author_names' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'author_names' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '10%', verticalAlign: 'middle' }}
                            onClick={() => sortData('abstract')}
                          >
                            Abstract
                            {sortConfig.key === 'abstract' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'abstract' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center sort-button"
                            style={{ width: '10%', verticalAlign: 'middle' }}
                            onClick={() => sortData('title')}
                          >
                            Title
                            {sortConfig.key === 'title' && sortConfig.direction === 'ascending' && (
                              <SortAscendingOutlined />
                            )}
                            {sortConfig.key === 'title' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '15%', verticalAlign: 'middle' }}
                            onClick={() => sortData('inst_agendas')}
                          >
                            Institutional Agenda
                            {sortConfig.key === 'inst_agendas' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'inst_agendas' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '15%', verticalAlign: 'middle' }}
                            onClick={() => sortData('dept_agendas')}
                          >
                            Departmental Agenda
                            {sortConfig.key === 'dept_agendas' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'dept_agendas' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '11%', verticalAlign: 'middle' }}
                            onClick={() => sortData('presentation_location')}
                          >
                            Presentation Location
                            {sortConfig.key === 'presentation_location' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'presentation_location' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '11%', verticalAlign: 'middle' }}
                            onClick={() => sortData('published_where')}
                          >
                            Publication Location
                            {sortConfig.key === 'published_where' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'published_where' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '8%', verticalAlign: 'middle' }}
                            onClick={() => sortData('cited_date')}
                          >
                            Citation Date
                            {sortConfig.key === 'cited_date' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'cited_date' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '8%', verticalAlign: 'middle' }}
                            onClick={() => sortData('presentation_date')}
                          >
                            Presentation Date
                            {sortConfig.key === 'presentation_date' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'presentation_date' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>

                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '8%', verticalAlign: 'middle' }}
                            onClick={() => sortData('publication_date')}
                          >
                            Publication Date
                            {sortConfig.key === 'publication_date' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'publication_date' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>

                          <th
                            scope="col"
                            className="text-center"
                            style={{ width: '7%', verticalAlign: 'middle' }}
                            onClick={() => sortData('dept_names')}
                          >
                            Department
                            {sortConfig.key === 'dept_names' &&
                              sortConfig.direction === 'ascending' && <SortAscendingOutlined />}
                            {sortConfig.key === 'dept_names' &&
                              sortConfig.direction === 'descending' && <SortDescendingOutlined />}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.map((item, index) => (
                          <tr key={index}>
                            <td style={{ width: '10%' }}>
                              {highlightSearchQueryArray(item.author_names)}
                            </td>
                            <td style={{ width: '20%' }} className="wrap-text">
                              {highlightAndTruncateText(item.abstract, query, 100)}
                            </td>
                            <td style={{ width: '15%' }} className="wrap-text">
                              {highlightAndTruncateText(item.title, query, 100)}
                            </td>
                            <td style={{ width: '15%' }} className="wrap-text">
                              {highlightSearchQueryArray(item.inst_agendas)}
                            </td>
                            <td style={{ width: '10%' }} className="wrap-text">
                              {highlightSearchQueryArray(item.dept_agendas)}
                            </td>
                            <td className="text-center">
                              {highlightAndTruncateText(item.presentation_location, query, 100)}
                            </td>
                            <td className="text-center">
                              {highlightAndTruncateText(item.published_where, query, 100)}
                            </td>
                            <td className="text-center">{formatDate(item.cited_date)}</td>{' '}
                            <td className="text-center">{formatDate(item.presentation_date)}</td>{' '}
                            <td className="text-center">{formatDate(item.publication_date)}</td>{' '}
                            <td className="text-center">
                              {highlightSearchQuery(item.dept_names.join(', '))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

export default SearchAdmin;
