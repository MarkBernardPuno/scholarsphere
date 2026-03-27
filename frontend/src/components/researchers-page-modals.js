import { Tabs, Tab, Image, Modal, Button, Form, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../contexts/auth-context";
import { IoMdClose } from "react-icons/io";
import { BsPersonFill } from "react-icons/bs";
import { message } from "antd";
const SearchItem = (item) => {
  function format_date(x) {
    const date = new Date(x);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          fontSize: "0.8em",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", width: "95%", alignItems: "center" }}>
          <div style={{ width: "70%" }} className="pl-3">
            <p
              style={{
                fontSize: "0.9em",
                fontWeight: "600",
                overflow: "clip",
                width: "100%",
                height: "20px",
                margin: "0",
              }}
            >
              {item.title}
            </p>
            <p
              style={{
                fontSize: "0.7em",
                fontWeight: "bold",
                overflow: "clip",
                width: "100%",
                margin: "0",
              }}
            >
              {item.authors}
            </p>
          </div>
        </div>
      </div>
      <hr style={{ margin: "0" }} />
    </>
  );
};

const CoAuthorCard = ({ data }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `http://127.0.0.1:5000/v1/users/latest_image/${data.user_id}`,
          responseType: "blob",
        });

        if (response.data) {
          const url = URL.createObjectURL(response.data);
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };

    fetchImage();
  }, [data.user_id]);

  return (
    <div className="d-flex align-items-center my-2">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={data.name}
          style={{
            marginRight: "10px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
          }}
        />
      ) : (
        <BsPersonFill size={32} style={{ marginRight: "10px" }} />
      )}
      <div className="ml-2">
        <p style={{ fontSize: "14px", margin: "0px" }}>{data.name}</p>
        <p
          style={{ fontSize: "10px", margin: "0px" }}
        >{`${data.role} at ${data.department} department`}</p>
      </div>
    </div>
  );
};

