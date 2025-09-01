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

const BestSellingProducts = ({ timePeriod, customDateRange }) => {
  const textColor = useColorModeValue("gray.700", "white");

  // Dynamic data for best-selling products based on time period
  const getProductsData = (period) => {
    const productsDataMap = {
      "Today": [
        {
          id: 1,
          name: "Electric Drill",
          image: logo,
          revenue: "PKR.20,000",
          sales: 195,
          category: "Tools & Hardware"
        },
        {
          id: 2,
          name: "Electric Ranch",
          image: logo,
          revenue: "PKR.20,000",
          sales: 90,
          category: "Electrical Accessories"
        },
        {
          id: 3,
          name: "Rubber Hammer",
          image: logo,
          revenue: "PKR.20,000",
          sales: 330,
          category: "Tools & Hardware"
        },
        {
          id: 4,
          name: "Electric Multi Tool",
          image: logo,
          revenue: "PKR.20,000",
          sales: 56,
          category: "Electrical Accessories"
        },
        {
          id: 5,
          name: "Steel Hammer",
          image: logo,
          revenue: "PKR.20,000",
          sales: 35,
          category: "Tools & Hardware"
        }
      ],
      "Week": [
        {
          id: 1,
          name: "Electric Drill",
          image: logo,
          revenue: "PKR.85,000",
          sales: 850,
          category: "Tools & Hardware"
        },
        {
          id: 2,
          name: "Electric Ranch",
          image: logo,
          revenue: "PKR.65,000",
          sales: 650,
          category: "Electrical Accessories"
        },
        {
          id: 3,
          name: "Rubber Hammer",
          image: logo,
          revenue: "PKR.120,000",
          sales: 1200,
          category: "Tools & Hardware"
        },
        {
          id: 4,
          name: "Electric Multi Tool",
          image: logo,
          revenue: "PKR.45,000",
          sales: 450,
          category: "Electrical Accessories"
        },
        {
          id: 5,
          name: "Steel Hammer",
          image: logo,
          revenue: "PKR.35,000",
          sales: 350,
          category: "Tools & Hardware"
        }
      ],
      "Month": [
        {
          id: 1,
          name: "Electric Drill",
          image: logo,
          revenue: "PKR.320,000",
          sales: 3200,
          category: "Tools & Hardware"
        },
        {
          id: 2,
          name: "Electric Ranch",
          image: logo,
          revenue: "PKR.280,000",
          sales: 2800,
          category: "Electrical Accessories"
        },
        {
          id: 3,
          name: "Rubber Hammer",
          image: logo,
          revenue: "PKR.450,000",
          sales: 4500,
          category: "Tools & Hardware"
        },
        {
          id: 4,
          name: "Electric Multi Tool",
          image: logo,
          revenue: "PKR.180,000",
          sales: 1800,
          category: "Electrical Accessories"
        },
        {
          id: 5,
          name: "Steel Hammer",
          image: logo,
          revenue: "PKR.150,000",
          sales: 1500,
          category: "Tools & Hardware"
        }
      ],
      "Business Season": [
        {
          id: 1,
          name: "Electric Drill",
          image: logo,
          revenue: "PKR.850,000",
          sales: 8500,
          category: "Tools & Hardware"
        },
        {
          id: 2,
          name: "Electric Ranch",
          image: logo,
          revenue: "PKR.720,000",
          sales: 7200,
          category: "Electrical Accessories"
        },
        {
          id: 3,
          name: "Rubber Hammer",
          image: logo,
          revenue: "PKR.1,200,000",
          sales: 12000,
          category: "Tools & Hardware"
        },
        {
          id: 4,
          name: "Electric Multi Tool",
          image: logo,
          revenue: "PKR.480,000",
          sales: 4800,
          category: "Electrical Accessories"
        },
        {
          id: 5,
          name: "Steel Hammer",
          image: logo,
          revenue: "PKR.380,000",
          sales: 3800,
          category: "Tools & Hardware"
        }
      ],
      "Year": [
        {
          id: 1,
          name: "Electric Drill",
          image: logo,
          revenue: "PKR.2,850,000",
          sales: 28500,
          category: "Tools & Hardware"
        },
        {
          id: 2,
          name: "Electric Ranch",
          image: logo,
          revenue: "PKR.2,400,000",
          sales: 24000,
          category: "Electrical Accessories"
        },
        {
          id: 3,
          name: "Rubber Hammer",
          image: logo,
          revenue: "PKR.4,200,000",
          sales: 42000,
          category: "Tools & Hardware"
        },
        {
          id: 4,
          name: "Electric Multi Tool",
          image: logo,
          revenue: "PKR.1,800,000",
          sales: 18000,
          category: "Electrical Accessories"
        },
        {
          id: 5,
          name: "Steel Hammer",
          image: logo,
          revenue: "PKR.1,500,000",
          sales: 15000,
          category: "Tools & Hardware"
        }
      ],
      "Custom date": [
        {
          id: 1,
          name: "Electric Drill",
          image: logo,
          revenue: "PKR.45,000",
          sales: 450,
          category: "Tools & Hardware"
        },
        {
          id: 2,
          name: "Electric Ranch",
          image: logo,
          revenue: "PKR.38,000",
          sales: 380,
          category: "Electrical Accessories"
        },
        {
          id: 3,
          name: "Rubber Hammer",
          image: logo,
          revenue: "PKR.65,000",
          sales: 650,
          category: "Tools & Hardware"
        },
        {
          id: 4,
          name: "Electric Multi Tool",
          image: logo,
          revenue: "PKR.28,000",
          sales: 280,
          category: "Electrical Accessories"
        },
        {
          id: 5,
          name: "Steel Hammer",
          image: logo,
          revenue: "PKR.22,000",
          sales: 220,
          category: "Tools & Hardware"
        }
      ]
    };
    
    return productsDataMap[period] || productsDataMap["Today"];
  };

  const productsData = getProductsData(timePeriod);

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <Text fontSize='lg' color={textColor} fontWeight='bold'>
          Best selling products list
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead>
            <Tr>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>#</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Products</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Revenue</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Sales</Th>
            </Tr>
          </Thead>
          <Tbody>
            {productsData.map((product, index) => (
              <Tr key={product.id}>
                <Td>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    {index + 1}
                  </Text>
                </Td>
                <Td>
                  <Flex align='center' py='.8rem' minWidth='100%' flexWrap='nowrap'>
                    <Image src={product.image} w='30px' h='30px' me='12px' objectFit='cover' />
                    <Flex direction='column'>
                      <Text fontSize='sm' color={textColor} fontWeight='bold' minWidth='100%'>
                        {product.name}
                      </Text>
                      <Text fontSize='xs' color='gray.400' fontWeight='medium'>
                        {product.category}
                      </Text>
                    </Flex>
                  </Flex>
                </Td>
                <Td>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    {product.revenue}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme='green' fontSize='12px' p='2px 8px' borderRadius='12px'>
                    {product.sales} sales
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

export default BestSellingProducts;
