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

const TopManufacturingCategories = ({ timePeriod, customDateRange }) => {
  const textColor = useColorModeValue("gray.700", "white");

  // Dynamic data for top manufacturing categories based on time period
  const getCategoriesData = (period) => {
    const categoriesDataMap = {
      "Today": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          production: "PKR.85,000",
          units: 195000,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          production: "PKR.80,000",
          units: 130000,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          production: "PKR.70,000",
          units: 57000,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          production: "PKR.30,000",
          units: 30500,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          production: "PKR.25,000",
          units: 35000,
          description: "PVC materials and piping systems"
        }
      ],
      "Week": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          production: "PKR.595,000",
          units: 1365000,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          production: "PKR.560,000",
          units: 910000,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          production: "PKR.490,000",
          units: 399000,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          production: "PKR.210,000",
          units: 213500,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          production: "PKR.175,000",
          units: 245000,
          description: "PVC materials and piping systems"
        }
      ],
      "Month": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          production: "PKR.2,550,000",
          units: 5850000,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          production: "PKR.2,400,000",
          units: 3900000,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          production: "PKR.2,100,000",
          units: 1710000,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          production: "PKR.900,000",
          units: 915000,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          production: "PKR.750,000",
          units: 1050000,
          description: "PVC materials and piping systems"
        }
      ],
      "Seasonal": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          production: "PKR.85,000",
          units: 195000,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          production: "PKR.80,000",
          units: 130000,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          production: "PKR.70,000",
          units: 57000,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          production: "PKR.30,000",
          units: 30500,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          production: "PKR.25,000",
          units: 35000,
          description: "PVC materials and piping systems"
        }
      ],
      "Year": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          production: "PKR.30,600,000",
          units: 70200000,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          production: "PKR.28,800,000",
          units: 46800000,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          production: "PKR.25,200,000",
          units: 20520000,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          production: "PKR.10,800,000",
          units: 10980000,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          production: "PKR.9,000,000",
          units: 12600000,
          description: "PVC materials and piping systems"
        }
      ],
      "Custom date": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          production: "PKR.127,500",
          units: 292500,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          production: "PKR.120,000",
          units: 195000,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          production: "PKR.105,000",
          units: 85500,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          production: "PKR.45,000",
          units: 45750,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          production: "PKR.37,500",
          units: 52500,
          description: "PVC materials and piping systems"
        }
      ]
    };
    
    return categoriesDataMap[period] || categoriesDataMap["Seasonal"];
  };

  const categoriesData = getCategoriesData(timePeriod);

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Top manufacturing categories list
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead>
            <Tr>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>#</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Categories</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Production Cost</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Units</Th>
            </Tr>
          </Thead>
          <Tbody>
            {categoriesData.map((category, index) => (
              <Tr key={category.id}>
                <Td>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    {index + 1}
                  </Text>
                </Td>
                <Td>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap'>
                    <Image src={category.image} w='30px' h='30px' me='12px' objectFit='cover' />
                    <Flex direction='column'>
                      <Text fontSize='sm' color={textColor} fontWeight='bold' minWidth='100%'>
                        {category.name}
                      </Text>
                      <Text fontSize='xs' color='gray.400' fontWeight='medium'>
                        {category.description}
                      </Text>
                    </Flex>
                  </Flex>
                </Td>
                <Td>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    {category.production}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme='blue' fontSize='12px' p='2px 8px' borderRadius='12px'>
                    {category.units.toLocaleString()} units
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

export default TopManufacturingCategories;
