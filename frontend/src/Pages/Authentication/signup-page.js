import React, { useEffect, useState } from "react";
import { Container, Row, Col, Dropdown, Button, Form } from "react-bootstrap";
import Foot from "../../components/CustomFooTer";
import emailImage from "../../assets/Group.png";
import passwordImage from "../../assets/Group(1).png";
import TopBar from "../../components/topbar";
import { useAuthContext } from "../../contexts/auth-context";
import "./signupStyle.css";
import { useNavigate } from "react-router-dom";


function SignupPage() {
  const navigate = useNavigate();
  const { departments, roles, signUp, campuses } = useAuthContext();
  const [data, setData] = useState({
    name: "",
    dept_id: 0,
    role: "",
    camp_id: 0,
    email: "",
    password: "",
    password2: "",
  });
  const setName = (e) => setData({ ...data, name: e });
  const setDept = (e) => setData({ ...data, dept_id: e });
  const setRole = (e) => setData({ ...data, role: e });
  const setCampuses = (e) => setData({ ...data, camp_id: e});
  const setEmail = (e) => setData({ ...data, email: e });
  const setPassword = (e) => setData({ ...data, password: e });
  const setPassword2 = (e) => setData({ ...data, password2: e });

  const [validEmail, setValidEmail] = useState("");
  const [validPassword, setValidPassword] = useState("");
  const [validPassword2, setValidPassword2] = useState("");
  const [validName, setValidName] = useState("");
  const [validDept, setValidDept] = useState("");
  const [validRole, setValidRole] = useState("");
  const [validCampus, setValidCampus] = useState("");

  const [emailStyle,setEmailStyle] = useState({display:'none',fontSize:'12px',color:'red', textAlign:'left', marginBottom:'0px'})
  const [passwordStyle,setPasswordStyle] = useState({display:'none',fontSize:'12px',color:'red', textAlign:'left', marginBottom:'0px'})
  const [nameStyle,setNameStyle] = useState({display:'none',fontSize:'12px',color:'red', textAlign:'left', marginBottom:'0px'})
  const [deptStyle,setDeptStyle] = useState({display:'none',fontSize:'12px',color:'red', textAlign:'left', marginBottom:'0px'})
  const [roleStyle,setRoleStyle] = useState({display:'none',fontSize:'12px',color:'red', textAlign:'left', marginBottom:'0px'})
  const [campusStyle,setCampusStyle] = useState({display:'none',fontSize:'12px',color:'red', textAlign:'left', marginBottom:'0px'})
  const [password2Style,setPassword2Style] = useState({display:'none',fontSize:'12px',color:'red', textAlign:'left', marginBottom:'0px'})

  const [emailBorder,setEmailBorder] = useState({
    width: "100%",
    paddingRight: "40px",
    paddingLeft: "30px",
    borderColor:'#ced4da'
  })
  const [passwordBorder,setPasswordBorder] = useState({
    width: "100%",
    paddingRight: "40px",
    paddingLeft: "30px",
    borderColor:'#ced4da'
  });
  const [password2Border,setPassword2Border] = useState({
    width: "100%",
    paddingRight: "40px",
    paddingLeft: "30px",
    borderColor:'#ced4da'
  });
  const [nameBorder,setNameBorder] = useState({borderColor:'#ced4da'});
  const [deptBorder,setDeptBorder] = useState({borderColor:'#ced4da', width:'100%'});
  const [roleBorder,setRoleBorder] = useState({borderColor:'#ced4da', width:'100%'});
  const [campusBorder,setCampusBorder] = useState({borderColor:'#ced4da', width:'100%'});

  
  function validateName(name) {
    if (name !== "") {
      setNameStyle({ ...nameStyle, display:'none'});
      setNameBorder({...nameBorder, borderColor:'#ced4da'})
      setValidName('');
    } else {
      setNameStyle({ ...nameStyle, display:'block'});
      setNameBorder({...nameBorder, borderColor:'red'})
      setValidName('Please type a user name.');
    }
  }

  function validateCampus(campus) {
    if (campus !== 0) {
      setCampusStyle({ ...campusStyle, display:'none'});
      setCampusBorder({...campusBorder, borderColor:'#ced4da'})
      setValidCampus('');
    } else {
      setCampusStyle({ ...campusStyle, display:'block'});
      setCampusBorder({...campusBorder, borderColor:'red'})
      setValidCampus('Please select campus.');
    }
  }

  function validateDept(dept) {
    if (dept !== 0) {
      setDeptStyle({ ...deptStyle, display:'none'});
      setDeptBorder({...deptBorder, borderColor:'#ced4da'})
      setValidDept('');
    } else {
      setDeptStyle({ ...deptStyle, display:'block'});
      setDeptBorder({...deptBorder, borderColor:'red'})
      setValidDept('Please select department.');
    }
  }

  function validateRole(role) {
    if (role !== "") {
      setRoleStyle({ ...roleStyle, display:'none'});
      setRoleBorder({...roleBorder, borderColor:'#ced4da'})
      setValidRole('');
    } else {
      setRoleStyle({ ...roleStyle, display:'block'});
      setRoleBorder({...roleBorder, borderColor:'red'})
      setValidRole('Please select role.');
    }
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "") {
      if (emailRegex.test(email)) {
        console.log('valid');
        setEmailStyle({ ...emailStyle, display:'none'});
        setEmailBorder({...emailBorder, borderColor:'#ced4da'})
        setValidEmail('');
        return true;
      } else {
        setEmailStyle({ ...emailStyle, display:'block'});
        setEmailBorder({...emailBorder, borderColor:'red'})
        setValidEmail('Invalid email format! Please ensure email is valid.');
        return false;
      }
    } else {
      setEmailStyle({ ...emailStyle, display:'block'});
      setEmailBorder({...emailBorder, borderColor:'red'})
      setValidEmail('Email is Empty! Please provide an email.');
      return false;
    }
  }

  function validatePassword(password, password2) {
    const errors = [];

    if (!/(?=.*[a-z])/.test(password)) {errors.push("- At least one lowercase letter");}
    if (!/(?=.*[A-Z])/.test(password)) {errors.push("- At least one uppercase letter");}
    if (!/(?=.*\d)/.test(password)) {errors.push("- At least one digit");}
    if (!/(?=.*[@$!%*?&])/.test(password)) {errors.push("- At least one special character (@$!%*?&)");}
    if (password.length < 8) {errors.push("- Minimum 8 characters in length");}
  
    if (errors.length > 0) {
      setPasswordStyle({ ...passwordStyle, display:'block'});
      setPasswordBorder({...passwordBorder, borderColor:'red'})
      setValidPassword("Password must contain:\n" + errors.join("\n"));
      
      if (password !== password2) {
        setPasswordStyle({ ...passwordStyle, display:'block'});
        setPasswordBorder({...passwordBorder, borderColor:'red'});
        setPassword2Style({ ...password2Style, display:'block'});
        setPassword2Border({...password2Border, borderColor:'red'});
        setValidPassword2("Password confirmation does not match!");
      }
      return false;

    } else {

      if (password === password2) {
        setValidPassword("");
        setValidPassword2("");
        setPasswordStyle({ ...passwordStyle, display:'none'});
        setPasswordBorder({...passwordBorder, borderColor:'#ced4da'});
        setPassword2Style({ ...password2Style, display:'none'});
        setPassword2Border({...password2Border, borderColor:'#ced4da'});
        return true;
      } else {
        setValidPassword("");
        setPasswordStyle({ ...passwordStyle, display:'block'});
        setPasswordBorder({...passwordBorder, borderColor:'red'});
        setPassword2Style({ ...password2Style, display:'block'});
        setPassword2Border({...password2Border, borderColor:'red'});
        setValidPassword2("Password confirmation does not match!");
        return false;
      }

    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    const x = validateEmail(data.email);
    const y = validatePassword(data.password, data.password2);
    const name = validateName(data.name);
    const dept = validateDept(data.dept_id);
    const role = validateRole(data.role);
    const campus = validateCampus(data.camp_id);

    console.log(data);

    if (x && y) {
      const signUpSuccess = await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
        dept_id: data.dept_id,
        camp_id: data.camp_id,
        role: data.role,
      });

      if (signUpSuccess) {
        navigate("/login");
      } 

      setData({
        name: "",
        dept_id: 0,
        role: "",
        campus: 0,
        email: "",
        password: "",
        password2: "",
      });
    }
  };

  return (
    <div className="whole-panel">
      <TopBar isLoggedIn={1} />
      <Container fluid className="m-0 p-0 flex-grow-1">
        <Row className="main-panel">
          <Col className="left-panel d-flex justify-content-center align-items-center">
            <div className="left-panel-div">
              <div className="left-panel-div-2">
                <h1>
                  No research without <span>action</span>, no
                  <br />
                  action without <span>research</span>.
                </h1>
                <p> -Kurt Lewin</p>
              </div>
            </div>
          </Col>

          <Col className="d-flex justify-content-center align-items-center">
            <Form className="form-div d-flex justify-content-center align-items-center flex-column w-75">
              <h1> Sign Up </h1>
              <Form.Group
                className="mb-3 position-relative form-group-div"
                controlId="formBasicName"
              >
                <Form.Control
                  type="text"
                  placeholder="Full Name"
                  value={data.name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control-style"
                  style = {nameBorder}
                />
                <p style={nameStyle}>{validName}</p>
              </Form.Group>
              

              <div className="dropdowns-div mb-3 d-flex">
                <div>
                  <Form.Select
                    controlId="selectDepartment"
                    value={data.dept_id}
                    onChange={(e) => {
                      setDept(e.target.value);
                    }}
                    className="select-style"
                    style={deptBorder}
                  >
                    <option> Select Department </option>
                    {departments.map((department, index) => (
                      <option key={index} value={department.dept_id}>
                        {" "}
                        {department.dept_name}{" "}
                      </option>
                    ))}
                  </Form.Select>
                  <p style={deptStyle}>{validDept}</p>
                </div>

                <div>
                  <Form.Select
                    controlId="selectRole"
                    value={data.role}
                    onChange={(e) => {
                      setRole(e.target.value);
                    }}
                    className="select-style"
                    style={roleBorder}
                  >
                    <option> Select Role </option>
                    {roles.map((role, index) => (
                      <option key={index} value={role}>
                        {" "}
                        {role}{" "}
                      </option>
                    ))}
                  </Form.Select>
                  <p style={roleStyle}>{validRole}</p>
                </div>
              </div>

              <Form.Group
                className="mb-3 position-relative form-group-div"
                controlId="formCampus"
              >
                <Form.Select
                  controlId="selectCampus"
                  value={data.camp_id}
                  onChange={(e) => {
                    setCampuses(e.target.value);
                  }}
                  className="campus-style"
                  style={campusBorder}
                >
                  <option> Select Campus </option>
                  {campuses.map((campus, index) => (
                    <option key={index} value={campus.camp_id}>
                      {" "}
                      {campus.camp_name}{" "}
                    </option>
                  ))}
                </Form.Select>
                <p style={campusStyle}>{validCampus}</p>
              </Form.Group>

              <Form.Group
                className="mb-3 position-relative form-group-div"
                controlId="formBasicEmail"
              >
                <Form.Control
                  type="email"
                  placeholder="Your email"
                  value={data.email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control-style"
                  style={emailBorder}
                />
                <p style={emailStyle}>{validEmail}</p>
              </Form.Group>

              <Form.Group
                className="mb-3 position-relative form-group-div"
                controlId="formBasicPassword1"
              >
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={data.password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control-style"
                  style={passwordBorder}
                />
                <img
                  src={passwordImage}
                  alt="icon"
                  className="form-control-img"
                  style={{ width: "4%", height: "40%" }}
                />
                <p style={passwordStyle}>{validPassword}</p>
              </Form.Group>

              <Form.Group
                className="mb-3 position-relative form-group-div"
                controlId="formBasicPassword2"
              >
                <Form.Control
                  type="password"
                  placeholder="Repeat Password"
                  value={data.password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="form-control-style"
                  style={password2Border}
                />
                <p style={password2Style}>{validPassword2}</p>
              </Form.Group>

              <Button
                className="submit-button"
                variant="primary"
                onClick={handleSubmit}
              >
                {" "}
                Sign Up{" "}
              </Button>
              <div className="bottom-link-div">
                <p>
                  {" "}
                  Already have an account? <a href="/login"> Log In </a>{" "}
                </p>
              </div>
            </Form>
          </Col>
        </Row>

        <Row>
          <Foot style={{ height: "10vh"}} />
        </Row>
      </Container>
    </div>
  );
}

export default SignupPage;
