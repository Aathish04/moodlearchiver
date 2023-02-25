import React from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import { LoginCard, CourseSelectCard } from './CardComponents';

export class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { moodleclient: null };
    this.setMoodleClient = this.setMoodleClient.bind(this)
  }

  setMoodleClient(client) {
    this.setState({ moodleclient: client });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 id="mainHeading">MoodleArchiver</h1>
          <LoginCard setMoodleClient={this.setMoodleClient}></LoginCard>
          {
            this.state.moodleclient !== null && <CourseSelectCard moodleclient={this.state.moodleclient}></CourseSelectCard>
          }
        </header>
      </div>
    );
  }
}

export default App;
