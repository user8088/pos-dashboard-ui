// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  SimpleGrid,
  Box,
  Icon,
  Button,
  Spinner,
  Center,
  VStack,
  useToast,
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
  const toast = useToast();

  // State management
  const [manufacturingData, setManufacturingData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [timePeriod, setTimePeriod] = React.useState("today");

  // Fetch manufacturing analytics data
  const fetchManufacturingData = async (period = "today") => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({ period });
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/manufacturing/dashboard?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setManufacturingData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch manufacturing data');
      }
    } catch (err) {
      console.error('Error fetching manufacturing data:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load manufacturing data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    fetchManufacturingData(period);
  };

  // Get display time period
  const getDisplayTimePeriod = (period) => {
    const periodMap = {
      'today': 'Today',
      'week': 'This Week',
      'month': 'This Month',
      'year': 'This Year',
      'business_season': 'Business Season'
    };
    return periodMap[period] || period;
  };

  // Process report data from API
  const getReportData = () => {
    if (!manufacturingData) return [];

    const { kpis, charts } = manufacturingData;
    const materialBreakdown = charts?.material_breakdown || [];

    // Find top category by production value
    const topCategory = materialBreakdown.length > 0 
      ? materialBreakdown.reduce((prev, current) => 
          (prev.production_value > current.production_value) ? prev : current
        )
      : null;

    return [
      { 
        label: "Production Revenue", 
        value: `PKR.${(kpis?.gross_production_revenue?.value || 0).toLocaleString()}`, 
        subtext: `(${kpis?.gross_production_revenue?.change_type === 'increase' ? '+' : ''}${kpis?.gross_production_revenue?.change || 0}%)`, 
        color: "orange.400" 
      },
      { 
        label: "Top Value Category", 
        value: topCategory ? `PKR.${topCategory.production_value.toLocaleString()}` : "PKR.0", 
        subtext: topCategory?.category || "No data", 
        color: "orange.400" 
      },
      { 
        label: "Avg Stock Value", 
        value: `PKR.${(kpis?.avg_stock_value?.value || 0).toLocaleString()}`, 
        subtext: `(${kpis?.avg_stock_value?.change_type === 'increase' ? '+' : ''}${kpis?.avg_stock_value?.change || 0}%)`, 
        color: "orange.400" 
      },
      { 
        label: "Conversion Rate", 
        value: `${kpis?.stock_conversion_rate?.value || 0}%`, 
        subtext: `(${kpis?.stock_conversion_rate?.change_type === 'increase' ? '+' : ''}${kpis?.stock_conversion_rate?.change || 0}%)`, 
        color: "green.400" 
      },
    ];
  };

  // Process chart data from API
  const getChartData = () => {
    if (!manufacturingData?.charts?.production_trend) return [];
    return manufacturingData.charts.production_trend;
  };

  // Load data on component mount
  React.useEffect(() => {
    fetchManufacturingData(timePeriod);
  }, []);

  const reportData = getReportData();
  const chartData = getChartData();

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
            <Flex gap='8px'>
              {['today', 'week', 'month', 'year'].map((period) => (
                <Button
                  key={period}
                  size='sm'
                  variant={timePeriod === period ? 'solid' : 'ghost'}
                  colorScheme={timePeriod === period ? 'orange' : 'gray'}
                  onClick={() => handleTimePeriodChange(period)}
                  fontSize='xs'
                  px='12px'
                  py='4px'
                  h='auto'
                >
                  {getDisplayTimePeriod(period)}
                </Button>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <Center h='300px'>
            <VStack spacing='16px' textAlign='center'>
              <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='#FF8D28'
                size='xl'
              />
              <Text color={textColor} fontSize='sm'>
                Loading manufacturing data...
              </Text>
            </VStack>
          </Center>
        ) : error ? (
          <Center h='300px'>
            <VStack spacing='16px' textAlign='center'>
              <Text color='red.500' fontSize='sm'>
                Error loading data: {error}
              </Text>
              <Button
                size='sm'
                colorScheme='orange'
                onClick={() => fetchManufacturingData(timePeriod)}
              >
                Retry
              </Button>
            </VStack>
          </Center>
        ) : (
          <>
            {/* Chart */}
            <Box bg='orange.400' borderRadius='15px' h='200px' mb='20px' position='relative'>
              <Flex
                position='absolute'
                top='20px'
                left='20px'
                direction='column'
                color='white'>
                <Text fontSize='xs' opacity={0.8}>
                  Production Trend - {getDisplayTimePeriod(timePeriod)}
                </Text>
                {chartData.length === 0 && (
                  <Text fontSize='xs' opacity={0.6} mt='4px'>
                    No production data available
                  </Text>
                )}
              </Flex>
              {chartData.length > 0 ? (
                <BarChart />
              ) : (
                <Center h='100%' color='white' opacity={0.6}>
                  <Text fontSize='sm'>No chart data available</Text>
                </Center>
              )}
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
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default ManufacturingReports;
