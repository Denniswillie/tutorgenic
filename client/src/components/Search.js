import {useEffect} from 'react';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

export default function Search(props) {
    const {setDisplayNavbar, setUser} = props;
    setDisplayNavbar(true);
    useEffect(() => {
        const ac = new AbortController();

        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(res => {
                if (res.isLoggedIn) {
                    const user = res.user;
                    console.log(user);
                    setUser(user);
                } else {
                    window.open('/', '_self');
                }
            })

        return () => {
            ac.abort();
        }
    }, [setUser]);
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
                        variant="outlined"/>
                </div>
            </div>
            <div style={{flex: "0.75", width: '95%', overflow: "auto", paddingTop: "10px"}}>
                <div className="box" style={{margin: "auto", width: "70%"}}>
                    <div className="box_top">
                        <h3>Dennis Willie</h3>
                    </div>
                    <div className="box_bottom" style={{display: 'flex'}}>
                        <div style={{flex: '0.1'}}>
                            <img
                                style={{width: "90px", height: "90px", borderRadius: "50%"}} 
                                src="https://www.pngitem.com/pimgs/m/150-1503945_transparent-user-png-default-user-image-png-png.png" 
                            />
                        </div>
                        <div style={{flex: '0.9', paddingLeft: "1em"}}>
                            Bachelor of Science, Computing, Dundalk Institute of Technology <br /><br />
                            <b>This is the headline</b> <br />
                            am a second year medical student with over 7 years of experience tutoring university courses and the MCAT. I scored in the 97th percentile for the Chem/Phys and 99th percentile for the Bio/Biochem sections of the MCAT (2017). I have als
                            <br /><br />
                            <Button variant="outlined" color="secondary">
                                view
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}