import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import {LoginCard} from './CardComponents';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 id="mainHeading">MoodleArchiver</h1>
        <LoginCard></LoginCard>
      </header>
    </div>
  );
}

export default App;
