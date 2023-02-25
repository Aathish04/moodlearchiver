import React from 'react';

import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

export function LoadingModal() {
    return (
        <Modal centered show={true} backdrop="static" keyboard={false}>
            <Modal.Header>
                <Modal.Title>Fetching... <Spinner animation="border" /> </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                You can look at the network traffic using your Browser's Developer tools to verify that files
                are actually being downloaded.
            </Modal.Body>
        </Modal>
    );
}