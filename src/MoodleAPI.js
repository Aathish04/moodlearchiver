export async function get_token(username, password, backend) {
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Moodle Archiver"
    }

    let bodyContent = new FormData();
    bodyContent.append("username", username);
    bodyContent.append("password", password);
    bodyContent.append("service", "moodle_mobile_app");

    let response = await fetch(`${backend.replace("/+$/g", '')}/login/token.php`, {
        method: "POST",
        body: bodyContent,
        headers: headersList
    });

    let data = await response.json();
    return data["token"];
}