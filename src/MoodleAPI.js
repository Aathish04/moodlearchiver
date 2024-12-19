import JSZip from "jszip";
import { saveAs } from 'file-saver';
export class MoodleClient {
  headersList = {
    "Accept": "*/*",
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

      let response = await fetch(`${this.backend}/webservice/rest/server.php`, {
        method: "POST",
        body: bodyContent,
        headers: this.headersList
      });

      let data = await response.json();
      if ("errorcode" in data) {
        throw new MoodleError(data)
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

    let bodyContent = new MoodleFormData();
    bodyContent.append("wstoken", this.token);
    bodyContent.append("wsfunction", "core_enrol_get_users_courses");
    bodyContent.append("userid", this.userid);

    let response = await fetch(`${this.backend}/webservice/rest/server.php`, {
      method: "POST",
      body: bodyContent,
      headers: this.headersList
    });

    let data = await response.json();
    if ("errorcode" in data) {
      throw new MoodleError(data)
    }
    var courses = []
    for (let courseinfo of data) {
      courses.push({ "id": courseinfo["id"], "shortname": courseinfo["shortname"] })
    }
    return courses;
  }

  async getUserAssignments(courses) {
    if (this.token === null) {
      throw new Error("token not recieved yet");
    }
    let bodyContent = new MoodleFormData();
    bodyContent.append("wstoken", this.token);
    bodyContent.append("wsfunction", "mod_assign_get_assignments");
    for (let [index, course] of courses.entries()) {
      bodyContent.append(`courseids[${index}]`, course["id"]);
    }
    let response = await fetch(`${this.backend}/webservice/rest/server.php`, {
      method: "POST",
      body: bodyContent,
      headers: this.headersList
    });
    let data = await response.json();
    if ("errorcode" in data) {
      throw new MoodleError(data)
    }
    let assignments = [];
    assignments = data["courses"].map(course => course["assignments"]);
    assignments = assignments.flat();
    return assignments;
  }

  async getAssignmentDetailsAndSubmissionFiles(instanceid) {
    if (this.token === null) {
      throw new Error("token not recieved yet");
    }
    let bodyContent = new MoodleFormData();
    let details = [];
    bodyContent.append("wstoken", this.token);
    bodyContent.append("wsfunction", "mod_assign_get_submission_status");
    bodyContent.append("assignid", instanceid);
    let response = await fetch(`${this.backend}/webservice/rest/server.php`, {
      method: "POST",
      body: bodyContent,
      headers: this.headersList
    });
    let data = await response.json();
    if ("errorcode" in data) {
      throw new MoodleError(data)
    }

    if ("lastattempt" in data) {
      if ("submission" in data["lastattempt"]) {
        let submission = data["lastattempt"]["submission"];
        for (let plugin of submission["plugins"]) {
          if (plugin["type"] === "file") {
            for (let filearea of plugin["fileareas"]) {
              if (filearea["area"] === "submission_files") {
                details.push(...filearea["files"])
              }
            }
          }
        }
      }
    }
    if ("assignmentdata" in data) {
      let assignmentdata = data["assignmentdata"];
      if ("attachments" in assignmentdata) {
        if ("intro" in assignmentdata["attachments"]) {
          details.push(...assignmentdata["attachments"]["intro"]);
        }
      }
    }
    return details;
  }
  async getFilesForDownload(courses) {
    if (this.token === null) {
      throw new Error("token not recieved yet");
    }
    let cur_user_assignments = await this.getUserAssignments(courses);
    this.files = {};
    for (let course of courses) {
      this.files[course["shortname"]] = {};

      let bodyContent = new MoodleFormData();
      bodyContent.append("wstoken", this.token);
      bodyContent.append("wsfunction", "core_course_get_contents");
      bodyContent.append("courseid", course["id"]);
      let response = await fetch(`${this.backend}/webservice/rest/server.php`, {
        method: "POST",
        body: bodyContent,
        headers: this.headersList
      });
      let data = await response.json();
      if ("errorcode" in data) {
        throw new MoodleError(data)
      }

      for (let section of data) {
        let sectionname = this.makeStringPathSafe(section["name"])
        this.files[course["shortname"]][sectionname] = []
        for (let module of section["modules"]) {
          if ("modplural" in module) {
            if (["Files", "Folders"].includes(module["modplural"])) {

              if (module["contents"] === undefined) {
                console.log(`No contents available for ${module["name"]} under ${course["shortname"]} - ${sectionname}. Skipping.`);
                continue
              }

              for (let content of module["contents"]) {
                if (content["type"] === "file") {
                  this.files[course["shortname"]][sectionname].push(
                    {
                      "fileurl": content["fileurl"],
                      "filename": content["filename"].substr(0, content["filename"].lastIndexOf(".")) + "_" + content["timemodified"] + "." + content["filename"].split('.').pop(),
                      // We do the following so that in the event that the faculty uploaded a folder as the module,
                      // all the files inside the folder are properly wrapped up in said folder
                      // We accomplish this by prepending the filepath of the file with the name
                      // of the folder. By default the filepath is '/', so when we prepend,
                      // the path becomes 'foldername/' and the file is saved at
                      // "foldername/filename.filextension" instead of at "/filename.filextension"
                      "filepath": module["modplural"] === "Folders" ? this.makeStringPathSafe(module["name"]) + content["filepath"] : content["filepath"],
                    }
                  )
                }
              }
            }
            else if (module["modplural"] === "Assignments") {
              try {
                let detailsandubmissionfiles = await this.getAssignmentDetailsAndSubmissionFiles(module["instance"])
                for (let dOrSubfile of detailsandubmissionfiles) {
                  this.files[course["shortname"]][sectionname].push({
                    "fileurl": dOrSubfile["fileurl"],
                    "filename": dOrSubfile["filename"].substr(0, dOrSubfile["filename"].lastIndexOf(".")) + "_" + dOrSubfile["timemodified"] + "." + dOrSubfile["filename"].split('.').pop(),
                    "filepath": this.makeStringPathSafe(module["name"]) + dOrSubfile["filepath"]
                  })
                }
                // In case their version of moodle doesn't return assignment intro information along with submission info:
                let cur_assignment = cur_user_assignments.find(assignment => assignment["id"] === module["instance"])
                if ("introattachments" in cur_assignment) {
                  for (let attachment of cur_assignment["introattachments"]) {
                    if (this.files[course["shortname"]][sectionname].find(filedata => filedata["fileurl"] === attachment["fileurl"]) === undefined) {
                      this.files[course["shortname"]][sectionname].push({
                        "fileurl": attachment["fileurl"],
                        "filename": attachment["filename"].substr(0, attachment["filename"].lastIndexOf(".")) + "_" + attachment["timemodified"] + "." + attachment["filename"].split('.').pop(),
                        "filepath": this.makeStringPathSafe(module["name"]) + cur_assignment["filepath"]
                      })
                    }
                  }
                }

              }
              catch (e) {
                if (e instanceof MoodleError) {
                  if (e.moodleerrorcode === "requireloginerror") {
                    console.log(`Could not access assignment ${module["name"]}. Skipping.`);
                  } // that assignment is no longer accessible.
                }
                else {
                  throw e;
                }
              }

            }
          }
        }
      }
    }

    // Now, we have all the files!
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
          // This module (in this scope alone) is slightly different
          // from a moodle module which is either a file or folder
          // here, it is a file, or folder that has been uploaded
          // as a module itself, or it might also be attachments to
          // a particular assignment.
          let bodyContent = new MoodleFormData();
          bodyContent.append("token", this.token);
          let response = await fetch(module["fileurl"], {
            method: "POST",
            body: bodyContent,
            headers: this.headersList
          });
          let data = await response.blob();
          sectionfolder.file(module["filepath"] + module["filename"], data)
        }
      }
    }
    jszip.generateAsync({ type: "blob" }).then(function(blob) { saveAs(blob, `MoodleArchive.zip`); });
  }
}

class MoodleFormData extends FormData {
  constructor(args) {
    super(args);
    this.append("moodlewsrestformat", "json")
  }
}

class MoodleError extends Error {
  constructor(errorobj) {
    super(errorobj["message"]);
    this.moodleexception = errorobj["exception"];
    this.moodleerrorcode = errorobj["errorcode"];
    this.message = errorobj["message"];
  }
}
