# MoodleArchiver

Moodle Archiver is a front-end web tool designed with React and Bootstrap that allows you to download all the files from your Moodle courses all at once.

## Usage

With the website running, follow the steps below:

1. Visit [the website](https://aathish04.github.io/moodlearchiver) and enter your credentials using the form provided.

    This website was only tested with the LMS of SSN College of Engineering/SNU Chennai, but you can enter your own institution's Moodle Backend, and it should still work.

2. Select the courses whose material you want to download.

3. Download the files!

You'll obtain all of the files as a single ZIP file. Each of the courses you selected will get their own folder, and each each section of each course gets its own folder and so on.

## High Level Implementation Details
Superficially, this is just a client that speaks to the Moodle Webservice API and asks it for Course information and file downloads.

It uses React and Bootstrap for the User Interface and has a little custom Moodle Webservice API Client to talk to the actual servers.

Have a look at the source code! Since I built this as a learning project, I've attempted to keep code as self explanatory and clear-cut as possible.

## Security

This web app does not store any of your credentials for more than the length of your session - neither the token used for interacting with the Moodle API, nor the password you enter so the token can be obtained are saved by this project. The token is only stored for as long as each of your sessions on the web app lasts.

## Contribution
Is welcome! If you face any bugs, or want to extend this project you're welcome to fork it.

## Acknowledgements and Disclaimers

This project is NOT affiliated with Moodle Pty Ltd or any of its affiliates in ANY WAY.

It is however, indebted to them for providing such an easy to use Webservice API so projects like this can be built.
