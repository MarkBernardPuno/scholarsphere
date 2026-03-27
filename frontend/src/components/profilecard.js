import {Button, Modal, Image} from 'react-bootstrap';
import { useAuthContext } from '../contexts/auth-context';
import {useState, useEffect} from 'react';

const capitalizeFirstLetter = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};


function ProfileCard() {
  const { user } = useAuthContext();
  const [show, setShow] = useState(false);
  const role ='research admin';
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  useEffect(()=>{
    console.log(user);
  },[]);

  return (
    <>
      <div onClick={handleShow} style={{width:'100%',display:'flex',gap:'30px'}}>
          <Image src={require('.././assets/images.jpg')} roundedCircle height={50}/>
          <div style={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <h1 style={{fontSize:'1em',margin:'0'}}>{capitalizeFirstLetter(user.author_name)}</h1>
              <p style={{fontSize:'.7em',margin:'0'}}>{capitalizeFirstLetter(user.dept)} {capitalizeFirstLetter(user.role)}</p>
          </div>
      </div>
      
      <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Name: {capitalizeFirstLetter(user.author_name)}</p>
        <p>Role: {capitalizeFirstLetter(user.role)}</p>
        <p>Department: {capitalizeFirstLetter(user.dept)}</p>
        <p>Email: {user.email}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {/* <Button variant="primary" onClick={handleClose}>
          Save Changes
        </Button> */}
      </Modal.Footer>
    </Modal>
   </>
  );
}

export default ProfileCard;
