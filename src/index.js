/*!

=========================================================
* POS MUGHAL SUPPLIERS - v1.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/purity-ui-dashboard
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/purity-ui-dashboard/blob/master/LICENSE.md)

* Design by Creative Tim & Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import AuthLayout from "layouts/Auth.js";
import AdminLayout from "layouts/Admin.js";
import RTLLayout from "layouts/RTL.js";
import FactoryLayout from "layouts/Factory.js";
import ProtectedRoute from "components/ProtectedRoute";

// Smart redirect component that checks authentication
const SmartRedirect = () => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  if (token && user) {
    // User is authenticated, redirect to their appropriate dashboard
    if (user.user_role === 'factory') {
      return <Redirect to="/factory/dashboard" />;
    } else {
      return <Redirect to="/admin/dashboard" />;
    }
  } else {
    // User is not authenticated, redirect to signin
    return <Redirect to="/auth/signin" />;
  }
};

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path={`/auth`} component={AuthLayout} />
      <ProtectedRoute path={`/admin`} component={AdminLayout} />
      <ProtectedRoute path={`/factory`} component={FactoryLayout} />
      <ProtectedRoute path={`/rtl`} component={RTLLayout} />
      <Route exact path="/" component={SmartRedirect} />
    </Switch>
  </HashRouter>,
  document.getElementById("root")
);
