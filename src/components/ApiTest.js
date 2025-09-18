import React, { useState } from 'react';
import { Box, Button, Text, VStack, Code, useToast } from '@chakra-ui/react';
import authService from 'services/authService';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const testApiConnection = async () => {
    setIsLoading(true);
    try {
      const result = await authService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "API Connection Successful",
          description: "Your Laravel API is responding correctly!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "API Connection Failed",
          description: result.error || "Could not connect to API",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold">API Connection Test</Text>
        
        <Button 
          onClick={testApiConnection} 
          isLoading={isLoading}
          colorScheme="blue"
        >
          Test API Connection
        </Button>
        
        {testResult && (
          <Box>
            <Text fontWeight="semibold" mb={2}>
              Result:
            </Text>
            <Code p={4} borderRadius="md" display="block" whiteSpace="pre-wrap">
              {JSON.stringify(testResult, null, 2)}
            </Code>
          </Box>
        )}
        
        <Text fontSize="sm" color="gray.600">
          API URL: {process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}
        </Text>
      </VStack>
    </Box>
  );
};

export default ApiTest;
