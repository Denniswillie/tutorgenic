import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import {useState} from 'react';

function iconStyles() {
    return {
        searchIconColor: {
            color: 'grey',
        }
    }
}

export default function Navbar(props) {
    const {user} = props;
    const classes = makeStyles(iconStyles)();
    const [searchVal, setSearchVal] = useState("");

    function goToHome() {
        window.open('/home', '_self');
    }

    function goToApplyTutor() {
        window.open('/apply', '_self');
    }

    function goToTutorDashboard() {
        window.open('/tutorDashboard', '_self');
    }

    function goToAdminDashboard() {
        window.open('/admin', '_self');
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        const temp = searchVal;
        setSearchVal("");
        window.open('/search/' + temp, '_self');
    }

    return <div className="navbar">
        <div className="navbar_left">
            <h2 className="navbar_title">Tutorgenic</h2>
            <div className="navbar_input">
                <SearchIcon className={classes.searchIconColor}/>
                <form onSubmit={handleSearchSubmit}>
                    <input 
                        id="input"
                        style={{outline: "none"}}
                        placeholder="Search subjects or tutors" 
                        autoComplete="off" 
                        type="text" 
                        value={searchVal}
                        onChange={(e) => {
                            setSearchVal(e.target.value);
                        }}/>
                    <input type="submit" style={{display: "none"}} />
                </form>
            </div>
        </div>
        <div className="navbar_right">
            <div className="navbar_option" onClick={goToHome}>
                <p>Home</p>
            </div>
            {(user && user.is_tutor) ? <div className="navbar_option" onClick={goToTutorDashboard}>
                <p>Tutor dashboard</p>
            </div> : <div className="navbar_option" onClick={goToApplyTutor}>
                <p>Become a tutor</p>
            </div>}
            {(user && user.is_admin) && <div className="navbar_option" onClick={goToAdminDashboard}>
                <p>Admin</p>
            </div>}
            <div className="navbar_option" onClick={() => {
                window.open('/auth/logout', '_self');
            }}>
                <p>Logout</p>
            </div>
            <div className="navbar_info navbar_option">
                {user && <img alt="user profile" src = {user.image_url}/>}
                {user && <h4>{user.first_name + " " + user.last_name.slice(0, 1) + "."}</h4>}
            </div>
        </div>
    </div>
}