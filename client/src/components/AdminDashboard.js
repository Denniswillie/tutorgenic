import {useEffect} from 'react';

export default function AdminDashboard() {
    useEffect(() => {
        const ac = new AbortController();

        

        return () => {
            ac.abort();
        }
    }, []);
    return <div>

    </div>
}