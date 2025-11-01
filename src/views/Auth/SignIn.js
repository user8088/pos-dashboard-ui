import React, { useState } from "react";
import { useHistory, Link as RouterLink } from "react-router-dom";
// Chakra imports
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Switch,
  Text,
  useColorModeValue,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
// Assets
import signInImage from "assets/img/signInImage.png";
import { useAuth } from "../../contexts/AuthContext";

function SignIn() {
  // Chakra color mode
  const titleColor = useColorModeValue("brand.500", "brand.200");
  const textColor = useColorModeValue("gray.400", "white");
  
  // State and hooks
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const history = useHistory();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Basic client-side validation
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : ""
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        toast({
          title: "Login Successful",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        history.push("/admin/dashboard");
      } else {
        // Handle field-specific errors
        if (result.errors) {
          setErrors(result.errors);
        }
        
        toast({
          title: "Login Failed",
          description: result.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex position='relative' mb='40px'>
      <Flex
        h={{ sm: "initial", md: "75vh", lg: "85vh" }}
        w='100%'
        maxW='1044px'
        mx='auto'
        justifyContent='space-between'
        mb='30px'
        pt={{ sm: "100px", md: "0px" }}>
        <Flex
          alignItems='center'
          justifyContent='start'
          style={{ userSelect: "none" }}
          w={{ base: "100%", md: "50%", lg: "42%" }}>
          <Flex
            direction='column'
            w='100%'
            background='transparent'
            p='48px'
            mt={{ md: "150px", lg: "80px" }}>
            <Heading color={titleColor} fontSize='32px' mb='10px'>
              Welcome Back
            </Heading>
            <Text
              mb='36px'
              ms='4px'
              color={textColor}
              fontWeight='bold'
              fontSize='14px'>
              Enter your email and password to sign in
            </Text>
            <form onSubmit={handleSubmit}>
              <FormControl isInvalid={errors.email}>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Email
                </FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  borderRadius='15px'
                  mb='24px'
                  fontSize='sm'
                  type='email'
                  placeholder='Your email address'
                  size='lg'
                  required
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.password}>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Password
                </FormLabel>
                <Input
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  borderRadius='15px'
                  mb='36px'
                  fontSize='sm'
                  type='password'
                  placeholder='Your password'
                  size='lg'
                  required
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <FormControl display='flex' alignItems='center'>
                <Switch 
                  id='remember-login' 
                  name="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  colorScheme='brand' 
                  me='10px' 
                />
                <FormLabel
                  htmlFor='remember-login'
                  mb='0'
                  ms='1'
                  fontWeight='normal'>
                  Remember me
                </FormLabel>
              </FormControl>
              
              <Button
                fontSize='10px'
                type='submit'
                bg='brand.300'
                w='100%'
                h='45'
                mb='20px'
                color='white'
                mt='20px'
                isLoading={isLoading}
                loadingText="Signing in..."
                _hover={{
                  bg: "brand.200",
                }}
                _active={{
                  bg: "brand.400",
                }}>
                SIGN IN
              </Button>
            </form>
            <Flex
              flexDirection='column'
              justifyContent='center'
              alignItems='center'
              maxW='100%'
              mt='0px'>
              <Text color={textColor} fontWeight='medium'>
                Don't have an account?
                <Link as={RouterLink} to="/auth/signup" color={titleColor} ms='5px' fontWeight='bold'>
                  Sign Up
                </Link>
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box
          display={{ base: "none", md: "block" }}
          overflowX='hidden'
          h='100%'
          w='40vw'
          position='absolute'
          right='0px'>
          <Box
            bgImage={signInImage}
            w='100%'
            h='100%'
            bgSize='cover'
            bgPosition='50%'
            position='absolute'
            borderBottomLeftRadius='20px'></Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default SignIn;
