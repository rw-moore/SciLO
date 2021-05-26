const local = true;
const domain = local ? "http://localhost" : "http://142.244.163.57";

const endpoints = {
    domain: domain,
    port: 8000,
    endpoints: {
        questions: {
            address: "questions",
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        },
        tags: {
            address: "tags",
            methods: ["GET", "POST"],
        },
        quiz: {
            address: "quiz",
            methods: ["GET", "POST"],
        },
        user: {
            address: "userprofile",
            methods: ["GET", "POST", "PUT", "PATCH"]
        },
        email: {
            address: "email",
            methods: ["GET", "POST"]
        },
        attempt: {
            address: "quiz-attempt",
            methods: ["GET", "POST"]
        },
        course: {
            address: "course",
            methods: ["GET","POST"]
        }

    }
}
export default endpoints;

