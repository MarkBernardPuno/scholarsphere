import {Tabs, Tab, Image} from 'react-bootstrap';
import {useState} from 'react';

const PanelHeader = () => {
    return (
      <>
        <div style={{display:'flex',width:'100%',paddingLeft:'5%',marginTop:'15px',fontSize:'.7em'}}>
          <span style={{width:'70%',fontWeight:'Bold'}}>Title:</span>
          <span style={{width:'10%',fontWeight:'Bold',textAlign:'center'}}>Cited By:</span>
          <span style={{width:'20%',fontWeight:'Bold',textAlign:'center'}}>Year:</span>
        </div>
        <hr style={{margin:'0'}}/>
      </>
    );
  }

const NotificationPanel = ({value}) => {
    return (
        <div>
            <PanelHeader/>
            <Image src={require('.././assets/images.jpg')} roundedCircle height={50}/>
            <h1>{value}</h1>
            {}
        </div>
    );
}

const ResearchersCard = () => {
    return (
        <div>
            <h1>Hello</h1>
        </div>
    );
}

function checkType(x,value) {
    switch(x) {
        case 'notifications':
            return(
                <>
                    <NotificationPanel tab={value} />
                </>
            );
        case 'researchers':
            return (
                <>
                    <ResearchersCard/>
                    <h1>{value}</h1>
                </>
            );
    }
}

const TopTabs = ({ values, type }) => {
    const [key, setKey] = useState(values[0]);

    return (
        <Tabs
            id="controlled-tab-example"
            activeKey={key}
            onSelect={(k) => setKey(k)}
        >
            {values.map((item)=>(
                <Tab eventKey={item} title={item}>
                    {checkType(type,item)}
                </Tab>)
            )}
        </Tabs>
    );
};

export default TopTabs;