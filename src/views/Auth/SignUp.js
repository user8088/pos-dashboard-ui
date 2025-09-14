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
  
  // State management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    userRole: "user",
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
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.userRole
      );
      
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: `Welcome, ${result.user.name}! Your account has been created.`,
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
          Welcome!
        </Text>
        <Text
          fontSize='md'
          color='white'
          fontWeight='normal'
          mt='10px'
          mb='26px'
          w={{ base: "90%", sm: "60%", lg: "40%", xl: "30%" }}>
          Create your account to access the POS dashboard system.
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
            Register With
          </Text>
          <HStack spacing='15px' justify='center' mb='22px'>
            <Flex
              justify='center'
              align='center'
              w='75px'
              h='75px'
              borderRadius='15px'
              border='1px solid lightgray'
              cursor='pointer'
              transition='all .25s ease'
              _hover={{ filter: "brightness(120%)", bg: bgIcons }}>
              <Link href='#'>
                <Icon
                  as={FaFacebook}
                  w='30px'
                  h='30px'
                  _hover={{ filter: "brightness(120%)" }}
                />
              </Link>
            </Flex>
            <Flex
              justify='center'
              align='center'
              w='75px'
              h='75px'
              borderRadius='15px'
              border='1px solid lightgray'
              cursor='pointer'
              transition='all .25s ease'
              _hover={{ filter: "brightness(120%)", bg: bgIcons }}>
              <Link href='#'>
                <Icon
                  as={FaApple}
                  w='30px'
                  h='30px'
                  _hover={{ filter: "brightness(120%)" }}
                />
              </Link>
            </Flex>
            <Flex
              justify='center'
              align='center'
              w='75px'
              h='75px'
              borderRadius='15px'
              border='1px solid lightgray'
              cursor='pointer'
              transition='all .25s ease'
              _hover={{ filter: "brightness(120%)", bg: bgIcons }}>
              <Link href='#'>
                <Icon
                  as={FaGoogle}
                  w='30px'
                  h='30px'
                  _hover={{ filter: "brightness(120%)" }}
                />
              </Link>
            </Flex>
          </HStack>
          <Text
            fontSize='lg'
            color='gray.400'
            fontWeight='bold'
            textAlign='center'
            mb='22px'>
            or
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
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="factory">Factory</option>
              </Select>
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
                placeholder='Your password (min 6 characters)'
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
              <FormControl display='flex' alignItems='center' mb='24px'>
                <Switch 
                  id='remember-login' 
                  colorScheme='brand' 
                  me='10px'
                  name="rememberMe"
                  isChecked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <FormLabel htmlFor='remember-login' mb='0' fontWeight='normal'>
                  Remember me
                </FormLabel>
              </FormControl>
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
                loadingText="Creating Account..."
                spinner={<Spinner size="sm" />}
                disabled={isLoading}
                _hover={{
                  bg: "brand.200",
                }}
                _active={{
                  bg: "brand.400",
                }}>
                SIGN UP
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
              Already have an account?
              <Link
                color={titleColor}
                as='span'
                ms='5px'
                fontWeight='bold'
                onClick={() => history.push('/auth/signin')}
                cursor="pointer">
                Sign In
              </Link>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SignUp;
