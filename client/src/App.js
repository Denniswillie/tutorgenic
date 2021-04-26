import { Route, Switch } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import ApplyTutor from './components/ApplyTutor';
import TutorDashboard from './components/TutorDashboard';
import './styles.css';

export default function App(props) {
  return (
    <main>
      <Switch>
        <Route path="/" exact component={Auth}/>
        <Route path="/home" component={Home} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/apply" component={ApplyTutor} />
        <Route path="/tutorDashboard" component={TutorDashboard} />
      </Switch>
    </main>
  )
}