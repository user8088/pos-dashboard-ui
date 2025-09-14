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

        // Check if user has access to admin routes
        if (rest.path?.startsWith('/admin')) {
          console.log('Checking admin access, user role:', user.user_role);
          if (user.user_role !== 'admin') {
            console.log('User is not admin, redirecting to signin');
            return <Redirect to="/auth/signin" />;
          }
        }

        // Check if user has access to factory routes
        if (rest.path?.startsWith('/factory')) {
          console.log('Checking factory access, user role:', user.user_role);
          if (user.user_role !== 'factory') {
            console.log('User is not factory, redirecting to signin');
            return <Redirect to="/auth/signin" />;
          }
        }

        console.log('Access granted, rendering component');
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;


