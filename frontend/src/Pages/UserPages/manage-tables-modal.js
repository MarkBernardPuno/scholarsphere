import { Tabs, Tab, Image, Modal, Button, Form, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../../contexts/auth-context";
import './researchers-page.css';


const SideNav = ({style}) => {
    return (
        <div>
            <span>Hello</span>
        </div>
    );
}


const TableView = () => {
    return (
    <>
    </>
    );
}


const ManageTablesModal = ({show}) => {
    const { accessToken } = useAuthContext();
    const [resultItems, setResultItems] = useState([]);

    useEffect(()=>{
        axios({
            method: "get",
            url: `http://127.0.0.1:5000/v1/researchers/${data.user_id}/researches`,
            headers: {Authorization: "Bearer " + accessToken},
        })
        .then((res) => {
            if (res.data.success) {
            setResultItems(res.data.data);
            }
        }).catch((err) =>{console.log(err)});
        },[]);
  

    return(
    <>
      <Modal show={show} onHide={onClose} dialogClassName='researcher-div-modal'>
        <Modal.Header closeButton>
          <Modal.Title>Manage Tables</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            <div>
                <SideNav/>
                <TableView/>
            </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Back
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    );
}

export default ManageTablesModal;