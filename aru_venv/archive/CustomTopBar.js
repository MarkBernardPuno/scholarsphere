import {Image} from 'react-bootstrap';
import { useNavigate } from "react-router-dom";


function RightPanel({isLoggedIn}) {
  const navigate = useNavigate();
  
  if (isLoggedIn==1) {
    return (<></>);
  } else if (isLoggedIn==2) {
    return(
      <div className='d-flex align-items-center' style={{right:'0px',gap:'30px'}}>
        <button onClick={()=>navigate('/incentives-application')} className="border-0 px-3" style={{backgroundColor:'#FBC505',fontSize:'12px',fontWeight:'bolder',borderRadius:'15px',height:'40px'}}>Apply for Incentive</button>
        <Image onClick={()=>navigate('/profile/researches')} src={require('../../assets/user.png')} roundedCircle height={30}/>
        <Image onClick={()=>navigate('logout')} src={require('../../assets/logout.png')} roundedCircle height={30}/>
      </div>
    );
  } else if (isLoggedIn==3) {
    return(
      <div className='d-flex align-items-center' style={{right:'0px',gap:'30px'}}>
        <Image onClick={()=>navigate('/profile/researches')} src={require('../../assets/user.png')} roundedCircle height={50}/>
      </div>
    );
  }
}

function TopBar({data, isLoggedIn}) {
  return (
    <div className='m-0 text-white px-5 d-flex align-items-center justify-content-between' style={{backgroundColor:'#2D2D2D',height:'15vh'}}>
      <div href="/" className='m-0 d-flex align-items-center' style={{gap:'30px'}}>
        <img src={require('../../assets/logo.png')} alt='tip logo' style={{height:'67px',width:'98px'}}/>
        <div href="/" className='d-flex flex-column justify-content-center'>
            <h1 style={{fontWeight:'200',fontSize:'16px'}}>Academic Research Unit</h1>
            <h2 style={{fontWeight:'100',fontSize:'12px'}}>Technological Institute of the Philippines</h2>
        </div>
      </div>
      <RightPanel isLoggedIn={isLoggedIn}/>
    </div>
  );
}

export default TopBar;




