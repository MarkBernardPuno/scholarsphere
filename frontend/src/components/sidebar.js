import { DownOutlined } from '@ant-design/icons';
import { DatePicker, Dropdown, Menu, message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { clearSelectedCampus, setSelectedCampus } from '../redux/actions/campusActions';
import { clearSelectedCategory, setSelectedCategory } from '../redux/actions/categoryActions';
import {
  clearDepartment,
  removeDepartment,
  setDepartment,
} from '../redux/actions/departmentActions';
import {
  clearPresentationEndDate,
  setPresentationEndDate,
} from '../redux/actions/presentationDateEndActions';
import {
  clearPresentationStartDate,
  setPresentationStartDate,
} from '../redux/actions/presentationDateStartActions';
import {
  clearPresentationLocation,
  removePresentationLocation,
  setPresentationLocation,
} from '../redux/actions/presentationLocationActions';
import {
  clearPublicationLocation,
  removePublicationLocation,
  setPublicationLocation,
} from '../redux/actions/publicationLocationActions';

import './sidebar.css';
const Sidebar2 = ({}) => {
  const [formData, setFormData] = useState({
    department: [],
    category: [],
    presentationLocation: [],
    publicationLocation: [],
    campus: [],
  });
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [presentationLocations, setPresentationLocations] = useState([]);
  const [publicationLocations, setPublicationLocations] = useState([]);
  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedDepartment = useSelector((state) => state.selectedDepartment.departments);
  const presentationLocationRedux = useSelector(
    (state) => state.presentationLocationRedux.presentationLocation,
  );
  const publicationLocationRedux = useSelector(
    (state) => state.publicationLocationRedux.publicationLocation,
  );
  const reduxState = useSelector((state) => state);
  const selectedEndDate = useSelector((state) => state.selectedEndDate.endDate);
  const selectedStartDate = useSelector((state) => state.selectedStartDate.startDate);
  const selectedCategory = useSelector((state) => state.selectedCategory.category);
  const selectedCampus = useSelector((state) => state.selectedCampus.campus);
  useEffect(() => {
    fetchData();
    fetchCategories();
    fetchCampus();
    fetchPresentationLocation();
    fetchPublicationLocation();
  }, []);
  useEffect(() => {
    console.log('Department on redux:', selectedDepartment);
  }, [selectedDepartment]);
  useEffect(() => {
    console.log('Redux State:', reduxState);
    console.log('Presentation Location on redux:', presentationLocationRedux);
  }, [reduxState, presentationLocationRedux]);
  useEffect(() => {
    console.log('Publication Location on redux:', publicationLocationRedux);
  }, [publicationLocationRedux]);
  useEffect(() => {
    console.log('Category on redux:', selectedCategory);
  }, [selectedCategory]);
  useEffect(() => {
    console.log('EndDate on redux:', selectedEndDate);
  }, [selectedEndDate]);
  useEffect(() => {
    console.log('StartDate on redux:', selectedStartDate);
  }, [selectedStartDate]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/v1/departments/main');
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/v1/category/main');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCampus = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/v1/campus/main');
      setCampuses(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPresentationLocation = async () => {
    try {
      const response = await axios.get(
        'http://127.0.0.1:5000/v1/researches/presentation-locations',
      );
      setPresentationLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPublicationLocation = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/v1/researches/publication-locations');
      setPublicationLocations(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDepartmentSelect = (selectedOptions) => {
    const selectedDepartments = selectedOptions.map((option) => option.value);
    setFormData({ ...formData, department: selectedDepartments });
  };

  const handleCategorySelect = (categoryDescription) => {
    setFormData({ ...formData, category: categoryDescription });
  };

  const handleCampusSelect = (campus) => {
    setFormData({ ...formData, campus: campus });
  };

  const handlePresentationLocatioSelect = (selectedPresentationLocation) => {
    const presentationLocations = selectedPresentationLocation.map((option) => option.value);
    setFormData({ ...formData, presentationLocation: presentationLocations });
  };

  const handlePublicationLocationSelect = (selectedPublicationLocation) => {
    const publicationLocations = selectedPublicationLocation.map((option) => option.value);
    setFormData({ ...formData, publicationLocation: publicationLocations });
  };

  const handleChangeEndDate = (date, dateString) => {
    setEndDate(dateString);
    if (startDate && moment(dateString).isBefore(moment(startDate))) {
      message.error('The "To" date cannot be earlier than the "From" date.');
      setEndDate(null); // Optionally reset the end date if it's invalid
    }
  };

  const handleChangeStartDate = (date, dateString) => {
    setStartDate(dateString);
    if (endDate && moment(dateString).isAfter(moment(endDate))) {
      message.error('The "From" date cannot be more recent than the "To" date.');
      setStartDate(null); // Optionally reset the start date if it's invalid
    }
  };

  const handleApply = () => {
    // Handle Department Selection
    const previouslySelectedDepartments = selectedDepartment ? selectedDepartment.split(',') : [];
    const newDepartmentSelection = formData.department;

    const deselectedDepartments = previouslySelectedDepartments.filter(
      (dept) => !newDepartmentSelection.includes(dept),
    );

    const addedDepartments = newDepartmentSelection.filter(
      (dept) => !previouslySelectedDepartments.includes(dept),
    );

    deselectedDepartments.forEach((dept) => {
      dispatch(removeDepartment(dept));
    });

    addedDepartments.forEach((dept) => {
      dispatch(setDepartment(dept));
    });

    // Handle Presentation Location Selection
    const previouslySelectedPresentationLocations = presentationLocationRedux
      ? presentationLocationRedux.split(',')
      : [];
    const newPresentationLocationSelection = formData.presentationLocation;

    const deselectedPresentationLocations = previouslySelectedPresentationLocations.filter(
      (loc) => !newPresentationLocationSelection.includes(loc),
    );

    const addedPresentationLocations = newPresentationLocationSelection.filter(
      (loc) => !previouslySelectedPresentationLocations.includes(loc),
    );

    deselectedPresentationLocations.forEach((loc) => {
      dispatch(removePresentationLocation(loc));
    });

    addedPresentationLocations.forEach((loc) => {
      dispatch(setPresentationLocation(loc));
    });

    // Handle Publication Location Selection
    const previouslySelectedPublicationLocations = publicationLocationRedux
      ? publicationLocationRedux.split(',')
      : [];
    const newPublicationLocationSelection = formData.publicationLocation;

    const deselectedPublicationLocations = previouslySelectedPublicationLocations.filter(
      (loc) => !newPublicationLocationSelection.includes(loc),
    );

    const addedPublicationLocations = newPublicationLocationSelection.filter(
      (loc) => !previouslySelectedPublicationLocations.includes(loc),
    );

    deselectedPublicationLocations.forEach((loc) => {
      dispatch(removePublicationLocation(loc));
    });

    addedPublicationLocations.forEach((loc) => {
      dispatch(setPublicationLocation(loc)); //
    });

    // Other Dispatches
    dispatch(setSelectedCategory(formData.category));
    dispatch(setSelectedCampus(formData.campus));
    dispatch(setPresentationStartDate(startDate));
    dispatch(setPresentationEndDate(endDate));
  };

  const handleClear = () => {
    setFormData({
      department: [],
      category: '',
      presentationLocation: [],
      publicationLocation: [],
      campus: '',
    });
    setEndDate('');
    setStartDate('');
    dispatch(clearPresentationStartDate());
    dispatch(clearDepartment());
    dispatch(clearPresentationLocation());
    dispatch(clearPublicationLocation());
    dispatch(clearSelectedCategory());
    dispatch(clearPresentationEndDate());
    dispatch(clearSelectedCategory());
    dispatch(clearSelectedCampus());
  };

  const categoryMenu = (
    <Menu style={{ maxHeight: '150px', overflowY: 'auto' }}>
      {categories.map((category) => (
        <Menu.Item
          key={category.category_id}
          onClick={() => handleCategorySelect(category.category_description)}
        >
          {category.category_description}
        </Menu.Item>
      ))}
    </Menu>
  );
  const campusMenu = (
    <Menu style={{ maxHeight: '150px', overflowY: 'auto' }}>
      {campuses.map((campus) => (
        <Menu.Item key={campus.camp_id} onClick={() => handleCampusSelect(campus.camp_name)}>
          {campus.camp_name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="sidebar">
      <div style={{ marginLeft: '11px' }}>
        <h1 className="titleFont">Search Filter</h1>
        <h1 className="subtitleFont">Date</h1>
        <h1 className="subtitleFont" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
          From
        </h1>
        <DatePicker
          picker="date"
          name="startDate"
          placeholder="Select Date"
          value={startDate ? moment(startDate, 'YYYY-MM-DD') : null}
          onChange={handleChangeStartDate}
          style={{
            width: 170,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '30px',
            fontSize: '1rem',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '0 8px',
          }}
        />
        <h1 className="subtitleFont" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
          To
        </h1>
        <DatePicker
          picker="date"
          name="endDate"
          placeholder="Select Date"
          value={endDate ? moment(endDate, 'YYYY-MM-DD') : null}
          onChange={handleChangeEndDate}
          style={{
            width: 170,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '30px',
            fontSize: '1rem',
            backgroundColor: 'white',
            color: 'black',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '0 8px',
          }}
        />
        <h1 className="subtitleFont" style={{ paddingTop: '20px' }}>
          Department
        </h1>

        <Select
          isMulti
          name="department"
          options={departments.map((dept) => ({
            value: dept.dept_name,
            label: dept.dept_name,
          }))}
          className="basic-multi-select"
          classNamePrefix="select"
          value={formData.department.map((dept) => ({
            value: dept,
            label: dept,
          }))}
          onChange={handleDepartmentSelect}
          style={{ border: '1px solid black' }}
        />
        <h1
          className="subtitleFont"
          style={{ fontSize: '1.1rem', textAlign: 'left', marginTop: '0.5rem' }}
        >
          Campus
        </h1>
        <Dropdown overlay={campusMenu} trigger={['click']} placement="bottomLeft">
          <Button
            style={{
              minWidth: '195px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              height: 'auto',
              fontSize: '1rem',
              backgroundColor: 'white',
              color: formData.campus ? 'black' : 'lightgrey',
              border: '1px solid black',
              borderRadius: '5px',
              padding: '5px 8px',
              whiteSpace: 'normal',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '1rem',
              }}
            >
              {formData.campus ? formData.campus : 'Campus'}
            </span>
            <DownOutlined />
          </Button>
        </Dropdown>
        <h1
          className="subtitleFont"
          style={{ fontSize: '1.1rem', textAlign: 'left', marginTop: '0.5rem' }}
        >
          Presentation Location
        </h1>
        <Select
          isMulti
          name="presentationLocation"
          options={presentationLocations.map((selectedPresentationLocation) => ({
            value: selectedPresentationLocation.presentationLocation,
            label: selectedPresentationLocation.presentationLocation,
          }))}
          className="basic-multi-select"
          classNamePrefix="select"
          value={formData.presentationLocation.map((selectedPresentationLocation) => ({
            value: selectedPresentationLocation,
            label: selectedPresentationLocation,
          }))}
          onChange={handlePresentationLocatioSelect}
          style={{ border: '1px solid black' }}
        />
        <h1
          className="subtitleFont"
          style={{ fontSize: '1.1rem', textAlign: 'left', marginTop: '0.5rem' }}
        >
          Publication Location
        </h1>
        <Select
          isMulti
          name="publicationLocation"
          options={publicationLocations.map((selectedPublicationLocation) => ({
            value: selectedPublicationLocation.publicationLocation,
            label: selectedPublicationLocation.publicationLocation,
          }))}
          className="basic-multi-select"
          classNamePrefix="select"
          value={formData.publicationLocation.map((selectedPublicationLocation) => ({
            value: selectedPublicationLocation,
            label: selectedPublicationLocation,
          }))}
          onChange={handlePublicationLocationSelect}
          style={{ border: '1px solid black' }}
        />
      </div>
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '4rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <Button
            onClick={handleApply}
            variant="light"
            style={{
              width: '12rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Apply
          </Button>
          <Button
            onClick={handleClear}
            style={{
              marginTop: '3vh',
              width: '12rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            variant="light"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Sidebar2;
