const local = true;
const domain = local ? "localhost" : "somewhere.backend"

export default {
    domain: domain,
    endpoints: {
        questions: {
            address: "questions",
            methods: ["GET", "POST"],
        },
    }
}

