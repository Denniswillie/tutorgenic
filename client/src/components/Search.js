import {useEffect, useState} from 'react';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

export default function Search(props) {
    const {setDisplayNavbar, setUser, searchValue} = props;
    const [searchVal, setSearchVal] = useState("");
    const [results, setResults] = useState([]);
    setDisplayNavbar(true);
    useEffect(() => {
        const ac = new AbortController();

        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(res => {
                if (res.isLoggedIn) {
                    const user = res.user;
                    setUser(user);
                    if (searchValue) {
                        setSearchVal(searchValue);
                        const formData = new FormData();
                        formData.set('search_value', searchValue);
                        axios({
                            method: 'post',
                            url: '/tutor/search',
                            data: formData,
                            headers: {'Content-Type': 'multipart/form-data'}
                        })
                        .then(res => res.data)
                        .catch(err => console.log(err))
                        .then(res => {
                            if (res.success) {
                                setResults(res.result);
                            } else {
                                alert('Failed to get result');
                            }
                        })
                    }
                } else {
                    window.open('/', '_self');
                }
            })

        return () => {
            ac.abort();
        }
    }, [setUser]);

    function handleSearchSubmit() {
        const formData = new FormData();
        formData.set('search_value', searchVal);
        axios({
            method: 'post',
            url: '/tutor/search',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                setResults(res.result);
            } else {
                alert('Failed to get result');
            }
        })
    }

    return <div className="wrapper">
        <div className="content" style={{flex: "1"}}>
            <div className="box" style={{flex: "0.2"}}>
                <div className="box_top" style={{textAlign: "center"}}>
                    <h2 style={{margin: "auto"}}>Search</h2>
                </div>
                <div className="box_bottom" style={{textAlign: "center"}}>
                    <TextField 
                        id="outlined-basic" 
                        label="Search subjects or tutors" 
                        style={{width: "50%", margin: "auto"}}
                        variant="outlined"
                        value={searchVal}
                        onChange={(event) => {
                            setSearchVal(event.target.value);
                        }}/>
                    <Button style={{height: "56px", marginLeft: "1em"}} variant="outlined" color="secondary" onClick={() => {
                        handleSearchSubmit();
                    }}>
                        Search
                    </Button>
                </div>
            </div>
            <div style={{flex: "0.75", width: '95%', overflow: "auto", paddingTop: "10px"}}>
                {results.map(result => {
                    return <div className="box" style={{margin: "auto", width: "70%"}}>
                        <div className="box_top">
                            <h3>{result.first_name + " " + result.last_name.slice(0, 1) + "."}</h3>
                        </div>
                        <div className="box_bottom" style={{display: 'flex'}}>
                            <div style={{flex: '0.1'}}>
                                <img
                                    style={{width: "90px", height: "90px", borderRadius: "50%"}} 
                                    src={result.image_url}
                                />
                            </div>
                            <div style={{flex: '0.9', paddingLeft: "1em"}}>
                                {result.educations.map(education => {
                                    return <div>
                                        {education.degree + ", " + education.school}<br />
                                    </div>
                                })}
                                <br />
                                <b>{result.headline}</b> <br />
                                {result.description}
                                <br /><br />
                                <Button variant="outlined" color="secondary" onClick={() => {
                                    window.open('/tutor/' + result._id, '_self');
                                }}>
                                    view
                                </Button>
                            </div>
                        </div>
                    </div> 
                })}
            </div>
        </div>
    </div>
}