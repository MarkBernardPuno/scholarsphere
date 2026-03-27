import { Tabs, Tab, Image, Modal, Button, Form, Table } from "react-bootstrap";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuthContext } from '../../contexts/auth-context';

const EvaluationModal = ({show, data, onClose}) => {
    const { accessToken } = useAuthContext();

    return (<>
    <Modal
        show={show}
        onHide={onClose}
        dialogClassName="researcher-div-modal"
    >
        
    </Modal>
    </>);
};

export default EvaluationModal;