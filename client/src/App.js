import { Route, Switch } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import ApplyTutor from './components/ApplyTutor';
import TutorDashboard from './components/TutorDashboard';
import Search from './components/Search';
import TutorPage from './components/TutorPage';
import Room from './components/Room';
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
                <Route path="/search/:searchValue" exact render={(props) => {
                    return <div className="body">
                        <Search
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                            searchValue={props.match.params.searchValue}
                        />
                    </div>
                }}/>
                <Route path="/tutor/:tutorId" exact render={(props) => {
                    return <div className="body">
                        <TutorPage
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                            tutorId={props.match.params.tutorId}
                        />
                    </div>
                }}/>
                <Route path="/room/:courseId" exact render={(props) => {
                    return <div className="body">
                        <Room
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                            courseId={props.match.params.courseId}
                        />
                    </div>
                }}/>
                <Route path="/room" exact render={(props) => {
                    return <div className="body">
                        <Home  
                            setDisplayNavbar={setDisplayNavbar}
                            setUser={setUser}
                        />
                    </div>
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
                    return <AdminDashboard 
                        setDisplayNavbar={setDisplayNavbar}
                        setUser={setUser}
                    />
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
            </Switch>
        </main>
    )
}