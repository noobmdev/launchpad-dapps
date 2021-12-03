import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { RouteTypes } from "routes";

export const CustomRoute = ({
  component: Component,
  type,
  location,
  ...rest
}) => {
  const { isConnected } = useActiveWeb3React();

  return (
    <Route
      {...rest}
      render={(props) =>
        type === RouteTypes.ONLY_PRIVATE ? (
          isConnected ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: "/",
                state: { prePath: location.pathname },
              }}
            />
          )
        ) : type === RouteTypes.ONLY_PUBLIC ? (
          !isConnected ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          )
        ) : (
          <Redirect
            to={{
              pathname: "/",
            }}
          />
        )
      }
    />
  );
};
