// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Link,
  Switch,
  Text,
  useColorModeValue,
  useToast,
  Spinner,
  Select,
} from "@chakra-ui/react";
// Assets
import BgSignUp from "assets/img/BgSignUp.png";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import authService from "services/authService";

function SignUp() {
  const history = useHistory();
  const toast = useToast();
  
  // Check if user is admin - this page is admin-only
  React.useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        history.push('/auth/signin');
        return;
      }
      
      if (user.user_role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Only administrators can create new users.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        history.push('/admin/dashboard');
        return;
      }
    } catch (error) {
      console.error('Failed to verify user role:', error);
      history.push('/auth/signin');
    }
  }, [history, toast]);
  
  // State management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    userRole: "staff",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const titleColor = useColorModeValue("brand.300", "brand.200");
  const textColor = useColorModeValue("gray.700", "white");
  const bgColor = useColorModeValue("white", "gray.700");
  const bgIcons = useColorModeValue("brand.200", "rgba(255, 255, 255, 0.5)");

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
    
    // Validate passwords match
    if (formData.password !== formData.passwordConfirmation) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store current admin's token to restore after registration
      const currentToken = localStorage.getItem('token');
      const currentUserString = localStorage.getItem('user');
      
      const result = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.userRole
      );
      
      if (result.success) {
        // Restore admin's token (don't login as the new user)
        localStorage.setItem('token', currentToken);
        localStorage.setItem('user', currentUserString);
        
        toast({
          title: "User Created Successfully",
          description: `${result.user.name} has been added as a ${formData.userRole}.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          passwordConfirmation: "",
          userRole: "staff",
          rememberMe: false,
        });
        
        // Optionally redirect to user management
        // history.push('/admin/user-management');
        
      } else {
        toast({
          title: "Registration Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
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
    <Flex
      direction='column'
      alignSelf='center'
      justifySelf='center'
      overflow='hidden'>
      <Box
        position='absolute'
        minH={{ base: "70vh", md: "50vh" }}
        w={{ md: "calc(100vw - 50px)" }}
        borderRadius={{ md: "15px" }}
        left='0'
        right='0'
        bgRepeat='no-repeat'
        overflow='hidden'
        zIndex='-1'
        top='0'
        bgImage={BgSignUp}
        bgSize='cover'
        mx={{ md: "auto" }}
        mt={{ md: "14px" }}></Box>
      <Flex
        direction='column'
        textAlign='center'
        justifyContent='center'
        align='center'
        mt='6.5rem'
        mb='30px'>
        <Text fontSize='4xl' color='white' fontWeight='bold'>
          Create New User
        </Text>
        <Text
          fontSize='md'
          color='white'
          fontWeight='normal'
          mt='10px'
          mb='26px'
          w={{ base: "90%", sm: "60%", lg: "40%", xl: "30%" }}>
          Admin Only: Add new users to the POS dashboard system.
        </Text>
      </Flex>
      <Flex alignItems='center' justifyContent='center' mb='60px' mt='20px'>
        <Flex
          direction='column'
          w='445px'
          background='transparent'
          borderRadius='15px'
          p='40px'
          mx={{ base: "100px" }}
          bg={bgColor}
          boxShadow='0 20px 27px 0 rgb(0 0 0 / 5%)'>
          <Text
            fontSize='xl'
            color={textColor}
            fontWeight='bold'
            textAlign='center'
            mb='22px'>
            Create User Account
          </Text>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Full Name
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fontSize='sm'
                ms='4px'
                borderRadius='15px'
                type='text'
                placeholder='Your full name'
                mb='24px'
                size='lg'
                required
              />
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Email
              </FormLabel>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fontSize='sm'
                ms='4px'
                borderRadius='15px'
                type='email'
                placeholder='Your email address'
                mb='24px'
                size='lg'
                required
              />
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                User Role
              </FormLabel>
              <Select
                name="userRole"
                value={formData.userRole}
                onChange={handleInputChange}
                fontSize='sm'
                ms='4px'
                borderRadius='15px'
                mb='24px'
                size='lg'>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
              <Text fontSize='xs' color='gray.400' ms='4px' mb='16px'>
                Admin: Full access. Staff: Limited access (no user management, expenses, or transactions)
              </Text>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Password
              </FormLabel>
              <Input
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                fontSize='sm'
                ms='4px'
                borderRadius='15px'
                type='password'
                placeholder='Your password (min 8 characters)'
                mb='24px'
                size='lg'
                required
              />
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Confirm Password
              </FormLabel>
              <Input
                name="passwordConfirmation"
                value={formData.passwordConfirmation}
                onChange={handleInputChange}
                fontSize='sm'
                ms='4px'
                borderRadius='15px'
                type='password'
                placeholder='Confirm your password'
                mb='24px'
                size='lg'
                required
              />
              <Button
                type='submit'
                bg='brand.300'
                fontSize='10px'
                color='white'
                fontWeight='bold'
                w='100%'
                h='45'
                mb='24px'
                isLoading={isLoading}
                loadingText="Creating User..."
                spinner={<Spinner size="sm" />}
                disabled={isLoading}
                _hover={{
                  bg: "brand.200",
                }}
                _active={{
                  bg: "brand.400",
                }}>
                CREATE USER
              </Button>
            </FormControl>
          </form>
          <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            maxW='100%'
            mt='0px'>
            <Button
              variant='outline'
              colorScheme='brand'
              w='100%'
              onClick={() => history.push('/admin/user-management')}
              size='sm'>
              Go to User Management
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SignUp;
