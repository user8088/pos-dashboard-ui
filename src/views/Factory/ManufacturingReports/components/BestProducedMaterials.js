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

const BestProducedMaterials = ({ timePeriod, customDateRange, data = [] }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [stockItems, setStockItems] = React.useState([]);
  const [isLoadingStock, setIsLoadingStock] = React.useState(true);

  // Fetch stock items (produced materials)
  const fetchStockItems = async () => {
    try {
      setIsLoadingStock(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const stockData = await response.json();
        setStockItems(stockData);
      } else {
        setStockItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch stock items:', error);
      setStockItems([]);
    } finally {
      setIsLoadingStock(false);
    }
  };

  React.useEffect(() => {
    fetchStockItems();
  }, []);

  // Process stock items for materials table
  const getProcessedMaterialsData = () => {
    if (!stockItems || stockItems.length === 0) return [];
    
    return stockItems.map((item, index) => ({
      id: item.item_id,
      name: item.item_name,
      image: logo,
      production: item.stock_value ? `PKR.${parseFloat(item.stock_value).toLocaleString()}` : 'PKR.0',
      units: parseFloat(item.quantity_per_unit) || 0,
      category: item.category?.category_name || 'Uncategorized',
      unit: item.unit?.unit_name || 'units'
    }));
  };

  const materialsData = getProcessedMaterialsData();

  // Filter materials based on search term
  const filteredMaterials = React.useMemo(() => {
    if (!searchTerm) return materialsData;
    return materialsData.filter(material =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.unit.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materialsData, searchTerm]);

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <VStack spacing="16px" align="stretch">
          <Flex direction="column">
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Produced Materials
            </Text>
            <Text fontSize='sm' color='gray.500'>
              {isLoadingStock ? 'Loading...' : materialsData.length > 0 ? `${materialsData.length} items` : 'No data available'}
            </Text>
          </Flex>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search produced materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={useColorModeValue("white", "gray.600")}
              borderColor={useColorModeValue("gray.300", "gray.500")}
              _focus={{
                borderColor: "#FF8D28",
                boxShadow: "0 0 0 1px #FF8D28"
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
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Materials</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Stock Value</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Quantity</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material, index) => (
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
                      {material.units.toLocaleString()} {material.unit}
                    </Badge>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center" py="40px">
                  <Text color="gray.500" fontSize="sm">
                    {isLoadingStock ? "Loading materials..." : searchTerm ? "No materials found matching your search" : "No materials available"}
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default BestProducedMaterials;
