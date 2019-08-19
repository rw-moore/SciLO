export default function ErrorHandler(error) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Server has responded with such error information.");
        console.error(error.response.status, error.response.data);
        if (error.response.status===404) {
            error.response.data = "404 - Not Found";
        }
        else if (error.response.status===500) {
            error.response.data = "Server Error!";
        }
        return error.response
        // console.log(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error("Server did not respond. The request is below");
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Internal error!", error.message);
    }
    // console.log(error.config);
}