// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  Box,
  Button,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import LineChart from "components/Charts/LineChart";

const ProductionChart = () => {
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
      w='100%'
      h='100%'>
      <CardHeader pb='0px'>
        <Flex direction='column' w='100%'>
          <Flex justify='space-between' align='center' mb='20px'>
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Production overview
            </Text>
            <Button p='0' variant='no-hover' bg='transparent'>
              <Text fontSize='sm' color='gray.500' fontWeight='semibold'>
                Yearly
              </Text>
            </Button>
          </Flex>
          <Text fontSize='sm' color='green.400' fontWeight='semibold' mb='2px'>
            (+5) more in 2021
          </Text>
        </Flex>
      </CardHeader>
      <CardBody>
        {/* Production Chart */}
        <Box position='relative' h='300px'>
          <LineChart />
        </Box>
      </CardBody>
    </Card>
  );
};

export default ProductionChart;
