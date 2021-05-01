import {useEffect, useState} from 'react';
import axios from 'axios';

export default function Home(props) {
    const {setDisplayNavbar, setUser} = props;
    const [sessions, setSessions] = useState([]);
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
                    axios.get('/course/getRegisteredCourses')
                        .then(res => res.data)
                        .catch(err => console.log(err))
                        .then(res => {
                            if (res.success) {
                                setSessions(res.result)
                            } else {
                                alert('Failed to get sessions');
                            }
                        })
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
                }}>Sessions</li>
            </ul>
        </div>
        <div className="content">
            <div className="box">
                <a name="upcomingSessions"></a>
                <div className="box_top">
                    <h2>Sessions</h2>
                </div>
                <div className="box_bottom">
                    {sessions.length === 0 && "Your sessions will appear here."}
                    {sessions.map(session => {
                        return <div className="box" style={{width: "40%"}}>
                            <div className="box_top">
                                <h2>{session.title}</h2>
                            </div>
                            <div className="box_bottom">
                                <u style={{cursor: "pointer"}} onClick={() => {
                                    window.open('/room/' + session.course_id, '_self');
                                }}>Click this link to open the meeting</u>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    </div>
}