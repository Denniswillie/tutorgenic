import { Route, Switch } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import ApplyTutor from './components/ApplyTutor';
import TutorDashboard from './components/TutorDashboard';
import SavedTutors from './components/SavedTutors';
import Sessions from './components/Sessions';
import Navbar from './components/Navbar';
import './styles.css';
import {useState} from 'react';

export default function App(props) {
    const [displayNavbar, setDisplayNavbar] = useState(false);
    const [user, setUser] = useState();
    return (
        <main>
            {displayNavbar && <Navbar user={user}/>}
            <Switch>
                <Route path="/" exact render={(props) => {
                    return <Auth 
                        setDisplayNavbar={setDisplayNavbar}
                    />
                }}/>
                <Route path="/googlefailure" exact render={(props) => {
                    return <Auth 
                        error={"It seems that you have signed up with a password. Please login using your email and password."}
                        setDisplayNavbar={setDisplayNavbar}
                    />
                }}/>
                <Route path="/home" exact render={(props) => {
                    return <div className="body">
                        <Home  
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                        />
                    </div>
                }}/>
                <Route path="/admin" exact render={(props) => {
                    return <div className="body">
                        <AdminDashboard 
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                        />
                    </div>
                }}/>
                <Route path="/apply" exact render={(props) => {
                    return <div className="body">
                        <ApplyTutor 
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                        />
                    </div>
                }}/>
                <Route path="/tutorDashboard" exact render={(props) => {
                    return <div className="body">
                        <TutorDashboard 
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                        />
                    </div>
                }}/>
                <Route path="/savedTutors" exact render={(props) => {
                    return <div className="body">
                        <SavedTutors
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                        />
                    </div>
                }}/>
                <Route path="/sessions" exact render={(props) => {
                    return <div className="body">
                        <Sessions
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                        />
                    </div>
                }}/>
            </Switch>
        </main>
    )
}