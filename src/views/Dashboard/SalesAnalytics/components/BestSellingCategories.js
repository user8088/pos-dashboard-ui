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

const BestSellingCategories = ({ timePeriod, customDateRange }) => {
  const textColor = useColorModeValue("gray.700", "white");

  // Dynamic data for best-selling categories based on time period
  const getCategoriesData = (period) => {
    const categoriesDataMap = {
      "Today": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          revenue: "PKR.20,000",
          sales: 195,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          revenue: "PKR.20,000",
          sales: 90,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          revenue: "PKR.20,000",
          sales: 330,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          revenue: "PKR.20,000",
          sales: 56,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          revenue: "PKR.20,000",
          sales: 35,
          description: "PVC materials and piping systems"
        }
      ],
      "Week": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          revenue: "PKR.85,000",
          sales: 850,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          revenue: "PKR.65,000",
          sales: 650,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          revenue: "PKR.120,000",
          sales: 1200,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          revenue: "PKR.45,000",
          sales: 450,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          revenue: "PKR.35,000",
          sales: 350,
          description: "PVC materials and piping systems"
        }
      ],
      "Month": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          revenue: "PKR.320,000",
          sales: 3200,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          revenue: "PKR.280,000",
          sales: 2800,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          revenue: "PKR.450,000",
          sales: 4500,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          revenue: "PKR.180,000",
          sales: 1800,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          revenue: "PKR.150,000",
          sales: 1500,
          description: "PVC materials and piping systems"
        }
      ],
      "Business Season": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          revenue: "PKR.850,000",
          sales: 8500,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          revenue: "PKR.720,000",
          sales: 7200,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          revenue: "PKR.1,200,000",
          sales: 12000,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          revenue: "PKR.480,000",
          sales: 4800,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          revenue: "PKR.380,000",
          sales: 3800,
          description: "PVC materials and piping systems"
        }
      ],
      "Year": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          revenue: "PKR.2,850,000",
          sales: 28500,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          revenue: "PKR.2,400,000",
          sales: 24000,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          revenue: "PKR.4,200,000",
          sales: 42000,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          revenue: "PKR.1,800,000",
          sales: 18000,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          revenue: "PKR.1,500,000",
          sales: 15000,
          description: "PVC materials and piping systems"
        }
      ],
      "Custom date": [
        {
          id: 1,
          name: "Construction Materials",
          image: logo,
          revenue: "PKR.45,000",
          sales: 450,
          description: "Building and construction supplies"
        },
        {
          id: 2,
          name: "Electrical Accessories",
          image: logo,
          revenue: "PKR.38,000",
          sales: 380,
          description: "Electrical components and tools"
        },
        {
          id: 3,
          name: "Sanitary Materials",
          image: logo,
          revenue: "PKR.65,000",
          sales: 650,
          description: "Plumbing and sanitary supplies"
        },
        {
          id: 4,
          name: "Tools & Hardware",
          image: logo,
          revenue: "PKR.28,000",
          sales: 280,
          description: "Hand tools and hardware items"
        },
        {
          id: 5,
          name: "PVC & Pipes",
          image: logo,
          revenue: "PKR.22,000",
          sales: 220,
          description: "PVC materials and piping systems"
        }
      ]
    };
    
    return categoriesDataMap[period] || categoriesDataMap["Today"];
  };

  const categoriesData = getCategoriesData(timePeriod);

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Best selling categories list
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead>
            <Tr>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>#</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Categories</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Revenue</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Sales</Th>
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
                    {category.revenue}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme='blue' fontSize='12px' p='2px 8px' borderRadius='12px'>
                    {category.sales} sales
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

export default BestSellingCategories;
