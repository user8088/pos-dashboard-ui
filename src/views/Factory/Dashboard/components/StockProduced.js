// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
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

const StockProduced = () => {
  const textColor = useColorModeValue("gray.700", "white");
  const cardColor = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "inset 0px 4px 4px rgba(255, 255, 255, 0.05)"
  );

  const stockData = [
    {
      company: "Copper Wires",
      stockProduced: "123,000 Units",
      manufactureCost: "PKR.30,000",
      manufactureLoss: "PKR. 5,000",
      stockValue: "PKR.50,000",
      icon: "🔧"
    },
    {
      company: "Cement Bags",
      stockProduced: "400 KGs",
      manufactureCost: "PKR.18,000",
      manufactureLoss: "PKR. 10,000",
      stockValue: "PKR.50,000",
      icon: "🏗️"
    },
    {
      company: "Sockets",
      stockProduced: "7000 Units",
      manufactureCost: "PKR.50,000",
      manufactureLoss: "PKR.11,000",
      stockValue: "PKR.50,000",
      icon: "🔌"
    },
    {
      company: "Rubber Tapes",
      stockProduced: "500 Units",
      manufactureCost: "PKR.20,000",
      manufactureLoss: "PKR. 4000",
      stockValue: "PKR.50,000",
      icon: "📏"
    },
    {
      company: "Nails",
      stockProduced: "30,000 Units",
      manufactureCost: "PKR.10,000",
      manufactureLoss: "PKR. 1000",
      stockValue: "PKR.50,000",
      icon: "🔨"
    },
    {
      company: "Screw Drivers",
      stockProduced: "2500 Units",
      manufactureCost: "PKR.45,000",
      manufactureLoss: "PKR. 15,000",
      stockValue: "PKR.50,000",
      icon: "🪛"
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
          <Flex justify='space-between' align='center' mb='20px'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Stock Produced
            </Text>
            <Text fontSize='sm' color='gray.500' fontWeight='semibold'>
              Last Extracted 7 hours ago
            </Text>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th color='gray.500' fontSize='xs' fontWeight='semibold'>
                  COMPANIES
                </Th>
                <Th color='gray.500' fontSize='xs' fontWeight='semibold'>
                  STOCK PRODUCED
                </Th>
                <Th color='gray.500' fontSize='xs' fontWeight='semibold'>
                  MANUFACTURE COST
                </Th>
                <Th color='gray.500' fontSize='xs' fontWeight='semibold'>
                  MANUFACTURE LOSS %
                </Th>
                <Th color='gray.500' fontSize='xs' fontWeight='semibold'>
                  STOCK VALUE
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {stockData.map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Flex align='center'>
                      <Box mr='10px' fontSize='lg'>
                        {item.icon}
                      </Box>
                      <Text fontSize='sm' color={textColor} fontWeight='semibold'>
                        {item.company}
                      </Text>
                    </Flex>
                  </Td>
                  <Td>
                    <Text fontSize='sm' color={textColor} fontWeight='semibold'>
                      {item.stockProduced}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm' color={textColor} fontWeight='semibold'>
                      {item.manufactureCost}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm' color={textColor} fontWeight='semibold'>
                      {item.manufactureLoss}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm' color={textColor} fontWeight='semibold'>
                      {item.stockValue}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        
        {/* Manage Production Link */}
        <Flex justify='flex-start' mt='20px'>
          <Button p='0' variant='no-hover' bg='transparent'>
            <Text fontSize='sm' color={textColor} fontWeight='semibold'>
              Manage Production
            </Text>
            <Icon as={BsArrowRight} w='16px' h='16px' ms='8px' color={textColor} />
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default StockProduced;
