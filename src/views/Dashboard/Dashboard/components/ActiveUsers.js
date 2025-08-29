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
          <Flex direction='column' mt='24px' mb='26px' alignSelf='flex-start'>
            <Text fontSize='lg' color={textColor} fontWeight='bold' mb='6px'>
              {title}
            </Text>
            <Text fontSize='md' fontWeight='medium' color='gray.400'>
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
          <SimpleGrid gap={{ sm: "12px" }} columns={4}>
            <ChartStatistics
              title={"Top Product"}
              amount={"PKR. 82,984"}
              percentage={20}
              category={"Electric Drill"}
              icon={<WalletIcon h={"15px"} w={"15px"} color={iconBoxInside} />}
            />
            <ChartStatistics
              title={"Top Category"}
              amount={"PKR. 100,000"}
              percentage={20}
              category={"Construction Materials"}
              icon={<RocketIcon h={"15px"} w={"15px"} color={iconBoxInside} />}
            />
            <ChartStatistics
              title={"Total Profit"}
              amount={"PKR.320,000"}
              percentage={20}
              changeIndicator={"(+23) than last week"}
              changeType={"positive"}
              icon={<CartIcon h={"15px"} w={"15px"} color={iconBoxInside} />}
            />
            <ChartStatistics
              title={"Total Loss"}
              amount={"PKR.44,000"}
              percentage={20}
              changeIndicator={"(-10) than last week"}
              changeType={"negative"}
              icon={<StatsIcon h={"15px"} w={"15px"} color={iconBoxInside} />}
            />
          </SimpleGrid>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ActiveUsers;
