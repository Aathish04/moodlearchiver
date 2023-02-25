import React from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import { LoginCard, CourseSelectCard } from './CardComponents';
import { LoadingModal } from "./Modals";

export class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { moodleclient: null, loading: false };
    this.setMoodleClient = this.setMoodleClient.bind(this)
    this.setLoading = this.setLoading.bind(this);
  }

  setMoodleClient(client) {
    this.setState({ moodleclient: client });
  }
  setLoading(isloading) {
    this.setState({ loading: isloading });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 id="mainHeading">MoodleArchiver</h1>
          <LoginCard setMoodleClient={this.setMoodleClient} setLoading={this.setLoading}></LoginCard>
          {
            this.state.moodleclient !== null && <CourseSelectCard moodleclient={this.state.moodleclient} setLoading={this.setLoading}></CourseSelectCard>
          }
        </header>
        {this.state.loading && <LoadingModal></LoadingModal>}
      </div>
    );
  }
}

export default App;
