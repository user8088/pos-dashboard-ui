import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        
        console.log('ProtectedRoute check:');
        console.log('- Token exists:', !!token);
        console.log('- User exists:', !!user);
        console.log('- User:', user);
        console.log('- Current path:', props.location.pathname);
        console.log('- Route path:', rest.path);

        if (!token || !user) {
          console.log('No token or user, redirecting to signin');
          return <Redirect to="/auth/signin" />;
        }

        // Allow authenticated users to access both admin and factory routes
        // Users can switch between dashboards regardless of their role
        console.log('User is authenticated, allowing access to:', rest.path);
        console.log('User role:', user.user_role);

        console.log('Access granted, rendering component');
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;


