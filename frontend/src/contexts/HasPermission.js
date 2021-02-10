import React from 'react';
import {UserConsumer} from "./UserContext";

/* props
*  id: course id
*  nodes <array of string>: permission nodes to check
*  extra <object {attr: expectValue}>: user.user level check
*  checkAdmin: check perms even if the user is admin, default is false (undefined)
*  any: if the user must have all perms
* */

// see if checkedPerms are a subset of hasPerms
function checkPerms(hasPerms, checkedPerms, any) {
    if (any) {
        return checkedPerms.some(val => hasPerms.includes(val));
    }
    return checkedPerms.every(val => hasPerms.includes(val));
}

// user has all extra attributes and the attributes are the expect values
function checkExtra(user, extra, any) {
    if (!any) {
        return Object.entries(extra).some(entry => user.hasOwnProperty(entry[0]) && user[entry[0]] === entry[1])
    }
    return Object.entries(extra).every(entry => user.hasOwnProperty(entry[0]) && user[entry[0]] === entry[1])
}

export default function HasPermission(props) {
    return (
        <UserConsumer>
            {
                (User) => {
                    // admin
                    if (User && !props.checkAdmin && User.user.is_staff) {
                        return (
                            props.children
                        )
                    }

                    // check perms
                    const roles = User.user.roles;
                    if (roles.hasOwnProperty(props.id)) {
                        const hasPerms = roles[props.id].permissions;
                        // console.log(hasPerms)
                        if (checkPerms(hasPerms, props.nodes, props.any)) {
                            // if not extra return true
                            if (!props.extra || checkExtra(User.user, props.extra, props.any)) {
                                return props.children
                            }
                        }
                    }

                    // fallback
                    return (props.fallback)
                }
            }
        </UserConsumer>
    )
}