import React from 'react';
import {UserConsumer} from "./UserContext";

export default function Admin(props) {
    return (
        <UserConsumer>
            {
                (User) => {
                    if (User && User.user.is_staff) {
                        const util = require('util')
                        // console.log(util.inspect(User.user, {showHidden: false, depth: null}))
                        // console.log(User.user.roles)
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