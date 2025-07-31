import React from 'react';
import { withCookies } from 'react-cookie';

import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import { LoginCard, CourseSelectCard } from './CardComponents';
import { LoadingModal, LoginModal } from "./Modals";
import TitleSVG from "./assets/title.svg";

export class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { moodleclient: null, loading: false, awaitinglogin: false };
    this.setMoodleClient = this.setMoodleClient.bind(this)
    this.setLoading = this.setLoading.bind(this);
    this.setAwaitLogin = this.setAwaitLogin.bind(this);
  }

  setMoodleClient(client) {
    this.setState({ moodleclient: client });
  }
  setLoading(isloading) {
    this.setState({ loading: isloading });
  }
  setAwaitLogin(isawaitinglogin) {
    this.setState({ awaitinglogin: isawaitinglogin})
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img id="title" src={TitleSVG} alt="MoodleArchiver" className="m-3" />
          <LoginCard cookies={this.props.cookies} setMoodleClient={this.setMoodleClient} setLoading={this.setLoading} setAwaitLogin={this.setAwaitLogin}></LoginCard>
          {
            this.state.moodleclient !== null && <CourseSelectCard cookies={this.props.cookies} moodleclient={this.state.moodleclient} setLoading={this.setLoading} setAwaitLogin={this.setAwaitLogin}></CourseSelectCard>
          }
        </header>
        <div className='footer'>
          <p className="text-start text-light font-monospace" id="self-credit-msg">By: <a href="https://github.com/Aathish04" target="_blank" rel="noopener noreferrer" className="link-onhover-color-change link">Aathish04</a></p>
          <p className="text-start text-light font-monospace" id="contribute-msg">Feel free to <a href="https://github.com/Aathish04/moodlearchiver" target="_blank" rel="noopener noreferrer" className="link-onhover-color-change link">Contribute</a>!</p>
        </div>
        {this.state.loading && <LoadingModal downloadProgress={this.state.moodleclient ? this.state.moodleclient.downloadProgress : 0} />}
        {this.state.awaitinglogin && <LoginModal></LoginModal>}
      </div>
    );
  }
}

export default withCookies(App);