export const DeleteResearcherModal = ({
  show,
  data,
  onClose,
  val,
  trigger,
  setShow,
}) => {
  const { accessToken } = useAuthContext();

  const handleDelete = async (e) => {
    e.preventDefault();

    await axios({
      method: "delete",
      url: `http://127.0.0.1:5000/v1/researchers/${data.author_id}/${data.user_id}`,
      headers: { Authorization: "Bearer " + accessToken },
    })
      .then((res) => {
        console.log(res.data);
        if (!res.data.success) {
          message.success("User deleted successfully");
        } else {
          message.error(
            "Cannot delete this user because it is referenced by another record."
          );
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(
          "Cannot delete this user because it is referenced by another record."
        );
      });

    trigger(val + 1);
    setShow(false);
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {`Are you sure you want to delete "${data.name}" account?`}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const ModifyResearcherModal = ({
  show,
  data,
  onClose,
  val,
  trigger,
  setShow,
}) => {
  const { accessToken, departments, roles } = useAuthContext();
  const [data2, setData] = useState({
    author_id: data.author_id,
    user_id: data.user_id,
    name: data.name,
    dept_id: data.dept_id,
    role: data.role,
    email: data.email,
  });

  const [data3, setData3] = useState({
    // total_citations: 0,
    author_id: data.author_id,
    // year_submitted: "",
  });
  const setName = (e) => setData({ ...data2, name: e });
  const setDept = (e) => setData({ ...data2, dept_id: e });
  const setRole = (e) => setData({ ...data2, role: e });
  const setEmail = (e) => setData({ ...data2, email: e });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios({
      method: "put",
      url: `http://127.0.0.1:5000/v1/researchers/${data.author_id}/${data.user_id}`,
      headers: { Authorization: "Bearer " + accessToken },
      data: data2,
    })
      .then((res) => {
        console.log(res.data);
        message.success("Successfully updated researcher.");
      })
      .catch((err) => {
        console.log(err);
        message.error("User was not updated.");
      });

    trigger(val + 1);
    setShow(false);
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className="form-div d-flex justify-content-center align-items-center flex-column">
            <Form.Group
              className="mb-3 position-relative form-group-div"
              controlId="formBasicName"
            >
              <h1
                style={{
                  fontSize: "16px",
                  marginBottom: "8px",
                  fontWeight: "normal",
                }}
              >
                Full Name
              </h1>
              <Form.Control
                type="text"
                placeholder="Full Name"
                value={data2.name}
                onChange={(e) => setName(e.target.value)}
                className="form-control-style"
              />
            </Form.Group>

            <div className="dropdowns-div mb-3 d-flex">
              <div className="flex-fill">
                <h1
                  style={{
                    fontSize: "16px",
                    marginBottom: "8px",
                    fontWeight: "normal",
                  }}
                >
                  Department
                </h1>
                <Form.Select
                  controlId="selectDepartment"
                  value={data2.dept_id}
                  onChange={(e) => {
                    setDept(e.target.value);
                  }}
                  className="select-style"
                  style={{ width: "100%" }}
                >
                  <option>Select Department</option>
                  {departments && departments.length > 0 ? (
                    departments.map((department, index) => (
                      <option key={index} value={department.dept_id}>
                        {department.dept_name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No departments available</option>
                  )}
                </Form.Select>
              </div>

              <div className="flex-fill">
                <h1
                  style={{
                    fontSize: "16px",
                    marginBottom: "8px",
                    fontWeight: "normal",
                  }}
                >
                  Role
                </h1>
                <Form.Select
                  controlId="selectRole"
                  value={data2.role}
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                  className="select-style"
                  style={{ width: "100%" }}
                >
                  <option>Select Role</option>
                  {roles && roles.length > 0 ? (
                    roles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))
                  ) : (
                    <option disabled>No roles available</option>
                  )}
                </Form.Select>
              </div>
            </div>

            <Form.Group
              className="mb-3 position-relative form-group-div"
              controlId="formBasicEmail"
            >
              <h1
                style={{
                  fontSize: "16px",
                  marginBottom: "8px",
                  fontWeight: "normal",
                }}
              >
                Email Address
              </h1>
              <Form.Control
                type="email"
                placeholder="Your email"
                value={data2.email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control-style"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const ShowResearcherModal = ({ show, data, onClose }) => {
  const { accessToken } = useAuthContext();
  const [resultsItems, setResultItems] = useState([]);
  const [coauthors, setCoauthors] = useState([]);
  const [allCitationsData, setAllCitationsData] = useState(null);
  const [data3, setData3] = useState({
    total_citations: 0,
    author_id: data.author_id,
    // year_submitted: "",
  });
  const [data4, setData4] = useState({
    total_citations: 0,
    author_id: data.author_id,
    // year_submitted: "",
  });
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (show) {
      axios({
        method: "get",
        url: `http://127.0.0.1:5000/v1/researchers/${data.user_id}/researches`,
        headers: { Authorization: "Bearer " + accessToken },
      })
        .then((res) => {
          if (res.data.success) {
            setResultItems(res.data.data);
            setCoauthors(res.data.coauthors);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      // Fetch total citations
      // fetchTotalCitations();
      // Fetch citations per year
      // citaionPerYear();
      // Fetch researcher image
      fetchImage();
    }
  }, [show]);

  const fetchTotalCitations = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/v1/incentivesapplication/citations",
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            author_id: data.author_id,
          },
        }
      );
      console.log("Response Data of all citations:", response.data);
      setData3({
        ...data3,
        total_citations: response.data.total_citations,
      });
    } catch (error) {
      console.error("Error fetching citations:", error);
    }
  };

  const fetchImage = async () => {
    try {
      const response = await axios({
        method: "get",
        url: `http://127.0.0.1:5000/v1/users/latest_image/${data.user_id}`,
        responseType: "blob",
      });

      if (response.data) {
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };
  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="researcher-div-modal"
      >
        <div style={{ height: "90vh", width: "100%" }} className="d-flex">
          <div style={{ width: "70%", height: "100%" }}>
            <div
              style={{ height: "25%" }}
              className="p-3 d-flex align-items-center"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={data.name}
                  style={{
                    marginRight: "10px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <BsPersonFill size={70} style={{ marginRight: "10px" }} />
              )}
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: "bolder" }}>
                  {data.name}
                </h1>
                <span
                  style={{ fontSize: "16px" }}
                >{`${data.role} at ${data.department} Department`}</span>
                <br />
              </div>
            </div>

            <div style={{ height: "75%" }} className="px-3">
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  paddingLeft: "2%",
                  paddingBottom: "5px",
                  marginTop: "15px",
                  fontSize: ".7em",
                }}
              >
                <span style={{ fontWeight: "Bold", fontSize: "18px" }}>
                  Researches
                </span>
              </div>

              <hr style={{ margin: "0" }} />

              <div style={{ overflowY: "scroll", height: "80%" }}>
                {resultsItems && resultsItems.length > 0 ? (
                  resultsItems.map((item, index) => SearchItem(item, index))
                ) : (
                  <div>No researches available</div>
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              width: "30%",
              height: "100%",
              borderLeft: "1px solid #E3E1D9",
            }}
            className="d-flex flex-column p-3"
          >
            <IoMdClose
              className="h2 align-self-end"
              style={{ cursor: "pointer" }}
              onClick={onClose}
            />

            {/* <hr className="mt-0 mb-2" /> */}
            <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Co-authors</h2>
            <hr className="mt-0 mb-2" />
            <div style={{ height: "100%", overflowY: "scroll" }}>
              {coauthors && coauthors.length > 0 ? (
                coauthors.map((data, index) => (
                  <CoAuthorCard key={index} data={data} />
                ))
              ) : (
                <div>No co-authors available</div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export const CreateResearcherModal = ({
  show,
  onClose,
  val,
  trigger,
  setShow,
}) => {
  const { departments, roles, signUp } = useAuthContext();
  const [data, setData] = useState({
    name: "",
    dept_id: 0,
    role: "researcher",
    email: "",
    password: "aru_temp_pass",
    password2: "aru_temp_pass",
  });
  const setName = (e) => setData({ ...data, name: e });
  const setDept = (e) => setData({ ...data, dept_id: e });
  const setRole = (e) => setData({ ...data, role: e });
  const setEmail = (e) => setData({ ...data, email: e });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(data);
    if (data.name !== "") {
      if (data.email !== "") {
        if (data.password !== "" || data.password2 !== "") {
          if (data.password == data.password2) {
            if (
              await signUp({
                name: data.name,
                email: data.email,
                password: data.password,
                dept_id: data.dept_id,
                role: data.role,
              })
            ) {
              message.success("Account is succesfully created.");
            }

            setData({
              name: "",
              dept_id: 0,
              role: "",
              email: "",
              password: "aru_temp_pass",
              password2: "aru_temp_pass",
            });

            trigger(val + 1);
            setShow(false);
          } else {
            message.error("Make sure the password is correct!");
          }
        } else {
          message.error("Password is empty!");
        }
      } else {
        message.error("Email is empty!");
      }
    } else {
      message.error("Name is empty!");
    }
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Researcher</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form className="form-div d-flex justify-content-center align-items-center flex-column">
            <Form.Group
              className="mb-3 position-relative form-group-div"
              controlId="formBasicName"
            >
              <h1
                style={{
                  fontSize: "16px",
                  marginBottom: "8px",
                  fontWeight: "normal",
                }}
              >
                Full Name
              </h1>
              <Form.Control
                type="text"
                placeholder="Full Name"
                value={data.name}
                onChange={(e) => setName(e.target.value)}
                className="form-control-style"
              />
            </Form.Group>

            <div className="dropdowns-div mb-3 d-flex">
              <div className="flex-fill">
                <h1
                  style={{
                    fontSize: "16px",
                    marginBottom: "8px",
                    fontWeight: "normal",
                  }}
                >
                  Department
                </h1>
                <Form.Select
                  controlId="selectDepartment"
                  value={data.dept_id}
                  onChange={(e) => {
                    setDept(e.target.value);
                  }}
                  className="select-style"
                  style={{ width: "100%" }}
                >
                  <option> Select Department </option>
                  {departments && departments.length > 0 ? (
                    departments.map((department, index) => (
                      <option key={index} value={department.dept_id}>
                        {department.dept_name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No departments available</option>
                  )}
                </Form.Select>
              </div>

              <div className="flex-fill">
                <h1
                  style={{
                    fontSize: "16px",
                    marginBottom: "8px",
                    fontWeight: "normal",
                  }}
                >
                  Role
                </h1>
                <Form.Select
                  controlId="selectRole"
                  value={data.role}
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                  className="select-style"
                  style={{ width: "100%" }}
                >
                  <option> Select Role </option>
                  {roles && roles.length > 0 ? (
                    roles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))
                  ) : (
                    <option disabled>No roles available</option>
                  )}
                </Form.Select>
              </div>
            </div>

            <Form.Group
              className="mb-3 position-relative form-group-div"
              controlId="formBasicEmail"
            >
              <h1
                style={{
                  fontSize: "16px",
                  marginBottom: "8px",
                  fontWeight: "normal",
                }}
              >
                Email Address
              </h1>
              <Form.Control
                type="email"
                placeholder="Your email"
                value={data.email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control-style"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Create User
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
