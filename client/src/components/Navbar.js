import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';

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

    function goToHome() {
        window.open('/home', '_self');
    }

    function goToSessions() {
        window.open('/sessions', '_self');
    }

    function goToSavedTutors() {
        window.open('/savedTutors', '_self');
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

    return <div className="navbar">
        <div className="navbar_left">
            <h2 className="navbar_title">Tutorgenic</h2>
            <div className="navbar_input">
                <SearchIcon className={classes.searchIconColor}/>
                <input placeholder="Search subjects or tutors" autoComplete="off" type="text"/>
            </div>
        </div>
        <div className="navbar_right">
            <div className="navbar_option" onClick={goToHome}>
                <p>Home</p>
            </div>
            <div className="navbar_option" onClick={goToSessions}>
                <p>Sessions</p>
            </div>
            <div className="navbar_option" onClick={goToSavedTutors}>
                <p>Saved tutors</p>
            </div>
            {(user && user.is_tutor) ? <div className="navbar_option" onClick={goToTutorDashboard}>
                <p>Tutor dashboard</p>
            </div> : <div className="navbar_option" onClick={goToApplyTutor}>
                <p>Become a tutor</p>
            </div>}
            {(user && user.is_admin) && <div className="navbar_option" onClick={goToAdminDashboard}>
                <p>Admin</p>
            </div>}
            <div className="navbar_info navbar_option">
                <img alt="user profile" src = "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"/>
                <h4>Dennis W.</h4>
            </div>
        </div>
    </div>
}