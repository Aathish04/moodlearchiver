import React from 'react';
import Toast from 'react-bootstrap/Toast';

export class LoginFailedToast extends React.Component {
  constructor(props) {
    super(props);
    this.headingtext = "";
    this.mainreason = "";
    this.resolvesteps = [];
    this.setHeadingBody = this.setHeadingBody.bind(this);
  }

  setHeadingBody() {
    this.resolvesteps = [];
    if (this.props.showToast) {
      switch (this.props.failureReason.toString()) {
        case "invalidlogin":
          this.headingtext = "Invalid Credentials!";
          this.mainreason = "Moodle reports that those credentials were incorrect. Try again?";
          break;
        case "Failed to fetch":
          this.headingtext = "Fetching Login Token Failed!"
          this.mainreason = "Couldn't reach the server..."
          this.resolvesteps = [
            "If you're using a custom backend, check if you typed the URL properly.",
            "If you're sure the backend URL is proper, maybe it's down, or blocked?"
          ]
          break;
        default:
          this.headingtext = "Unknown Error";
          this.mainreason = "Specifics for debugging: " + this.props.failureReason;
          break;
      }
    }
  }

  render() {
    this.setHeadingBody()
    return <Toast show={this.props.showToast} bg="danger">
      <Toast.Header closeButton={false}>
        <strong className="me-auto">{this.headingtext}</strong>
      </Toast.Header>
      <Toast.Body>{this.mainreason}{this.resolvesteps.length > 0 && <ul>{this.resolvesteps.map((step, index) => <li key={index}>{step}</li>)}</ul>}</Toast.Body>
    </Toast>
  }
}


export class DownloadFailedToast extends LoginFailedToast {
  setHeadingBody() {
    this.resolvesteps = [];
    this.headingtext = "Download Failed...";
    this.mainreason = "Specifics for debugging: " + this.props.failureReason;
  }
}