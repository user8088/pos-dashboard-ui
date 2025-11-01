import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Box } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width="100%"
      >
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth/signin" />;
  }

  return children;
};

export default ProtectedRoute;
