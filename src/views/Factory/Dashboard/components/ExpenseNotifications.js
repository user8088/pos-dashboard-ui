// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Circle,
  Button,
  Icon,
  Box,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { BsArrowRight } from "react-icons/bs";

const ExpenseNotifications = () => {
  const textColor = useColorModeValue("gray.700", "white");
  const cardColor = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "inset 0px 4px 4px rgba(255, 255, 255, 0.05)"
  );

  const notifications = [
    {
      title: "PKR. 2400, Due Amount for Supplier A",
      time: "22 DEC 7:20 PM",
      color: "blue.400",
    },
    {
      title: "PKR. 2400, Due Amount for Bill B",
      time: "21 DEC 11:13 PM",
      color: "blue.400",
    },
    {
      title: "PKR. 2400, Due Amount for Supplier C",
      time: "21 DEC 9:28 PM",
      color: "blue.400",
    },
    {
      title: "PKR. 2400, Due Payment For Supplier",
      time: "20 DEC 2:20 PM",
      color: "blue.400",
    },
    {
      title: "PKR. 2400, Due Amount for Buyer E",
      time: "19 DEC 11:35 PM",
      color: "blue.400",
    },
    {
      title: "PKR. 2400, Due Amount for Stock F",
      time: "18 DEC 4:31 PM",
      color: "blue.400",
    },
  ];

  return (
    <Card
      bg={cardColor}
      boxShadow={cardShadow}
      borderRadius='20px'
      p='20px'
      w='100%'
      h='100%'>
      <CardHeader pb='0px'>
        <Flex direction='column' w='100%'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' mb='20px'>
            Expense Notifications
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <VStack spacing='20px' align='stretch'>
          {notifications.map((notification, index) => (
            <HStack key={index} spacing='15px' align='flex-start'>
              <Circle size='8px' bg={notification.color} mt='6px' />
              <Box flex='1'>
                <Text fontSize='sm' color={textColor} fontWeight='semibold' mb='5px'>
                  {notification.title}
                </Text>
                <Text fontSize='xs' color='gray.500'>
                  {notification.time}
                </Text>
              </Box>
            </HStack>
          ))}
        </VStack>
        
        {/* Manage Expenses Link */}
        <Flex justify='flex-start' mt='30px'>
          <Button p='0' variant='no-hover' bg='transparent'>
            <Text fontSize='sm' color={textColor} fontWeight='semibold'>
              Manage Expenses
            </Text>
            <Icon as={BsArrowRight} w='16px' h='16px' ms='8px' color={textColor} />
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ExpenseNotifications;
