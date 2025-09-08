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
import { useHistory } from "react-router-dom";

const StoreSwitch = ({ backgroundImage, title, description }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const cardColor = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "inset 0px 4px 4px rgba(255, 255, 255, 0.05)"
  );
  const history = useHistory();

  const switchToStore = () => {
    history.push('/admin/dashboard');
  };

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
          bg={`linear-gradient(126.97deg, rgba(6, 11, 40, 0.74) 28.26%, rgba(10, 14, 35, 0.71) 91.2%), url(${backgroundImage})`}
          bgSize='cover'
          bgPosition='center'
          borderRadius='20px'
          direction='column'
          p={{ base: '16px', md: '20px', lg: '24px', xl: '40px' }}
          minH='400px'>
          <Spacer />
          <Flex
            bg='brand.500'
            color='white'
            flexDirection='column'
            justify='space-between'
            borderRadius='15px'
            width={{ lg: "100%" }}
            minHeight={{ sm: "200px" }}
            p={{ base: '22px', md: '28px' }}>
            <Flex direction='column' gap='10px'>
              <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: 'xl' }} fontWeight='extrabold' lineHeight='1.1'>
                {title}
              </Text>
              <Text fontSize={{ base: 'xs', sm: 'xs', md: 'sm', lg: 'sm' }} lineHeight='1.6' opacity={0.95}>
                {description}
              </Text>
            </Flex>
            <Button 
              p='0' 
              variant='no-hover' 
              bg='transparent' 
              alignSelf='flex-start'
              onClick={switchToStore}>
              <Text fontSize={{ base: 'xs', sm: 'xs', md: 'sm', lg: 'sm' }} fontWeight='bold' color='white'>
                Switch to Store Dashboard
              </Text>
              <Icon as={BsArrowRight} w={{ base: '14px', sm: '16px', md: '18px', lg: '18px' }} h={{ base: '14px', sm: '16px', md: '18px', lg: '18px' }} ms='10px' pt='2px' />
            </Button>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default StoreSwitch;
