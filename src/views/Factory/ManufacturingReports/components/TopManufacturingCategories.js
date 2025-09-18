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

const TopManufacturingCategories = ({ timePeriod, customDateRange, data = [] }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const [searchTerm, setSearchTerm] = React.useState("");

  // Process API data for categories table
  const getProcessedCategoriesData = () => {
    if (!data || data.length === 0) return [];
    
    return data.map((item, index) => ({
      id: index + 1,
      name: item.category,
      image: logo,
      production: `PKR.${item.production_value.toLocaleString()}`,
      units: item.quantity_produced,
      description: `${item.percentage}% of total production`
    }));
  };

  const categoriesData = getProcessedCategoriesData();

  // Filter categories based on search term
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return categoriesData;
    return categoriesData.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoriesData, searchTerm]);

  return (
    <Card bg={useColorModeValue("white", "gray.700")} boxShadow={useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)")}>
      <CardHeader>
        <VStack spacing="16px" align="stretch">
          <Flex direction="column">
            <Text fontSize='lg' color={textColor} fontWeight='bold'>
              Top Manufacturing Categories
            </Text>
            <Text fontSize='sm' color='gray.500'>
              {categoriesData.length > 0 ? `${categoriesData.length} categories` : 'No data available'}
            </Text>
          </Flex>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search categories..."
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
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Categories</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Production Cost</Th>
              <Th color='gray.400' fontSize='sm' fontWeight='semibold'>Units</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
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
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center" py="40px">
                  <Text color="gray.500" fontSize="sm">
                    {searchTerm ? "No categories found matching your search" : "No categories available"}
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

export default TopManufacturingCategories;
