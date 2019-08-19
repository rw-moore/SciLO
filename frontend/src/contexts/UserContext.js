import React from "react";

/**
 * react Context for user data / token
 * @type {React.Context<{}>}
 */

const UserContext = React.createContext({});

export const UserProvider = UserContext.Provider;
export const UserConsumer = UserContext.Consumer;
