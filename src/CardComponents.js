import React from 'react';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import { InvalidCredentialsToast } from "./Toasts"

import { MoodleClient } from './MoodleAPI';

export class LoginCard extends React.Component { // Custom Card for Login


    constructor(props) { // Props are inherited properties one could pass.
        super(props)
        // Set the default state here
        this.state = {
            invalidcreds: false,
            wentthruvalidationbefore: false,
            username: null,
            password: null,
            backend: "https://lms.ssn.edu.in/",
            custombackend: false,
            borderstyle: "light"
        }

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleBackendSelectorChange = this.handleBackendSelectorChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCustomBackendInput = this.handleCustomBackendInput.bind(this);
        this.setMoodleClient = this.setMoodleClient.bind(this);
    }

    setMoodleClient(client) {
        this.props.setMoodleClient(client);
    }
    handleUsernameChange(event) {
        this.setState({ username: event.target.value });
    }
    handlePasswordChange(event) {
        this.setState({ password: event.target.value });
    }
    handleBackendSelectorChange(event) {
        if (event.target.value === "custom") {
            this.setState({ custombackend: true });
        }
        else { this.setState({ backend: event.target.value, custombackend: false }); }
    }

    handleCustomBackendInput(event) {
        this.setState({ backend: event.target.value });
    }
    async handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({ wentthruvalidationbefore: false });
            event.preventDefault();
            event.stopPropagation();

        }
        else {
            var moodleclient = new MoodleClient(this.state.username, this.state.backend);
            var invalidlogin = false;
            try {
                await moodleclient.getToken(this.state.password);
                this.setState({ borderstyle: "success", invalidcreds: false });
                this.setMoodleClient(moodleclient);
            }
            catch (e) {
                if (e.message === "invalidlogin") {
                    invalidlogin = true;
                }
                this.setState({ borderstyle: "danger", invalidcreds: invalidlogin });
            }
        }

        this.setState({ wentthruvalidationbefore: true })
    }

    render() {
        return <Card className='m-2 border-3' border={this.state.borderstyle} style={{ width: '20rem' }}>
            <Card.Header>Login to Moodle</Card.Header>
            <Form onSubmit={this.handleSubmit} noValidate validated={this.state.wentthruvalidationbefore}>

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
                    <Form.Select aria-label="Moodle Backend Selector" onChange={this.handleBackendSelectorChange} defaultValue={this.state.backend} required>
                        <option value="https://lms.ssn.edu.in/">SSN College LMS</option>
                        <option value="https://lms-old.ssn.edu.in/">SSN College LMS-Old</option>
                        <option value="custom">Custom Backend (Experimental!)</option>
                    </Form.Select>
                </Form.Group>
                {
                    this.state.custombackend &&
                    <Form.Group className="m-3" controlId="moodlecustombackendform">
                        <Form.Control type="url" placeholder="https://school.moodledemo.net/" onChange={this.handleCustomBackendInput} required={this.state.custombackend} />
                        <Form.Control.Feedback type="invalid">
                            Please enter a proper URL.
                        </Form.Control.Feedback>
                    </Form.Group>
                }
                <Button variant="primary" className="mb-2" type='submit'>
                    Submit
                </Button>
                <InvalidCredentialsToast showToast={this.state.invalidcreds}></InvalidCredentialsToast>
            </Form>
        </Card>
    }
}

export class CourseSelectCard extends React.Component {
    constructor(props) { // Props are inherited properties one could pass.
        super(props);
        this.state = {
            borderstyle: "light",
            wentthruvalidationbefore: false,
            courses: [],
            selectedcoursesids: [],
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDropDownChange = this.handleDropDownChange.bind(this);
    }

    async componentDidMount() {
        await this.props.moodleclient.getUserID();
        this.setState({ courses: await this.props.moodleclient.getUserCourses() })
    }

    async handleSubmit(event) {
        event.preventDefault();
        await this.props.moodleclient.getFilesForDownload(
            this.state.courses.filter(course => this.state.selectedcoursesids.includes(course["id"].toString()))
        );
        await this.props.moodleclient.downloadFilesIntoZIP();
    }

    handleDropDownChange(selected) {
        this.setState({ selectedcoursesids: selected })
    }
    render() {
        return <Card className='m-2 border-3' border={this.state.borderstyle} style={{ width: '20rem' }}>
            <Card.Header>Select Courses</Card.Header>
            <Form onSubmit={this.handleSubmit} noValidate validated={this.state.wentthruvalidationbefore}>
                {this.state.courses.length > 0 &&
                    <DropdownMultiselect
                        options={this.state.courses}
                        optionKey="id"
                        optionLabel="shortname"
                        name="courses"
                        handleOnChange={this.handleDropDownChange} />}
                <Button variant="primary" className="mb-2" type='submit'>
                    Submit
                </Button>
            </Form>
        </Card>
    }
}