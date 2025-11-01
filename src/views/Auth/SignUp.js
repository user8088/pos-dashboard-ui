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
  FormErrorMessage,
  Select,
} from "@chakra-ui/react";
// Assets
import BgSignUp from "assets/img/BgSignUp.png";
import React, { useState } from "react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function SignUp() {
  const titleColor = useColorModeValue("brand.300", "brand.200");
  const textColor = useColorModeValue("gray.700", "white");
  const bgColor = useColorModeValue("white", "gray.700");
  const bgIcons = useColorModeValue("brand.200", "rgba(255, 255, 255, 0.5)");
  
  // State and hooks
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    user_type: "staff",
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
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
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Password confirmation is required";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        user_type: formData.user_type,
      });

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        history.push("/admin/dashboard");
      } else {
        // Handle validation errors from server
        if (result.errors) {
          setErrors(result.errors);
        }
        toast({
          title: "Registration Failed",
          description: result.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
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
          Use these awesome forms to login or create new account in your project
          for free.
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
            <FormControl isInvalid={errors.name}>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Name
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
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.email}>
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
                fontSize='sm'
                ms='4px'
                borderRadius='15px'
                type='password'
                placeholder='Your password'
                mb='24px'
                size='lg'
                required
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.password_confirmation}>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Confirm Password
              </FormLabel>
              <Input
                name="password_confirmation"
                value={formData.password_confirmation}
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
              <FormErrorMessage>{errors.password_confirmation}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={errors.user_type}>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                User Type
              </FormLabel>
              <Select
                name="user_type"
                value={formData.user_type}
                onChange={handleInputChange}
                fontSize='sm'
                ms='4px'
                borderRadius='15px'
                mb='24px'
                size='lg'
                required
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </Select>
              <FormErrorMessage>{errors.user_type}</FormErrorMessage>
            </FormControl>
            
            <FormControl display='flex' alignItems='center' mb='24px'>
              <Switch 
                id='remember-login' 
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
                colorScheme='brand' 
                me='10px' 
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
              loadingText="Signing up..."
              _hover={{
                bg: "brand.200",
              }}
              _active={{
                bg: "brand.400",
              }}>
              SIGN UP
            </Button>
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
                as={RouterLink}
                to="/auth/signin"
                color={titleColor}
                ms='5px'
                fontWeight='bold'>
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
