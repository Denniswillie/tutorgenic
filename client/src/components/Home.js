import {useEffect, useState} from 'react';
import axios from 'axios';

export default function Home() {
    const [isTutor, setIsTutor] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        const ac = new AbortController();

        axios.get('/auth/isLoggedIn')
            .then(res => res.data)
            .catch(err => console.log(err))
            .then(res => {
                if (res.isLoggedIn) {
                    setIsTutor(res.isTutor);
                    setIsAdmin(res.isAdmin);
                } else {
                    window.open('/', '_self');
                }
            })

        return () => {
            ac.abort();
        }
    }, []);
    return <div>
        <h1>Welcome to home page</h1>
        {isAdmin && <button onClick={() => {
            window.open('/admin', '_self');
        }}>go to admin dashboard</button>}
        {isTutor ? <button onClick={() => {
            window.open('/tutorDashboard', '_self');
        }}>Go to tutor dashboard</button> : <button onClick={() => {
            window.open('/applyTutor', '_self');
        }}>Request to be a tutor</button>}
        <button onClick={() => {
            window.open('/auth/logout', '_self');
        }}>logout</button>
    </div>
}