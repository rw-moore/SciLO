const local = true;
const domain = local ? "http://localhost" : "somewhere.backend";

export default {
    domain: domain,
    port: 8000,
    endpoints: {
        questions: {
            address: "questions",
            methods: ["GET", "POST"],
        },
    }
}

