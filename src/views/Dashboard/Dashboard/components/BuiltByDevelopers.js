// Chakra imports
import {
  Button,
  Flex,
  Icon,
  Spacer,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import React from "react";
// react icons
import { BsArrowRight } from "react-icons/bs";
import { useHistory, useLocation } from "react-router-dom";

const BuiltByDevelopers = ({ title, name, description, image }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const whiteCardTextColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const history = useHistory();
  const location = useLocation();
  
  const isFactoryDashboard = location.pathname.includes('/factory');
  
  const switchDashboard = () => {
    if (isFactoryDashboard) {
      history.push('/admin/dashboard');
    } else {
      history.push('/factory/dashboard');
    }
  };

  return (
    <Card minHeight='290.5px' p='1.2rem'>
      <CardBody w='100%'>
        <Flex flexDirection={{ sm: "column", lg: "row" }} w='100%' align='stretch' gap={{ sm: "20px", lg: "24px" }}>
          <Flex
            flexDirection='column'
            h='100%'
            lineHeight='1.6'
            width={{ lg: "45%" }}
            bg={isFactoryDashboard ? 'brand.500' : 'transparent'}
            color={isFactoryDashboard ? 'white' : textColor}
            borderRadius={isFactoryDashboard ? '15px' : '0px'}
            p={isFactoryDashboard ? { base: '22px', md: '28px' } : '0px'}
            transition='background-color 1.2s cubic-bezier(0.23, 1, 0.32, 1), padding 1.2s cubic-bezier(0.23, 1, 0.32, 1), border-radius 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
            <Text 
              fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'md' }} 
              color={isFactoryDashboard ? 'white' : 'gray.400'} 
              fontWeight='bold'
              transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
              {isFactoryDashboard ? 'You are viewing' : title}
            </Text>
            <Text 
              fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: 'xl' }} 
              color={isFactoryDashboard ? 'white' : textColor} 
              fontWeight={isFactoryDashboard ? 'extrabold' : 'bold'} 
              pb='.5rem'
              transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1), font-weight 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
              {isFactoryDashboard ? 'Factory Dashboard' : name}
            </Text>
            <Text 
              fontSize={{ base: 'sm', sm: 'md', md: 'lg', lg: 'lg' }} 
              color={isFactoryDashboard ? 'white' : 'gray.400'} 
              fontWeight='normal'
              opacity={isFactoryDashboard ? 0.95 : 1}
              transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1), opacity 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
              {description}
            </Text>
            <Spacer />
            <Flex align='center'>
              <Button
                p='0px'
                variant='no-hover'
                bg='transparent'
                my={{ sm: "1.5rem", lg: "0px" }}
                onClick={isFactoryDashboard ? switchDashboard : undefined}
                _hover={{ transform: 'translateY(-1px)' }}
                transition='transform 0.2s ease'>
                <Text
                  fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'md' }}
                  color={isFactoryDashboard ? 'white' : textColor}
                  fontWeight='bold'
                  cursor='pointer'
                  transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1)'
                  my={{ sm: "1.5rem", lg: "0px" }}
                  _hover={{ me: "4px" }}>
                  {isFactoryDashboard ? 'Switch to Store Dashboard' : 'Manage Staff'}
                </Text>
                <Icon
                  as={BsArrowRight}
                  w={{ base: '18px', sm: '20px', md: '22px', lg: '22px' }}
                  h={{ base: '18px', sm: '20px', md: '22px', lg: '22px' }}
                  fontSize='2xl'
                  transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1), transform 0.2s ease'
                  ms='8px'
                  cursor='pointer'
                  pt='2px'
                  color={isFactoryDashboard ? 'white' : textColor}
                  _hover={{ transform: "translateX(3px)" }}
                />
              </Button>
            </Flex>
          </Flex>
          <Spacer />
          <Flex
            bg={isFactoryDashboard ? cardBg : 'brand.500'}
            color={isFactoryDashboard ? whiteCardTextColor : 'white'}
            flexDirection='column'
            justify='space-between'
            borderRadius='15px'
            width={{ lg: "40%" }}
            minHeight={{ sm: "250px" }}
            p={{ base: '22px', md: '28px' }}
            transition='background-color 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
            <Flex direction='column' gap='10px'>
              <Text 
                fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'md' }} 
                fontWeight='bold'
                transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
                {isFactoryDashboard ? 'Switch to' : 'You are viewing'}
              </Text>
              <Text 
                fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: 'xl' }} 
                fontWeight='extrabold' 
                lineHeight='1.1'
                transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
                {isFactoryDashboard ? 'Store Dashboard' : 'Store Dashboard'}
              </Text>
              <Text 
                fontSize={{ base: 'xs', sm: 'xs', md: 'sm', lg: 'sm' }} 
                lineHeight='1.6' 
                opacity={0.95}
                transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
                {isFactoryDashboard ? 'Manage cash flow, track raw material usage, manage salaries and store related expenses.' : description}
              </Text>
            </Flex>
            <Button 
              p='0' 
              variant='no-hover' 
              bg='transparent' 
              alignSelf='flex-start' 
              onClick={switchDashboard}
              _hover={{ transform: 'translateY(-2px)', filter: 'brightness(1.1)' }}
              _active={{ transform: 'translateY(0px)' }}
              transition='transform 0.2s ease, filter 0.2s ease'>
              <Text 
                fontSize={{ base: 'xs', sm: 'xs', md: 'sm', lg: 'sm' }} 
                fontWeight='bold' 
                color={isFactoryDashboard ? whiteCardTextColor : 'white'}
                transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1)'>
                {isFactoryDashboard ? 'Go to Store Dashboard' : 'Switch to Factory Dashboard'}
              </Text>
              <Icon 
                as={BsArrowRight} 
                w={{ base: '14px', sm: '16px', md: '18px', lg: '18px' }} 
                h={{ base: '14px', sm: '16px', md: '18px', lg: '18px' }} 
                ms='10px' 
                pt='2px'
                color={isFactoryDashboard ? whiteCardTextColor : 'white'}
                transition='color 1.2s cubic-bezier(0.23, 1, 0.32, 1), transform 0.2s ease'
                _hover={{ transform: 'translateX(4px)' }}
              />
            </Button>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BuiltByDevelopers;