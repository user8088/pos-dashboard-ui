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
import { BsArrowRight } from "react-icons/bs";

const FactoryOverview = ({ title, name, description }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const cardColor = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "inset 0px 4px 4px rgba(255, 255, 255, 0.05)"
  );

  return (
    <Card
      bg={cardColor}
      boxShadow={cardShadow}
      borderRadius='20px'
      p='20px'
      align='center'
      direction='column'
      w='100%'
      h='100%'>
      <CardBody>
        <Flex
          bg='linear-gradient(126.97deg, #060C29 28.26%, rgba(4, 12, 48, 0.5) 91.2%)'
          borderRadius='20px'
          direction='column'
          p={{ base: '16px', md: '20px', lg: '24px', xl: '40px' }}
          minH='400px'>
          <Text
            fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
            color='gray.400'
            fontWeight='600'
            mb='6px'>
            {title}
          </Text>
          <Text
            fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
            color='white'
            fontWeight='bold'
            mb='20px'>
            Factory Dashboard
          </Text>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color='gray.400'
            fontWeight='400'
            mb='40px'>
            Manage cash flow, track raw material usage, manage salaries and store related expenses.
          </Text>
          <Spacer />
          <Button p='0' variant='no-hover' bg='transparent' alignSelf='flex-start'>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight='bold'
              color='white'>
              Manage Factory Staff
            </Text>
            <Icon
              as={BsArrowRight}
              w={{ base: '16px', md: '20px' }}
              h={{ base: '16px', md: '20px' }}
              ms='10px'
              color='white'
            />
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default FactoryOverview;
