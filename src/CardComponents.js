import React from 'react';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

export class LoginCard extends React.Component { // Custom Card for Login


    constructor(props) { // Props are inherited properties one could pass.
        super(props)
        this.state = { username: null, password: null, backend: "https://lms.ssn.edu.in/" }

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleBackendSelectorChange = this.handleBackendSelectorChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleUsernameChange(event) {
        this.setState({ username: event.target.value, password: this.state.password, backend: this.state.backend });
    }
    handlePasswordChange(event) {
        this.setState({ username: this.state.username, password: event.target.value, backend: this.state.backend });
    }
    handleBackendSelectorChange(event) {
        this.setState({ username: this.state.username, password: this.state.password, backend: event.target.value });
    }
    handleSubmit(event) {
        event.preventDefault();
        alert('username: ' + this.state.username + "\npassword: " + this.state.password + "\nbackend: " + this.state.backend);
    }

    render() {
        return <Card className='m-2' style={{ width: '20rem' }}>
            <Card.Header>Login to Moodle</Card.Header>
            <Form onSubmit={this.handleSubmit}>

                <Form.Group className="m-3" controlId="moodleusernameform">
                    <FloatingLabel controlId="floatingUsername" label="Moodle Username">
                        <Form.Control type="text" placeholder="Moodle Username" onChange={this.handleUsernameChange} required />
                    </FloatingLabel>
                    <Form.Control.Feedback type="invalid">
                        Please choose a username.
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="m-3" controlId="moodlepasswordform">
                    <FloatingLabel controlId="floatingPassword" label="Password">
                        <Form.Control type="password" placeholder="Password" onChange={this.handlePasswordChange} required />
                    </FloatingLabel>
                    <Form.Control.Feedback type="invalid">
                        Please enter your password.
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="m-3" controlId="moodlebackendselectform">
                    <Form.Label>Moodle Backend:</Form.Label>
                    <Form.Select aria-label="Moodle Backend Selector" onChange={this.handleBackendChange} defaultValue={this.state.backend} required>
                        <option value="https://lms.ssn.edu.in/">SSN College LMS</option>
                        <option value="https://lms-old.ssn.edu.in/">SSN College LMS-Old</option>
                        <option value="custom">Custom Backend (Experimental!)</option>
                    </Form.Select>
                </Form.Group>

                <Button variant="primary" className="mb-2" type='submit'>
                    Submit
                </Button>

            </Form>
        </Card>
    }
}