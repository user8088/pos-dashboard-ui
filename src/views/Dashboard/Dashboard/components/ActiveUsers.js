// Chakra imports
import { Button, Flex, Icon, SimpleGrid, Text, useColorModeValue  } from "@chakra-ui/react";
import { BsArrowRight } from "react-icons/bs";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
// Custom icons
import {
  CartIcon,
  RocketIcon,
  StatsIcon,
  WalletIcon,
} from "components/Icons/Icons.js";
import React from "react";
import ChartStatistics from "./ChartStatistics";

const ActiveUsers = ({ title, percentage, chart }) => {
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  return (
    <Card p='16px'>
      <CardBody>
        <Flex direction='column' w='100%'>
          {chart}
          <Flex direction='column' mt={{ base: '20px', sm: '22px', md: '24px' }} mb={{ base: '20px', sm: '24px', md: '26px' }} alignSelf='flex-start'>
            <Text 
              fontSize={{ base: 'md', sm: 'lg', md: 'lg' }} 
              color={textColor} 
              fontWeight='bold' 
              mb={{ base: '4px', sm: '5px', md: '6px' }}
            >
              {title}
            </Text>
            <Text 
              fontSize={{ base: 'sm', sm: 'md', md: 'md' }} 
              fontWeight='medium' 
              color='gray.400'
            >
              <Text
                as='span'
                color={percentage > 0 ? "#FF8D28" : "red.400"}
                fontWeight='bold'>
                {percentage > 0 ? `+${percentage}%` : `-${percentage}%`}
              </Text>{" "}
              than last week
            </Text>
            <Flex align='center'>
              <Button
                p='0px'
                variant='no-hover'
                bg='transparent'
                my={{ sm: "1.5rem", lg: "0px" }}>
                <Text
                  fontSize='sm'
                  color={textColor}
                  fontWeight='bold'
                  cursor='pointer'
                  transition='all .5s ease'
                  my={{ sm: "1.5rem", lg: "0px" }}
                  _hover={{ me: "4px" }}>
                  Manage Analytics
                </Text>
                <Icon
                  as={BsArrowRight}
                  w='20px'
                  h='20px'
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
                                           <SimpleGrid 
              gap={{ base: "8px", sm: "10px", md: "12px", lg: "20px" }} 
              columns={{ base: 2, sm: 2, md: 2, lg: 4 }}
              spacing={{ base: "8px", sm: "10px", md: "12px", lg: "20px" }}
            >
            <ChartStatistics
              title={"Top Product"}
              amount={"PKR. 82,984"}
              percentage={20}
              category={"Electric Drill"}
                             icon={<WalletIcon h={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} w={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} color={iconBoxInside} />}
             />
             <ChartStatistics
               title={"Top Category"}
               amount={"PKR. 100,000"}
               percentage={20}
               category={"Construction Materials"}
               icon={<RocketIcon h={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} w={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} color={iconBoxInside} />}
             />
             <ChartStatistics
               title={"Total Profit"}
               amount={"PKR.320,000"}
               percentage={20}
               changeIndicator={"(+23) than last week"}
               changeType={"positive"}
               icon={<CartIcon h={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} w={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} color={iconBoxInside} />}
             />
             <ChartStatistics
               title={"Total Loss"}
               amount={"PKR.44,000"}
               percentage={20}
               changeIndicator={"(-10) than last week"}
               changeType={"negative"}
               icon={<StatsIcon h={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} w={{ base: "12px", sm: "13px", md: "15px", lg: "16px" }} color={iconBoxInside} />}
            />
          </SimpleGrid>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ActiveUsers;
