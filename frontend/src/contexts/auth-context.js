import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { message } from "antd";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const roles = ["Researcher", "Program Chair", "Research Admin"];
  const [authResearches, setAuthResearches] = useState([]);
  const [campuses, setCampuses] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchCampus();
  }, []);

  const fetchUserResearches = async (idx) => {
    const x = await axios({
      method: "get",
      url: `http://localhost:5000/v1/author/researches/${idx}`,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((res) => {
        setAuthResearches(res.data.data);
        console.log(res.data.data);
      })
      .catch((error) => {
        console.log(error.message);
        message.error("Cannot fetch user researches.");
      });

    return x;
  };

  const fetchAllUsers = async () => {
    return await axios({
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
      });
  };

  const fetchCampus = async () => {
    await axios({
      method: "get",
      url: "http://localhost:5000/v1/campus/main",
    })
      .then((res) => {
        if (res.data.success) {
          setCampuses(res.data.data);
        } else {
          message.error("Unable to fetch Campus");
        }
      })
      .catch((error) => {
        message.error("Unable to fetch Campus");
      });
  };

  const login = async (requestData) => {
    return await axios({
      method: "post",
      url: "http://localhost:5000/v1/auth/login",
      data: requestData,
    })
      .then((res) => {
        if (res.data.success) {
          setAccessToken(res.data.access_token);
          setUser(res.data.user);
          console.log(user);
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  const signUp = async (requestdata) => {
    try {
      const res = await axios({
        method: "post",
        url: "http://localhost:5000/v1/auth/signup",
        data: requestdata,
      });
      console.log(res.data);
      if (res.data.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        login,
        logout,
        signUp,
        departments,
        fetchDepartments,
        campuses,
        fetchCampus,
        fetchAllUsers,
        roles,
        fetchDepartments,
        fetchUserResearches,
        authResearches,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
