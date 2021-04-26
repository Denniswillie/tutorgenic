import { Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import './styles.css';

export default function App(props) {
  return (
    <main>
      <Switch>
        <Route path="/" exact component={Home}/>
      </Switch>
    </main>
  )
}