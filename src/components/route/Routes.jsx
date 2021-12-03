import { Layout } from "components/layouts/Layout";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { routes } from "routes";

export const Routes = () => {
  return (
    <Router>
      <Layout>
        <Switch>
          {routes.map(({ path, component, exact }, idx) => (
            <Route key={idx} path={path} component={component} exact={exact} />
          ))}
        </Switch>
      </Layout>
    </Router>
  );
};
