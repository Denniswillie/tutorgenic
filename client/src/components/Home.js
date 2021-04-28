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
                    setUser(user);
                } else {
                    window.open('/', '_self');
                }
            })

        return () => {
            ac.abort();
        }
    }, [setUser]);
    return <div>

    </div>
}