import React from "react";
import { useHistory } from "react-router";
import { Alert, message, Spin } from "antd";
import CreateAttemptListByQuiz from "../../networks/CreateAttemptByQuiz";

const QuizRedirect = (props) => {
    const history = useHistory();

    const createAndFetch = () => {
        CreateAttemptListByQuiz(props.id, props.token).then(data => {
            if (!data || data.status !== 200) {
                if (data.data.message && data.data.message !== "") {
                    message.error(data.data.message);
                } else {
                    message.error("Cannot create quiz attempt, see browser console for more details.");
                }
            } else {
                history.push({
                    pathname: "/Quiz/attempt/"+data.data.id
                });
            }
        });
    }
    const useMountEffect = (fun) => React.useEffect(fun, []);

    useMountEffect(createAndFetch);

    return (
        <div style={{width: "70%", marginLeft: "15%"}}>
            <span style={{position:'absolute', 'left':'50%', 'top':'20%'}}>
                <Spin size="large" />
            </span>
            <Alert
                message="Please wait while you are redirected."
                type="info"
            />
        </div>
    )
}

export default QuizRedirect;