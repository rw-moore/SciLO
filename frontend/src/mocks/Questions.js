export default [
    {
        title: "Mock Question 1",
        background: "Some basic mathematical calculations... Good Luck!",
        tags: [
            "Easy",
            "Math"
        ],
        components: [
            {
                type: "input",
                body: "What is the result of 1 + 1?",
                response: [
                    {
                        body: "2",
                        weight: 100,
                        correct: true
                    },
                    {
                        body: "two",
                        weight: 100,
                        correct: true
                    },
                    {
                        body: "0",
                        weight: 10,
                        correct: false
                    },
                ]
            },
            {
                type: "input",
                body: "What is the result of 1.5 * 2?",
                response: [
                    {
                        body: "3",
                        weight: 100,
                        correct: true
                    }
                ]
            }
        ]
    },
    {
        title: "Mock Question 2",
        background: "Some interesting multiple choice questions.",
        tags: [
            "Fun"
        ],
        components: [
            {
                type: "multiple",
                single: true,
                dropdown: false,
                body: "Select 'Red'",
                response: [
                    {
                        body: "Blue",
                        weight: 0,
                        correct: false
                    },
                    {
                        body: "Red",
                        weight: 100,
                        correct: true
                    },
                    {
                        body: "red",
                        weight: 50,
                        correct: false
                    }
                ]
            },
            {
                type: "multiple",
                single: false,
                dropdown: false,
                body: "Select red color",
                response: [
                    {
                        body: "Blue",
                        weight: -50,
                        correct: false
                    },
                    {
                        body: "Red",
                        weight: 50,
                        correct: true
                    },
                    {
                        body: "red",
                        weight: 50,
                        correct: true
                    }
                ]
            },
            {
                type: "multiple",
                single: false,
                dropdown: true,
                body: "Select red color",
                response: [
                    {
                        body: "Blue",
                        weight: -50,
                        correct: false
                    },
                    {
                        body: "Red",
                        weight: 50,
                        correct: true
                    },
                    {
                        body: "red",
                        weight: 50,
                        correct: true
                    }
                ]
            }
        ]
    }

]