// Chakra imports
import {
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Image,
  Flex,
  Badge,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";

const BestProducedMaterials = ({ timePeriod, customDateRange }) => {
  const textColor = useColorModeValue("gray.700", "white");

  // Dynamic data for best-produced materials based on time period
  const getMaterialsData = (period) => {
    const materialsDataMap = {
      "Today": [
        {
          id: 1,
          name: "Copper Wires",
          image: logo,
          production: "PKR.30,000",
          units: 123000,
          category: "Electrical"
        },
        {
          id: 2,
          name: "Cement Bags",
          image: logo,
          production: "PKR.18,000",
          units: 400,
          category: "Construction"
        },
        {
          id: 3,
          name: "Sockets",
          image: logo,
          production: "PKR.50,000",
          units: 7000,
          category: "Electrical"
        },
        {
          id: 4,
          name: "Rubber Tapes",
          image: logo,
          production: "PKR.20,000",
          units: 500,
          category: "Tools"
        },
        {
          id: 5,
          name: "Nails",
          image: logo,
          production: "PKR.10,000",
          units: 30000,
          category: "Hardware"
        }
      ],
      "Week": [
        {
          id: 1,
          name: "Copper Wires",
          image: logo,
          production: "PKR.210,000",
          units: 861000,
          category: "Electrical"
        },
        {
          id: 2,
          name: "Cement Bags",
          image: logo,
          production: "PKR.126,000",
          units: 2800,
          category: "Construction"
        },
        {
          id: 3,
          name: "Sockets",
          image: logo,
          production: "PKR.350,000",
          units: 49000,
          category: "Electrical"
        },
        {
          id: 4,
          name: "Rubber Tapes",
          image: logo,
          production: "PKR.140,000",
          units: 3500,
          category: "Tools"
        },
        {
          id: 5,
          name: "Nails",
          image: logo,
          production: "PKR.70,000",
          units: 210000,
          category: "Hardware"
        }
      ],
      "Month": [
        {
          id: 1,
          name: "Copper Wires",
          image: logo,
          production: "PKR.900,000",
          units: 3690000,
          category: "Electrical"
        },
        {
          id: 2,
          name: "Cement Bags",
          image: logo,
          production: "PKR.540,000",
          units: 12000,
          category: "Construction"
        },
        {
          id: 3,
          name: "Sockets",
          image: logo,
          production: "PKR.1,500,000",
          units: 210000,
          category: "Electrical"
        },
        {
          id: 4,
          name: "Rubber Tapes",
          image: logo,
          production: "PKR.600,000",
          units: 15000,
          category: "Tools"
        },
        {
          id: 5,
          name: "Nails",
          image: logo,
          production: "PKR.300,000",
          units: 900000,
          category: "Hardware"
        }
      ],
      "Seasonal": [
        {
          id: 1,
          name: "Copper Wires",
          image: logo,
          production: "PKR.30,000",
          units: 123000,
          category: "Electrical"
        },
        {
          id: 2,
          name: "Cement Bags",
          image: logo,
          production: "PKR.18,000",
          units: 400,
          category: "Construction"
        },
        {
          id: 3,
          name: "Sockets",
          image: logo,
          production: "PKR.50,000",
          units: 7000,
          category: "Electrical"
        },
        {
          id: 4,
          name: "Rubber Tapes",
          image: logo,
          production: "PKR.20,000",
          units: 500,
          category: "Tools"
        },
        {
          id: 5,
          name: "Nails",
          image: logo,
          production: "PKR.10,000",
          units: 30000,
          category: "Hardware"
        }
      ],
      "Year": [
        {
          id: 1,
          name: "Copper Wires",
          image: logo,
          production: "PKR.10,800,000",
          units: 44280000,
          category: "Electrical"
        },
        {
          id: 2,
          name: "Cement Bags",
          image: logo,
          production: "PKR.6,480,000",
          units: 144000,
          category: "Construction"
        },
        {
          id: 3,
          name: "Sockets",
          image: logo,
          production: "PKR.18,000,000",
          units: 2520000,
          category: "Electrical"
        },
        {
          id: 4,
          name: "Rubber Tapes",
          image: logo,
          production: "PKR.7,200,000",
          units: 180000,
          category: "Tools"
        },
        {
          id: 5,
          name: "Nails",
          image: logo,
          production: "PKR.3,600,000",
          units: 10800000,
          category: "Hardware"
        }
      ],
      "Custom date": [
        {
          id: 1,
          name: "Copper Wires",
          image: logo,
          production: "PKR.45,000",
          units: 184500,
          category: "Electrical"
        },
        {
          id: 2,
          name: "Cement Bags",
          image: logo,
          production: "PKR.27,000",
          units: 600,
          category: "Construction"
        },
        {
          id: 3,
          name: "Sockets",
          image: logo,
          production: "PKR.75,000",
          units: 10500,
          category: "Electrical"
        },
        {
          id: 4,
          name: "Rubber Tapes",
          image: logo,
          production: "PKR.30,000",
          units: 750,
          category: "Tools"
        },
        {
          id: 5,
          name: "Nails",
          image: logo,
          production: "PKR.15,000",
          units: 45000,
          category: "Hardware"
        }
      ]
    };
    
    return materialsDataMap[period] || materialsDataMap["Seasonal"];
  };

  const materialsData = getMaterialsData(timePeriod);

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Best produced materials list
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead>
            <Tr>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>#</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Materials</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Production Cost</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Units</Th>
            </Tr>
          </Thead>
          <Tbody>
            {materialsData.map((material, index) => (
              <Tr key={material.id}>
                <Td>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    {index + 1}
                  </Text>
                </Td>
                <Td>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap'>
                    <Image src={material.image} w='30px' h='30px' me='12px' objectFit='cover' />
                    <Flex direction='column'>
                      <Text fontSize='sm' color={textColor} fontWeight='bold' minWidth='100%'>
                        {material.name}
                      </Text>
                      <Text fontSize='xs' color='gray.400' fontWeight='medium'>
                        {material.category}
                      </Text>
                    </Flex>
                  </Flex>
                </Td>
                <Td>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    {material.production}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme='green' fontSize='12px' p='2px 8px' borderRadius='12px'>
                    {material.units.toLocaleString()} units
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default BestProducedMaterials;
