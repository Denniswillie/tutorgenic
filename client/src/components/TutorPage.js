import axios from 'axios';
import {useEffect, useRef, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        width: 200,
        marginTop: "1em",
        color: "white"
    }
}));

export default function TutorPage(props) {
    const classes = useStyles();
    const addScheduleRef = useRef();
    const {setDisplayNavbar, setUser, tutorId} = props;
    const [schedules, setSchedules] = useState([]);
    const [daynumbers, setDaynumbers] = useState([]);
    const [dayMemo, setDayMemo] = useState(new Date());
    const [registeredSession, setRegisteredSession] = useState();

    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

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
                    const dates = [];
                    const temp = [];
                    const curr_day = new Date();
                    for (var i = 0; i < 7; i++) {
                        if (i === curr_day.getDay()) {
                            dates.push(curr_day.getFullYear() + "-" + (curr_day.getMonth() + 1) + "-" + curr_day.getDate());
                            temp.push(curr_day.getDate());
                        } else {
                            const other_day = new Date(curr_day.getTime());
                            if (i < curr_day.getDay()) {
                                other_day.setDate(curr_day.getDate() - (curr_day.getDay() - i));
                            } else {
                                other_day.setDate(curr_day.getDate() + (i - curr_day.getDay()));
                            }
                            temp.push(other_day.getDate());
                            dates.push(other_day.getFullYear() + "-" + (other_day.getMonth() + 1) + "-" + other_day.getDate())
                        }
                    }
                    setDaynumbers(temp);
                    const formData = new FormData();
                    for (var i = 0; i < 7; i++) {
                        formData.append('dates[]', dates[i]);
                    }
                    formData.set('tutor_id', tutorId);
                    axios({
                        method: 'post',
                        url: '/tutor/getSchedule',
                        data: formData,
                        headers: {'Content-Type': 'multipart/form-data'}
                    })
                    .then(res => res.data)
                    .catch(err => console.log(err))
                    .then(res => {
                        if (res.success) {
                            setSchedules(res.result);
                        } else {
                            alert('Failed');
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

    function handleNextWeek() {
        const curr_day = dayMemo;
        const adder = 7 - curr_day.getDay();
        curr_day.setDate(curr_day.getDate() + adder);
        setDayMemo(curr_day);
        const temp = [];
        const dates = [];
        for (var i = 0; i < 7; i++) {
            if (i === 0) {
                dates.push(curr_day.getFullYear() + "-" + (curr_day.getMonth() + 1) + "-" + curr_day.getDate());
                temp.push(curr_day.getDate());
            } else {
                const other_day = new Date(curr_day.getTime());
                if (i < curr_day.getDay()) {
                    other_day.setDate(curr_day.getDate() - (curr_day.getDay() - i));
                } else {
                    other_day.setDate(curr_day.getDate() + (i - curr_day.getDay()));
                }
                temp.push(other_day.getDate());
                dates.push(other_day.getFullYear() + "-" + (other_day.getMonth() + 1) + "-" + other_day.getDate())
            }
        }
        setDaynumbers(temp);
        const formData = new FormData();
        for (var i = 0; i < 7; i++) {
            formData.append('dates[]', dates[i]);
        }
        formData.set('tutor_id', tutorId);
        axios({
            method: 'post',
            url: '/tutor/getSchedule',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                setSchedules(res.result);
            } else {
                alert('Failed');
            }
        })
    }

    function handlePrevWeek() {
        const curr_day = dayMemo;
        const adder = -1 - curr_day.getDay();
        curr_day.setDate(curr_day.getDate() + adder);
        setDayMemo(curr_day);
        const temp = [];
        const dates = [];
        for (var i = 0; i < 7; i++) {
            if (i === 6) {
                dates.push(curr_day.getFullYear() + "-" + (curr_day.getMonth() + 1) + "-" + curr_day.getDate());
                temp.push(curr_day.getDate());
            } else {
                const other_day = new Date(curr_day.getTime());
                if (i < curr_day.getDay()) {
                    other_day.setDate(curr_day.getDate() - (curr_day.getDay() - i));
                } else {
                    other_day.setDate(curr_day.getDate() + (i - curr_day.getDay()));
                }
                temp.push(other_day.getDate());
                dates.push(other_day.getFullYear() + "-" + (other_day.getMonth() + 1) + "-" + other_day.getDate())
            }
        }
        setDaynumbers(temp);
        const formData = new FormData();
        for (var i = 0; i < 7; i++) {
            formData.append('dates[]', dates[i]);
        }
        axios({
            method: 'post',
            url: '/tutor/getSchedule',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                setSchedules(res.result);
            } else {
                alert('Failed');
            }
        })
    }

    function handleRegister(courseId) {
        const formData = new FormData();
        formData.set('course_id', courseId);
        setRegisteredSession();
        axios({
            method: 'post',
            url: '/tutor/register',
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        .then(res => res.data)
        .catch(err => console.log(err))
        .then(res => {
            if (res.success) {
                alert('Registered');
            } else {
                alert('Failed to register');
            }
        })
    }

    return <div className="wrapper">
        <div className="sidebar">
            <ul>
                <li onClick={() => {
                    window.location.href = "#tutoringSchedule";
                }}><a href="#tutoringSchedule">Tutoring schedule</a></li>
                <li onClick={() => {
                    window.location.href = "#registerForSession";
                }}>Register for a session</li>
            </ul>
        </div>
        <div className="content" style={{overflowX: "hidden"}}>
            <div className="box">
                <a name="tutoringSchedule"></a>
                <div className="box_top">
                    <h2>Tutoring schedule</h2>
                </div>
                <div className="box_bottom">
                    <Button style={{
                        height: "56px",
                        marginRight: "1em"
                    }} variant="outlined" color="secondary" onClick={handlePrevWeek}>
                        Prev
                    </Button>
                    {monthNames[dayMemo.getMonth()] + " " + dayMemo.getFullYear()}
                    <Button style={{
                        height: "56px",
                        marginLeft: "1em"
                    }} variant="outlined" color="secondary" onClick={handleNextWeek}>
                        Next
                    </Button><br /><br />
                    <div className="calendar_container">
                        <div className="calendar_header">
                            <ul className="weekdays">
                                <li>SUN</li>
                                <li>MON</li>
                                <li>TUE</li>
                                <li>WED</li>
                                <li>THU</li>
                                <li>FRI</li>
                                <li>SAT</li>
                            </ul>

                            <ul className="daynumbers">
                                {daynumbers.map(daynumber => {
                                    return <li>{daynumber}</li>
                                })}
                            </ul>
                        </div>
                        <div className="timeslots_container">
                            <ul className="timeslots">
                                <li>GMT+7</li>
                                <li>01:00</li>
                                <li>02:00</li>
                                <li>03:00</li>
                                <li>04:00</li>
                                <li>05:00</li>
                                <li>06:00</li>
                                <li>07:00</li>
                                <li>08:00</li>
                                <li>09:00</li>
                                <li>10:00</li>
                                <li>11:00</li>
                                <li>12:00</li>
                                <li>13:00</li>
                                <li>14:00</li>
                                <li>15:00</li>
                                <li>16:00</li>
                                <li>17:00</li>
                                <li>18:00</li>
                                <li>19:00</li>
                                <li>20:00</li>
                                <li>21:00</li>
                                <li>22:00</li>
                                <li>23:00</li>
                            </ul>
                        </div>

                        <div className="event_container">
                            {schedules.map(schedule => {
                                const num_start_time = parseInt(schedule.start_time.split(":")[0]);
                                const num_end_time = schedule.end_time.split(":")[0];
                                const grid_row = (num_start_time * 4) + 1;
                                const slotStyle = {
                                    gridRow: String(grid_row),
                                    gridColumn: 1 + new Date(schedule.date).getDay(),
                                    height: String((num_end_time - num_start_time) * 60) + "px",
                                    cursor: "pointer"
                                }
                                return <div className="slot" style={slotStyle} onClick={() => {
                                    setRegisteredSession({
                                        _id: schedule._id,
                                        title: schedule.title
                                    })
                                    window.location.href = "#registerForSession";
                                }}>
                                    <div className="event_status">{schedule.title}<br /><br />{schedule.description}</div>
                                </div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="box">
                <a name="registerForSession"></a>
                <div className="box_top">
                    <h2>Register for a session</h2>
                </div>
                <div className="box_bottom">
                    {registeredSession ? <div>
                        You have selected a new session: {registeredSession.title} <br /><br />
                        <Button style={{
                            height: "56px",
                            marginLeft: "1em"
                        }} variant="outlined" color="secondary" onClick={() => {
                            handleRegister(registeredSession._id);
                        }}>
                            Register
                        </Button>
                    </div> : "Please select a new session."}
                </div>
            </div>
        </div>
    </div>
}