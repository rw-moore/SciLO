/**
 * Mock data of questions in the question bank table
 */
export default [
    {
        key: '1',
        title: 'basic calculation 1',
        context: "1+2=?",
        tags: ['simple', 'addition'],
    },
    {
        key: '2',
        title: 'basic calculation 2',
        context: "what is the result of 3 * 5?",
        tags: ['multiplication'],
    },
    {
        key: '3',
        title: 'bonus question 1',
        context: "what is the derivative of x^4+x^2+1/x+5?",
        tags: ['difficult', 'bonus', 'derivative'],
    },
    {
        key: '1-1',
        title: 'basic calculation 3',
           context: "5+2=?",
        tags: ['easy', 'addition'],
    },
    {
        key: '2-2',
        title: 'basic calculation 4',
        context: "what is the result of 7 / 5?",
        tags: ['division'],
    },
    {
        key: '3-3',
        title: 'bonus question 2',
        context: "what is the derivative of x^5?",
        tags: ['easy', 'bonus', 'derivative'],
    },
]