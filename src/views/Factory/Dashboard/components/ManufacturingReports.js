// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Box,
  Icon,
  Button,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { BsArrowRight } from "react-icons/bs";
import BarChart from "components/Charts/BarChart";

const ManufacturingReports = () => {
  const textColor = useColorModeValue("gray.700", "white");
  const cardColor = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue(
    "0px 18px 40px rgba(112, 144, 176, 0.12)",
    "inset 0px 4px 4px rgba(255, 255, 255, 0.05)"
  );

  const reportData = [
    { label: "Top Product", value: "123,000 Units", subtext: "Copper Wires", color: "orange.400" },
    { label: "Top Value Category", value: "PKR.100,000", subtext: "Construction Materials", color: "orange.400" },
    { label: "Total Stock Value", value: "PKR.320,000", subtext: "(+23)", color: "orange.400" },
    { label: "Total Loss/Waste", value: "PKR.44,000", subtext: "Cement", color: "red.400" },
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
              Manufacturing Reports
            </Text>
            <Button p='0' variant='no-hover' bg='transparent'>
              <Text fontSize='sm' color='gray.500' fontWeight='semibold'>
                Weekly
              </Text>
            </Button>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        {/* Chart */}
        <Box bg='orange.400' borderRadius='15px' h='200px' mb='20px' position='relative'>
          <Flex
            position='absolute'
            top='20px'
            left='20px'
            direction='column'
            color='white'>
            <Text fontSize='xs' opacity={0.8}>Output By Product</Text>
          </Flex>
          <BarChart />
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={2} spacing='10px' mb='20px'>
          {reportData.map((item, index) => (
            <Box key={index} p='10px'>
              <Flex align='center' mb='5px'>
                <Box
                  w='8px'
                  h='8px'
                  borderRadius='50%'
                  bg={item.color}
                  mr='8px'
                />
                <Text fontSize='xs' color='gray.500' fontWeight='semibold'>
                  {item.label}
                </Text>
              </Flex>
              <Text fontSize='sm' color={textColor} fontWeight='bold' mb='2px'>
                {item.value}
              </Text>
              <Text fontSize='xs' color='gray.500'>
                {item.subtext}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Manage Production Link */}
        <Button p='0' variant='no-hover' bg='transparent' alignSelf='flex-start'>
          <Text fontSize='sm' color={textColor} fontWeight='semibold'>
            Manage Production
          </Text>
          <Icon as={BsArrowRight} w='16px' h='16px' ms='8px' color={textColor} />
        </Button>
      </CardBody>
    </Card>
  );
};

export default ManufacturingReports;
