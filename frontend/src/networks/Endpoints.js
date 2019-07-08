const local = true;
const domain = local ? "http://localhost" : "somewhere.backend";

export default {
    domain: domain,
    port: 8000,
    endpoints: {
        questions: {
            address: "questions",
            methods: ["GET", "POST", "PATCH", "PUT","DELETE"],
        },
        tags: {
            address: "tags",
            methods: ["GET", "POST"],
        },
        quiz: {
            address: "quiz",
            methods: ["GET", "POST"],
        }
    }
}

