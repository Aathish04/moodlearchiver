import React from 'react';
import Toast from 'react-bootstrap/Toast';

export function InvalidCredentialsToast(props) {
  return (
    <Toast show={props.showToast} bg="danger">
      <Toast.Header closeButton={false}>
        <strong className="me-auto">Invalid Credentials!</strong>
      </Toast.Header>
      <Toast.Body>Moodle reports that those credentials were incorrect. Try again?</Toast.Body>
    </Toast>
  );
}
