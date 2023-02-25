import JSZip from "jszip";
import { saveAs } from 'file-saver';
export class MoodleClient {
    headersList = {
        "Accept": "*/*",
        "User-Agent": "Moodle Archiver"
    }
    constructor(username, backend) {
        this.username = username;
        this.userid = null;
        this.token = null;
        this.backend = backend.replace("/+$/g", '');
        this.files = {};
    }

    makeStringPathSafe(string) {
        string = string.replace("/", "and");
        string = string.replace("\\", "and");
        string = string.replace("&amp;", "&");
        return string
    }
    async getToken(password) {
        let bodyContent = new MoodleFormData();
        bodyContent.append("username", this.username);
        bodyContent.append("password", password);
        bodyContent.append("service", "moodle_mobile_app");
        let response = await fetch(
            `${this.backend}/login/token.php`,
            { method: "POST", body: bodyContent, headers: this.headersList }
        );
        let data = await response.json();
        if ("token" in data) {
            this.token = data["token"];
            return data["token"];
        }
        else if ("error" in data) {
            throw new Error(data["errorcode"])
        }
    }

    async getUserID() {
        if (this.token === null) {
            throw new Error("token not recieved yet");
        }
        if (this.userid === null) {
            let bodyContent = new MoodleFormData();
            bodyContent.append("wstoken", this.token);
            bodyContent.append("wsfunction", "core_webservice_get_site_info");

            let response = await fetch("https://lms.ssn.edu.in/webservice/rest/server.php", {
                method: "POST",
                body: bodyContent,
                headers: this.headersList
            });

            let data = await response.json();
            if ("errorcode" in data) {
                throw new Error(data["errorcode"])
            }
            this.userid = data["userid"]
            return this.userid;
        }
        else {
            return this.userid
        }
    }

    async getUserCourses() {
        if (this.token === null) {
            throw new Error("token not recieved yet");
        }
        if (this.userid === null) {
            throw new Error("userID not receieved yet")
        }

        let bodyContent = new FormData();
        bodyContent.append("wstoken", this.token);
        bodyContent.append("wsfunction", "core_enrol_get_users_courses");
        bodyContent.append("moodlewsrestformat", "json");
        bodyContent.append("userid", this.userid);

        let response = await fetch("https://lms.ssn.edu.in/webservice/rest/server.php", {
            method: "POST",
            body: bodyContent,
            headers: this.headersList
        });

        let data = await response.json();
        if ("errorcode" in data) {
            throw new Error(data["errorcode"])
        }
        var courses = []
        for (let courseinfo of data) {
            courses.push({ "id": courseinfo["id"], "shortname": courseinfo["shortname"] })
        }
        return courses;
    }

    async getFilesForDownload(courses) {
        if (this.token === null) {
            throw new Error("token not recieved yet");
        }
        for (let course of courses) {
            this.files[course["shortname"]] = {};

            let bodyContent = new FormData();
            bodyContent.append("wstoken", this.token);
            bodyContent.append("wsfunction", "core_course_get_contents");
            bodyContent.append("moodlewsrestformat", "json");
            bodyContent.append("courseid", course["id"]);
            let response = await fetch("https://lms.ssn.edu.in/webservice/rest/server.php", {
                method: "POST",
                body: bodyContent,
                headers: this.headersList
            });
            let data = await response.json();
            if ("errorcode" in data) {
                throw new Error(data["errorcode"])
            }

            for (let section of data) {
                let sectionname = this.makeStringPathSafe(section["name"])
                this.files[course["shortname"]][sectionname] = []
                for (let module of section["modules"]) {
                    if ("modplural" in module) {
                        // TODO: Add support for downloading assignments too.
                        if (["Files", "Folders"].includes(module["modplural"])) {
                            for (let content of module["contents"]) {
                                if (content["type"] === "file") {
                                    this.files[course["shortname"]][sectionname].push(
                                        {
                                            "fileurl": content["fileurl"],
                                            "filename": content["filename"],
                                            // We do the following so that in the event that the faculty uploaded a folder as the module,
                                            // all the files inside the folder are properly wrapped up in said folder
                                            // We accomplish this by prepending the filepath of the file with the name
                                            // of the folder. By default the filepath is '/', so when we prepend,
                                            // the path becomes 'foldername/' and the file is saved at
                                            // "foldername/filename.filextension" instead of at "/filename.filextension"
                                            "filepath": module["modplural"] === "Folders" ? module["name"] + content["filepath"] : content["filepath"],
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Now, we have all the files!
        // console.log(this.files)
        return this.files;
    }

    async downloadFilesIntoZIP() {
        let jszip = new JSZip();
        for (let course in this.files) {
            var coursefolder = jszip.folder(this.makeStringPathSafe(course));
            let sections = this.files[course];
            for (let section in sections) {
                var sectionfolder = coursefolder.folder(section);
                for (let module of sections[section]) {
                    // a module is either a file or folder. see TODO in func above.
                    let bodyContent = new MoodleFormData();
                    bodyContent.append("token", this.token);
                    let response = await fetch(module["fileurl"], {
                        method: "POST",
                        body: bodyContent,
                        headers: this.headersList
                    });
                    let data = await response.blob();
                    console.log(module["filepath"]);
                    sectionfolder.file(module["filepath"] + module["filename"], data)
                }
            }
        }
        jszip.generateAsync({ type: "blob" }).then(function (blob) { saveAs(blob, `MoodleArchive.zip`); });
    }
}

class MoodleFormData extends FormData {
    constructor(args) {
        super(args);
        this.append("moodlewsrestformat", "json")
    }
}