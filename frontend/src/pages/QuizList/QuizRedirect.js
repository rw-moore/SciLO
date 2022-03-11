import React from "react";
import { useHistory } from "react-router";
import { Alert, message, Spin } from "antd";
import CreateAttemptListByQuiz from "../../networks/CreateAttemptByQuiz";

const QuizRedirect = (props) => {
    const history = useHistory();
    const [loading, setLoading] = React.useState(true);

    const createAndFetch = () => {
        CreateAttemptListByQuiz(props.id, props.token).then(data => {
            if (!data || data.status !== 200) {
                if (data.data.message && data.data.message !== "") {
                    message.error(data.data.message);
                } else {
                    message.error("Cannot create quiz attempt, see browser console for more details.");
                }
                setLoading(false);
            } else {
                history.replace({
                    pathname: "/Quiz/attempt/"+data.data.id
                });
            }
        });
    }
    const useMountEffect = (fun) => React.useEffect(fun, []);

    useMountEffect(createAndFetch);

    return (
        <div style={{width: "70%", marginLeft: "15%"}}>
            {loading ?<>
                <span style={{position:'absolute', 'left':'50%', 'top':'20%'}}>
                    <Spin size="large" />
                </span>
                <Alert
                    message="Please wait while you are redirected."
                    type="info"
                />
            </>:<>
                <Alert
                    message="Error: Unable to create quiz attempt. Contact your instructor."
                    type="error"
                />
            </>
            }
        </div>
    )
}

export default QuizRedirect;