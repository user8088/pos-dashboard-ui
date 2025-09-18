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
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
} from "@chakra-ui/react";
import { FaSearch } from "react-icons/fa";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";

const BestSellingProducts = ({ timePeriod, customDateRange, productsData }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Format currency helper
  const formatCurrency = (amount) => {
    return `PKR. ${Number(amount || 0).toLocaleString()}`;
  };

  // Use API data only - no fallback data
  const getProcessedProductsData = () => {
    if (productsData && Array.isArray(productsData) && productsData.length > 0) {
      return productsData.map((item) => ({
        id: item.product_id || item.rank || Math.random(),
        name: item.product_name || "Unknown Product",
        image: logo,
        revenue: formatCurrency(item.total_revenue || 0),
        sales: item.total_sales || 0,
        category: item.category || "Uncategorized",
        rank: item.rank || 0
      }));
    }

    // No fallback - return empty array if no API data
    return [];
  };

  const processedData = getProcessedProductsData();

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm.trim()) return processedData;
    
    return processedData.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedData, searchTerm]);

  // Show empty state if no data
  if (!processedData || processedData.length === 0) {
    return (
      <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
        <CardHeader>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            Best selling products list
          </Text>
        </CardHeader>
        <CardBody>
          <Flex h='200px' w='100%' align='center' justify='center' direction='column'>
            <Text fontSize='md' color='gray.400' textAlign='center'>
              No product data available
            </Text>
          </Flex>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <VStack align='stretch' spacing='16px'>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
            Best selling products list
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <FaSearch color='gray.400' />
            </InputLeftElement>
            <Input
              placeholder='Search products or categories...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={useColorModeValue("gray.50", "gray.600")}
              border='1px solid'
              borderColor={useColorModeValue("gray.200", "gray.600")}
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px teal.500"
              }}
            />
          </InputGroup>
        </VStack>
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
            {filteredProducts.length === 0 && searchTerm.trim() ? (
              <Tr>
                <Td colSpan={4}>
                  <Flex h='100px' w='100%' align='center' justify='center'>
                    <Text fontSize='md' color='gray.400' textAlign='center'>
                      No products found matching "{searchTerm}"
                    </Text>
                  </Flex>
                </Td>
              </Tr>
            ) : (
              filteredProducts.map((product, index) => (
              <Tr key={product.id}>
                <Td>
                  <Text fontSize='sm' color={textColor} fontWeight='bold'>
                    {product.rank || index + 1}
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
              ))
            )}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default BestSellingProducts;
