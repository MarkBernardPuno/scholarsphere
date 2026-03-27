import React, { useEffect, useRef } from 'react';
import { Image } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import rightIcon from '../assets/cross.png';
import leftIcon from '../assets/glass.png';
import { clearSearchQuery, setSearchQuery } from '../redux/actions/searchActions';
import {
  setResearcherSearch,
  clearResearcherSearch,
} from '../redux/actions/searchResercherActions';
function SearchBar2({ localQuery, width = '100%', context }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const query = useSelector((state) => state.searchQuery.query);
  const researcherSearch = useSelector((state) => state.searchResearcher.researcher);

  const navigate = useNavigate();

  // Set initial localQuery state to defaultValue from Redux
  const defaultValue = query || '';

  useEffect(() => {
    console.log('Current value of query from redux:', query);
  }, [query]);
  useEffect(() => {
    console.log('Current value of searchResearcher from redux:', researcherSearch);
  }, [researcherSearch]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (context === 'researcher') {
      dispatch(setSearchQuery(inputRef.current.value));
      navigate('/search');
    } else if (context === 'admin') {
      dispatch(setSearchQuery(inputRef.current.value));
      navigate('/crud');
    } else if (context === 'researcher-profile') {
      dispatch(setResearcherSearch(inputRef.current.value));
      // navigate("/profile/researchers");
    }
  };
  const handleClear = () => {
    dispatch(clearSearchQuery());
    dispatch(clearResearcherSearch());
    inputRef.current.value = '';
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSearchIconClick = (event) => {
    event.preventDefault();

    if (context === 'researcher') {
      dispatch(setSearchQuery(inputRef.current.value));
      navigate('/search');
    } else if (context === 'admin') {
      dispatch(setSearchQuery(inputRef.current.value));
      navigate('/crud');
    } else if (context === 'researcher-profile')
      dispatch(setResearcherSearch(inputRef.current.value));
    // navigate("/profile/researchers");
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Image
          src={leftIcon}
          onClick={handleSearchIconClick}
          alt="Search Icon"
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            height: '20px',
            cursor: 'pointer',
          }}
        />
        <Form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Form.Control
            ref={inputRef}
            size="sm"
            type="text"
            placeholder="Enter your search query here..."
            onChange={() => {}}
            defaultValue={defaultValue}
            style={{
              height: '5vh',
              width: '100%',
              fontSize: '0.8em',
              paddingLeft: '40px',
              paddingRight: '40px',
              borderRadius: '20px',
            }}
          />
        </Form>
        <img
          onClick={handleClear}
          src={rightIcon}
          alt="Clear Icon"
          style={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            height: '20px',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar2;
