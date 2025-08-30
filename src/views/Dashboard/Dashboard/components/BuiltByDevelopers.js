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

const BuiltByDevelopers = ({ title, name, description, image }) => {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Card minHeight='290.5px' p='1.2rem'>
      <CardBody w='100%'>
        <Flex flexDirection={{ sm: "column", lg: "row" }} w='100%' align='stretch' gap={{ sm: "20px", lg: "24px" }}>
          <Flex
            flexDirection='column'
            h='100%'
            lineHeight='1.6'
            width={{ lg: "45%" }}>
            <Text fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'md' }} color='gray.400' fontWeight='bold'>
              {title}
            </Text>
                         <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: 'xl' }} color={textColor} fontWeight='bold' pb='.5rem'>
               {name}
             </Text>
                         <Text fontSize={{ base: 'sm', sm: 'md', md: 'lg', lg: 'lg' }} color='gray.400' fontWeight='normal'>
               {description}
             </Text>
            <Spacer />
            <Flex align='center'>
              <Button
                p='0px'
                variant='no-hover'
                bg='transparent'
                my={{ sm: "1.5rem", lg: "0px" }}>
                                 <Text
                   fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'md' }}
                   color={textColor}
                   fontWeight='bold'
                   cursor='pointer'
                   transition='all .5s ease'
                   my={{ sm: "1.5rem", lg: "0px" }}
                   _hover={{ me: "4px" }}>
                   Manage Staff
                 </Text>
                                 <Icon
                   as={BsArrowRight}
                   w={{ base: '18px', sm: '20px', md: '22px', lg: '22px' }}
                   h={{ base: '18px', sm: '20px', md: '22px', lg: '22px' }}
                   fontSize='2xl'
                   transition='all .5s ease'
                   ms='8px'
                   cursor='pointer'
                   pt='2px'
                   _hover={{ transform: "translateX(20%)" }}
                 />
              </Button>
            </Flex>
          </Flex>
          <Spacer />
          <Flex
            bg='brand.500'
            color='white'
            flexDirection='column'
            justify='space-between'
            borderRadius='15px'
            width={{ lg: "40%" }}
            minHeight={{ sm: "250px" }}
            p={{ base: '22px', md: '28px' }}>
            <Flex direction='column' gap='10px'>
              <Text fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'md' }} fontWeight='bold'>
                You are viewing
              </Text>
                             <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: 'xl' }} fontWeight='extrabold' lineHeight='1.1'>
                 Factory Dashboard
               </Text>
                             <Text fontSize={{ base: 'xs', sm: 'xs', md: 'sm', lg: 'sm' }} lineHeight='1.6' opacity={0.95}>
                 {description}
               </Text>
            </Flex>
            <Button p='0' variant='no-hover' bg='transparent' alignSelf='flex-start'>
                             <Text fontSize={{ base: 'xs', sm: 'xs', md: 'sm', lg: 'sm' }} fontWeight='bold' color='white'>
                 Switch to Factory Dashboard
               </Text>
                             <Icon as={BsArrowRight} w={{ base: '14px', sm: '16px', md: '18px', lg: '18px' }} h={{ base: '14px', sm: '16px', md: '18px', lg: '18px' }} ms='10px' pt='2px' />
            </Button>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BuiltByDevelopers;
