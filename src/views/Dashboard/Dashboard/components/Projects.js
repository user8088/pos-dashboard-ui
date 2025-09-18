// Chakra imports
import { BsArrowRight } from "react-icons/bs";
import { Button } from "@chakra-ui/react";

import {
  Flex,
  Icon,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import DashboardTableRow from "components/Tables/DashboardTableRow";
import React from "react";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import logo from "assets/img/avatars/placeholder.png";

const Projects = ({ title, amount, captions, data, isLoading }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const [stockData, setStockData] = React.useState([]);
  const [stockLoading, setStockLoading] = React.useState(true);

  // Fetch stock data
  const fetchStockData = async () => {
    try {
      setStockLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const stockItems = await response.json();
        // Transform stock data to match the expected format
        const transformedData = stockItems.slice(0, 5).map((item, index) => ({
          name: item.item_name,
          logo: logo,
          members: [`${item.total_sold || 0} sold`],
          budget: `PKR. ${parseFloat(item.stock_value || 0).toLocaleString()}`,
          progression: Math.round((parseFloat(item.quantity_per_unit) / (parseFloat(item.quantity_per_unit) + (item.total_sold || 0))) * 100) || 0
        }));
        setStockData(transformedData);
      } else {
        setStockData([]);
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      setStockData([]);
    } finally {
      setStockLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <Card p='16px' overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='12px 0px 28px 0px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
          <Flex align='center'>
            <Icon
              as={IoCheckmarkDoneCircleSharp}
              color='teal.300'
              w={4}
              h={4}
              pe='3px'
            />
            <Text fontSize='sm' color='gray.400' fontWeight='normal'>
              <Text fontWeight='bold' as='span'>
                {stockLoading ? "Loading..." : stockData.length} Products
              </Text>{" "}
              Stocked this month.
            </Text>
          </Flex>
        </Flex>
      </CardHeader>
      <Table variant='simple' color={textColor}>
        <Thead>
          <Tr my='.8rem' ps='0px'>
            {captions.map((caption, idx) => {
              return (
                <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>
                  {caption}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        <Tbody>
          {stockLoading ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                <Text color="gray.500" fontSize="sm">Loading stock data...</Text>
              </td>
            </tr>
          ) : stockData.length > 0 ? (
            stockData.map((row) => {
              return (
                <DashboardTableRow
                  key={row.name}
                  name={row.name}
                  logo={row.logo}
                  members={row.members}
                  budget={row.budget}
                  progression={row.progression}
                />
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                <Text color="gray.500" fontSize="sm">No stock data available</Text>
              </td>
            </tr>
          )}
        </Tbody>
      </Table>
      <Flex align='center'>
              <Button
                p='0px'
                variant='no-hover'
                bg='transparent'
                my={{ sm: "1.5rem", lg: "0px" }}>
                <Text
                  fontSize='sm'
                  color={textColor}
                  fontWeight='bold'
                  cursor='pointer'
                  transition='all .5s ease'
                  my={{ sm: "1.5rem", lg: "0px" }}
                  _hover={{ me: "4px" }}>
                  Manage Stock
                </Text>
                <Icon
                  as={BsArrowRight}
                  w='20px'
                  h='20px'
                  fontSize='2xl'
                  transition='all .5s ease'
                  ms='8px'
                  cursor='pointer'
                  pt='2px'
                  _hover={{ transform: "translateX(20%)" }}
                />
              </Button>
            </Flex>
    </Card>
  );
};

export default Projects;
