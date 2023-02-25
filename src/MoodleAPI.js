export class MoodleClient {
    headersList = {
        "Accept": "*/*",
        "User-Agent": "Moodle Archiver"
    }
    constructor(username, backend) {
        this.username = username;
        this.token = null;
        this.backend = backend.replace("/+$/g", '');
    }

    async getToken(password) {
        let bodyContent = new FormData();
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
}