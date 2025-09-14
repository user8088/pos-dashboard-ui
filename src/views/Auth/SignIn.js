import React, { useState } from "react";
import { useHistory } from "react-router-dom";
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
  Spinner,
} from "@chakra-ui/react";
// Assets
import signInImage from "assets/img/signInImage.png";
import authService from "services/authService";

function SignIn() {
  const history = useHistory();
  const toast = useToast();
  
  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Chakra color mode
  const titleColor = useColorModeValue("brand.500", "brand.200");
  const textColor = useColorModeValue("gray.400", "white");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.login(formData.email, formData.password);
      
      console.log('Login result:', result); // Debug log
      
      if (result.success) {
        // Check what's in localStorage
        console.log('Token in localStorage:', localStorage.getItem('token'));
        console.log('User in localStorage:', localStorage.getItem('user'));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.name}!`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        
        // Navigate immediately without timeout
        const redirectPath = result.user.user_role === 'admin' ? '/admin/dashboard' 
                           : result.user.user_role === 'factory' ? '/factory/dashboard' 
                           : '/admin/dashboard';
        
        console.log('Redirecting to:', redirectPath); // Debug log
        console.log('User role:', result.user.user_role); // Debug log
        
        history.push(redirectPath);
        
      } else {
        toast({
          title: "Login Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
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
              <FormControl>
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
                <FormControl display='flex' alignItems='center'>
                  <Switch 
                    id='remember-login' 
                    colorScheme='brand' 
                    me='10px'
                    name="rememberMe"
                    isChecked={formData.rememberMe}
                    onChange={handleInputChange}
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
                  loadingText="Signing In..."
                  spinner={<Spinner size="sm" />}
                  disabled={isLoading}
                  _hover={{
                    bg: "brand.200",
                  }}
                  _active={{
                    bg: "brand.400",
                  }}>
                  SIGN IN
                </Button>
              </FormControl>
            </form>
            <Flex
              flexDirection='column'
              justifyContent='center'
              alignItems='center'
              maxW='100%'
              mt='0px'>
              <Text color={textColor} fontWeight='medium'>
                Don't have an account?
                <Link 
                  color={titleColor} 
                  as='span' 
                  ms='5px' 
                  fontWeight='bold'
                  onClick={() => history.push('/auth/signup')}
                  cursor="pointer">
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
