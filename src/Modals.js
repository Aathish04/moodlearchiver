import React from 'react';

import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';

export function LoadingModal({ downloadProgress }) {
    return (
        <Modal centered show={true} backdrop="static" keyboard={false}>
            <Modal.Header>
                <Modal.Title>Fetching... <Spinner animation="border" /> </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {typeof downloadProgress === 'number' && downloadProgress > 0 && downloadProgress < 100 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <ProgressBar now={downloadProgress} label={`${Math.round(downloadProgress)}%`} />
                    </div>
                )}
                You can look at the network traffic using your Browser's Developer tools to verify that files
                are actually being downloaded.
            </Modal.Body>
        </Modal>
    );
}

export function LoginModal() {
  return (
    <Modal centered show={true} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Logging in.... <Spinner animation="border"/></Modal.Title>
      </Modal.Header>
    </Modal>
  )
}
