import {useEffect} from 'react';

export default function AdminDashboard(props) {
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
            <h2>Admin</h2>
            <ul>
                <li>Tutors applications</li>
                <li>Existing subjects</li>
                <li>Existing tutors</li>
                <li>Add new admin</li>
                <li>Delete user account</li>
                <li>Report bugs</li>
            </ul>
        </div>
        <div className="content">

        </div>
    </div>
}