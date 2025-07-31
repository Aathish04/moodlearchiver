import React from 'react';
import { instanceOf } from 'prop-types';
import { Cookies } from 'react-cookie';
import { Buffer } from 'buffer';

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import { LoginFailedToast, DownloadFailedToast } from "./Toasts";
import ProgressBar from 'react-bootstrap/ProgressBar';

import { MoodleClient } from './MoodleAPI';

export class LoginCard extends React.Component { // Custom Card for Login
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) { // Props are inherited properties one could pass.
        super(props)
        const { cookies } = props;
        // Set the default state here
        this.state = {
            wentthruvalidationbefore: false,
            username: cookies.get("username") || null,
            password: null,
            backend: cookies.get("backend") || "https://lms.ssn.edu.in/",
            custombackend: (cookies.get("custombackend") && JSON.parse(cookies.get("custombackend"))) || false,
            borderstyle: "light",
            loginfailed: false,
            loginfailurereason: null,
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
        // Backend has changed, so we have to reset the
        // moodle client.
        this.props.setMoodleClient(null);
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
        const { cookies } = this.props;
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.setState({ wentthruvalidationbefore: false });
            event.preventDefault();
            event.stopPropagation();

        }
        else {
            var moodleclient = new MoodleClient(this.state.username, this.state.backend);
            this.props.setAwaitLogin(true);
            try {
                await moodleclient.getToken(this.state.password);
                this.props.setAwaitLogin(false)
                this.setState({ borderstyle: "success", loginfailed: false, loginfailurereason: null });
                this.setMoodleClient(moodleclient);

                let oneyearlater = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
                cookies.set('username', this.state.username, { expires: oneyearlater });
                cookies.set('custombackend', this.state.custombackend, { expires: oneyearlater });
                cookies.set('backend', this.state.backend, { expires: oneyearlater });
            }
            catch (e) {
                this.setState({ borderstyle: "danger", loginfailurereason: e.message, loginfailed: true });
                this.setMoodleClient(null);
            }
            this.props.setAwaitLogin(false)
        }

        this.setState({ wentthruvalidationbefore: true })
    }

    render() {
        const { cookies } = this.props;
        return <Card className='m-2' border={this.state.borderstyle}>
            <Card.Header>Login to Moodle</Card.Header>
            <Form onSubmit={this.handleSubmit} noValidate validated={this.state.wentthruvalidationbefore}>

                <Form.Group className="m-3" controlId="moodleusernameform">
                    <FloatingLabel controlId="floatingUsername" label="Moodle Username">
                        <Form.Control type="text" placeholder="Moodle Username" defaultValue={this.state.username} onChange={this.handleUsernameChange} required />
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
                    <Form.Select
                        aria-label="Moodle Backend Selector"
                        onChange={this.handleBackendSelectorChange}
                        defaultValue={this.state.custombackend ? "custom" : this.state.backend}
                        required>
                        <option value="https://lms.ssn.edu.in/">SSN College LMS</option>
                        <option value="https://lms-old.ssn.edu.in">SSN College LMS (old)</option>
                        <option value="https://lms.snuchennai.edu.in/">SNU Chennai LMS</option>
                        <option value="https://lms-old.snuchennai.edu.in">SNU Chennai LMS (old)</option>
                        <option value="custom">Custom Backend (Experimental!)</option>
                    </Form.Select>
                </Form.Group>
                {
                    this.state.custombackend &&
                    <Form.Group className="m-3" controlId="moodlecustombackendform">
                        <Form.Control
                            type="url"
                            placeholder="https://school.moodledemo.net/"
                            defaultValue={cookies.get("custombackend") && JSON.parse(cookies.get("custombackend")) ? this.state.backend : undefined}
                            onChange={this.handleCustomBackendInput}
                            required={this.state.custombackend} />
                        <Form.Control.Feedback type="invalid">
                            Please enter a proper URL.
                        </Form.Control.Feedback>
                    </Form.Group>
                }
                <Button variant="primary" className="mb-2" type='submit'>
                    Log In
                </Button>
                <LoginFailedToast showToast={this.state.loginfailed} failureReason={this.state.loginfailurereason}></LoginFailedToast>
            </Form>
        </Card>
    }
}

export class CourseSelectCard extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };
    constructor(props) { // Props are inherited properties one could pass.
        super(props);
        const { cookies } = props;
        this.state = {
            borderstyle: "light",
            wentthruvalidationbefore: false,
            courses: [],
            selectedcoursesids: cookies.get("selectedcoursesids") ? JSON.parse(Buffer.from(cookies.get("selectedcoursesids"), "base64").toString('utf-8')) : [],
            downloadfailed: false,
            downloadfailurereason: null,
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDropDownChange = this.handleDropDownChange.bind(this);
    }

    async componentDidMount() {
        this.props.setLoading(true)
        await this.props.moodleclient.getUserID();
        this.setState({ courses: await this.props.moodleclient.getUserCourses() })
        this.props.setLoading(false)
    }

    async handleSubmit(event) {
        event.preventDefault();
        const { cookies } = this.props;
        // TODO: for some reason clicking the select/deselect all button
        // triggers this submission. Figure out why.
        // the current workaround is to only do what this function needs
        // to do when the submitter has type "submit"
        if (event.nativeEvent.submitter.getAttribute("type") === "submit") {
            this.setState({ downloadfailed: false, downloadfailurereason: null, borderstyle: "light" })
            this.props.setLoading(true)
            try {
                await this.props.moodleclient.getFilesForDownload(
                    this.state.courses.filter(course => this.state.selectedcoursesids.includes(course["id"].toString()))
                );
                let oneyearlater = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
                let encodedString = Buffer.from(JSON.stringify(this.state.selectedcoursesids)).toString('base64');
                cookies.set('selectedcoursesids', encodedString, { expires: oneyearlater });
                await this.props.moodleclient.downloadFilesIntoZIP((progress) => {
                    this.props.moodleclient.downloadProgress = progress;
                    this.forceUpdate();
                });
            }
            catch (e) {
                console.log(e);
                this.setState({ borderstyle: "danger", downloadfailurereason: e.message, downloadfailed: true });
            }
        }
    }

    handleDropDownChange(selected) {
        this.setState({ selectedcoursesids: selected })
    }
    render() {
        return <Card className='m-2 border-3' border={this.state.borderstyle}>
            <Card.Header>Select Courses</Card.Header>
            <Form onSubmit={this.handleSubmit}>
                {this.state.courses.length > 0 &&
                    <DropdownMultiselect
                        options={
                            this.state.courses.sort(
                                function (course1, course2) {
                                    if (course1["shortname"] < course2["shortname"]) {
                                        return 1;
                                    }
                                    else if (course1["shortname"] > course2["shortname"]) {
                                        return -1;
                                    } else {
                                        return 0;
                                    }
                                }
                            )
                        }
                        optionKey="id"
                        optionLabel="shortname"
                        name="courses"
                        selected={
                            this.state.selectedcoursesids.filter(
                                courseid => this.state.courses.map(
                                    course => course["id"].toString()
                                ).includes(courseid)
                            )
                        }
                        handleOnChange={this.handleDropDownChange} />}
                <Button variant="success" className="mb-2" type='submit' disabled={this.state.selectedcoursesids.length <= 0}>
                    Download
                </Button>
            </Form>
            <ProgressBar now={this.props.moodleclient.downloadProgress} label={`${Math.round(this.props.moodleclient.downloadProgress)}%`} />
            <DownloadFailedToast showToast={this.state.downloadfailed} failureReason={this.state.downloadfailurereason}></DownloadFailedToast>
        </Card>
    }
}
