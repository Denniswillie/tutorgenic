import { Route, Switch } from 'react-router-dom';
import Auth from './components/Auth';
import Home from './components/Home';
import './styles.css';

export default function App(props) {
  return (
    <main>
      <Switch>
        <Route path="/" exact component={Auth}/>
        <Route path="/home" component={Home} />
      </Switch>
    </main>
  )
}