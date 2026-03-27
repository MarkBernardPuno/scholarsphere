import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import TopBar from "../components/topbar";
import { useAuthContext } from "../contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
function SignUpForm() {
  const { signUp, departments } = useAuthContext();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    dept_id: 0,
    role: "",
    activated: "False",
  });
  const setName = (e) => setData({ ...data, name: e });
  const setEmail = (e) => setData({ ...data, email: e });
  const setPassword = (e) => setData({ ...data, password: e });
  const setDept = (e) => setData({ ...data, dept_id: e });
  const setRole = (e) => setData({ ...data, role: e });
  const roles = [
    {
      role_id: 1,
      role_name: "Research Admin",
    },
    {
      role_id: 2,
      role_name: "Program Chair",
    },
    {
      role_id: 3,
      role_name: "Researcher",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(data);
    if (
      data.email == "" ||
      data.password == "" ||
      data.dept_id == 0 ||
      data.role == "" ||
      data.name == ""
    ) {
      message.error("Incomplete Form!!");
    } else {
      signUp(data);
      setName("");
      setData({
        email: "",
        password: "",
        dept_id: 0,
        role: "",
        activated: "False",
        name: "",
      });
    }
  };

  return (
    <Form>
      <Form.Group controlId="formBasicName">
        <Form.Label>Author Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="first_name last_name"
          value={data.name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicEmail">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicDepartment">
        <Form.Label>Department</Form.Label>
        <Form.Select
          value={data.dept_id}
          onChange={(e) => setDept(e.target.value)}
        >
          <option>Choose Department</option>
          {departments.map((dept) => (
            <option key={dept.dept_id} value={dept.dept_id}>
              {dept.dept_name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group controlId="formBasicRole">
        <Form.Label>Role</Form.Label>
        <Form.Select
          value={data.role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option>Choose Role</option>
          {roles.map((role) => (
            <option key={role.role_id} value={role.role_name}>
              {role.role_name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button variant="primary" type="submit" onClick={handleSubmit}>
        Sign up
      </Button>
    </Form>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const setEmail = (e) => setData({ ...data, email: e });
  const setPassword = (e) => setData({ ...data, password: e });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.email !== "") {
      if (data.password !== "") {
        login(data);
        setData({
          email: "",
          password: "",
        });
        navigate("/mainSearch");
      } else {
        message.error(
          "Password is empty or not valid (minimum of 8 characters)."
        );
      }
    } else {
      message.error("Email is empty or not valid.");
    }
  };

  return (
    <Form>
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={data.email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={data.password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit" onClick={handleSubmit}>
        Login
      </Button>
    </Form>
  );
}

function LoginPage() {
  const [state, setState] = useState(true);

  return (
    <div className="login-page h-100 w-100">
      <TopBar isLoggedIn={1} />
      <div className="login-form-panel">
        {state ? (
          <div>
            <LoginForm />
            <Button variant="link" onClick={() => setState(false)}>
              Don't have an account?
            </Button>
          </div>
        ) : (
          <div>
            <SignUpForm />
            <Button variant="link" onClick={() => setState(true)}>
              Already have an account?
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
