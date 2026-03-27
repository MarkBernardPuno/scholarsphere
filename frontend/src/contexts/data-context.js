import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./auth-context";
import { message } from "antd";
const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { accessToken } = useAuthContext();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    user_id: "",
    camp_id: "",
    evaluated_by: "",
    is_agenda_aligned: "",
    is_agenda_aligned_remarks: "",
    is_title: "",
    is_title_remarks: "",
    is_problem1: "",
    is_problem1_remarks: "",
    is_problem2: "",
    is_problem2_remarks: "",
    is_significance1: "",
    is_significance1_remarks: "",
    is_significance2: "",
    is_significance2_remarks: "",
    is_significance3: "",
    is_significance3_remarks: "",
    is_significance4: "",
    is_significance4_remarks: "",
    is_ethics_criteria1: "",
    is_ethics_criteria1_remarks: "",
    is_ethics_criteria2a: "",
    is_ethics_criteria2a_remarks: "",
    is_ethics_criteria2b: "",
    is_ethics_criteria2b_remarks: "",
    is_ethics_criteria3a: "",
    is_ethics_criteria3a_remarks: "",
    is_ethics_criteria3b: "",
    is_ethics_criteria3b_remarks: "",
    is_ethics_criteria4: "",
    is_ethics_criteria4_remarks: "",
    is_ethics_criteria5: "",
    is_ethics_criteria5_remarks: "",
    status_id: "",
    status_remarks: "",
    authors: [],
    departments: [],
    keywords: [],
    students: [],
    deptagendas: [],
    instagendas: [],
  });

  const updateFormData = (newData) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      ...newData,
    }));
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      abstract: "",
      user_id: "",
      camp_id: "",
      evaluated_by: "",
      is_agenda_aligned: "",
      is_agenda_aligned_remarks: "",
      is_title: "",
      is_title_remarks: "",
      is_problem1: "",
      is_problem1_remarks: "",
      is_problem2: "",
      is_problem2_remarks: "",
      is_significance1: "",
      is_significance1_remarks: "",
      is_significance2: "",
      is_significance2_remarks: "",
      is_significance3: "",
      is_significance3_remarks: "",
      is_significance4: "",
      is_significance4_remarks: "",
      is_ethics_criteria1: "",
      is_ethics_criteria1_remarks: "",
      is_ethics_criteria2a: "",
      is_ethics_criteria2a_remarks: "",
      is_ethics_criteria2b: "",
      is_ethics_criteria2b_remarks: "",
      is_ethics_criteria3a: "",
      is_ethics_criteria3a_remarks: "",
      is_ethics_criteria3b: "",
      is_ethics_criteria3b_remarks: "",
      is_ethics_criteria4: "",
      is_ethics_criteria4_remarks: "",
      is_ethics_criteria5: "",
      is_ethics_criteria5_remarks: "",
      status_id: "",
      status_remarks: "",
      authors: [],
      departments: [],
      keywords: [],
      students: [],
      deptagendas: [],
      instagendas: [],
    });
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchAllUsers = async () => {
    await axios({
      method: "get",
      url: "http://localhost:5000/v1/users/main",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        message.error("Unable to fetch Users");
        console.log(error);
      });
  };

  const fetchDepartments = async () => {
    await axios({
      method: "get",
      url: "http://localhost:5000/v1/departments/main",
    })
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.data);
        } else {
          message.error("Unable to fetch Departments");
        }
      })
      .catch((error) => {
        message.error("Unable to fetch Departments");
        console.log(error);
      });
  };

  const fetchCategories = async () => {
    await axios({
      method: "get",
      url: "http://localhost:5000/v1/category/main",
    })
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data);
        } else {
          message.error("Unable to fetch Categories");
        }
      })
      .catch((error) => {
        message.error("Unable to fetch Categories");
        console.log(error);
      });
  };

  const fetchStatus = async () => {
    await axios({
      method: "get",
      url: "http://localhost:5000/v1/status/main",
    })
      .then((res) => {
        if (res.data.success) {
          setStatus(res.data.data);
        } else {
          message.error("Unable to fetch Status");
        }
      })
      .catch((error) => {
        message.error("Unable to fetch Status");
        console.log(error);
      });
  };

  return (
    <DataContext.Provider
      value={{
        departments,
        categories,
        status,
        fetchAllUsers,
        formData,
        updateFormData,
        resetFormData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  return useContext(DataContext);
};
