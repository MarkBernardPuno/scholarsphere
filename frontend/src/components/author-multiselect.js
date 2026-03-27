import React,{useEffect,useState} from 'react';
import Select from 'react-select';
import axios from 'axios';

const AuthorMultiSelect = ({name,value,onChange}) => {
    const [options,setOptions] = useState([]);

    useEffect(()=>{
        axios
        .get("http://localhost:5000/v1/author/main")
        .then((response) => {
            setOptions(response.data.data.map(item => ({
                value: item.author_id,
                label: `${item.author_name} (${item.department})` 
              }))
            );
        })
        .catch((error) => {
            console.error("Error fetching authors:", error);
        });
    },[])

    return (
        <Select
            isMulti
            name={name}
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
            value={value}
            onChange={onChange}
            required
        />
    );
}

export default AuthorMultiSelect;