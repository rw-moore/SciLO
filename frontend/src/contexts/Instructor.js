import React from 'react';
import {UserConsumer} from "./UserContext";

export default function Instructor(props) {
    return (
        <UserConsumer>
            {
                (User) => {
                    if (User && User.user.is_staff) {
                        return (
                            props.children
                        )
                    }
                    // fallback
                    else {
                        return (props.fallback)
                    }
                }
            }
        </UserConsumer>
    )
}