import {useEffect} from 'react';
import axios from 'axios';

export default function Home(props) {
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
        <div className="sidebar">
            <ul>
                <li onClick={() => {
                    window.location.href = "#upcomingSessions";
                }}>Upcoming sessions</li>
                <li onClick={() => {
                    window.location.href = "#pastSessions";
                }}>Past sessions</li>
                <li onClick={() => {
                    window.location.href = "#savedTutors";
                }}>Saved tutors</li>
            </ul>
        </div>
        <div className="content">
            <div className="box">
                <a name="upcomingSessions"></a>
                <div className="box_top">
                    <h2>Upcoming sessions</h2>
                </div>
                <div className="box_bottom">
                    
                </div>
            </div>
            <div className="box">
                <a name="pastSessions"></a>
                <div className="box_top">
                    <h2>Past sessions</h2>
                </div>
                <div className="box_bottom">

                </div>
            </div>
            <div className="box">
                <a name="savedTutors"></a>
                <div className="box_top">
                    <h2>Saved tutors</h2>
                </div>
                <div className="box_bottom">

                </div>
            </div>
        </div>
    </div>
}