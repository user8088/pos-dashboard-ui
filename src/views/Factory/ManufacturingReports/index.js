// Chakra imports
import {
  Box,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  Button,
  HStack,
  VStack,
  Switch,
  FormControl,
  FormLabel,
  Badge,
  Input,
  Spinner,
  Center,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { FaDownload, FaArrowUp, FaArrowDown } from "react-icons/fa";
import StockValueChart from "./components/StockValueChart";
import MaterialsChart from "./components/MaterialsChart";
import BestProducedMaterials from "./components/BestProducedMaterials";
import TopManufacturingCategories from "./components/TopManufacturingCategories";

function ManufacturingReports() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const [timePeriod, setTimePeriod] = React.useState("Seasonal");
  const [compareMode, setCompareMode] = React.useState(false);
  const [customDateRange, setCustomDateRange] = React.useState({
    startDate: "",
    endDate: ""
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toast = useToast();

  // Calculate custom date range duration
  const getCustomDateDuration = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      const start = new Date(customDateRange.startDate);
      const end = new Date(customDateRange.endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return daysDiff;
    }
    return 0;
  };

  // API period mapping
  const getApiPeriod = (displayPeriod) => {
    const map = {
      "Today": "today",
      "Week": "week",
      "Month": "month",
      "Seasonal": "business_season",
      "Year": "year",
      "Custom date": "business_season",
    };
    return map[displayPeriod] || "today";
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.set('period', getApiPeriod(timePeriod));
      if ((timePeriod === 'Custom date') && customDateRange.startDate && customDateRange.endDate) {
        params.set('start_date', customDateRange.startDate);
        params.set('end_date', customDateRange.endDate);
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/manufacturing/dashboard?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = await res.json();
      if (json.success) {
        setDashboardData(json.data);
      } else {
        throw new Error(json.message || 'Failed to load');
      }
    } catch (e) {
      setError(e.message);
      toast({
        title: 'Error',
        description: 'Failed to load manufacturing reports',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, [timePeriod, customDateRange.startDate, customDateRange.endDate]);

  // Build KPI cards from API
  const kpiData = React.useMemo(() => {
    const kpis = dashboardData?.kpis;
    if (!kpis) return [];
    return [
      {
        title: 'Gross Production revenue',
        value: `PKR. ${(kpis.gross_production_revenue?.value || 0).toLocaleString()}`,
        change: `${kpis.gross_production_revenue?.change_type === 'increase' ? '+' : ''}${kpis.gross_production_revenue?.change || 0}%`,
        changeType: kpis.gross_production_revenue?.change_type || 'increase',
        period: ''
      },
      {
        title: 'Avg. Stock Value',
        value: `PKR. ${(kpis.avg_stock_value?.value || 0).toLocaleString()}`,
        change: `${kpis.avg_stock_value?.change_type === 'increase' ? '+' : ''}${kpis.avg_stock_value?.change || 0}%`,
        changeType: kpis.avg_stock_value?.change_type || 'increase',
        period: ''
      },
      {
        title: 'Stock Conversion Rate',
        value: `${kpis.stock_conversion_rate?.value || 0}%`,
        change: `${kpis.stock_conversion_rate?.change_type === 'increase' ? '+' : ''}${kpis.stock_conversion_rate?.change || 0}%`,
        changeType: kpis.stock_conversion_rate?.change_type || 'increase',
        period: ''
      },
      {
        title: 'Suppliers',
        value: `${(kpis.suppliers?.value || 0).toLocaleString()}`,
        change: `${kpis.suppliers?.change_type === 'increase' ? '+' : ''}${kpis.suppliers?.change || 0}`,
        changeType: kpis.suppliers?.change_type || 'increase',
        period: ''
      },
    ];
  }, [dashboardData]);

  const timePeriods = ["Today", "Week", "Month", "Seasonal", "Year", "Custom date"];

  // Handle custom date selection
  const handleCustomDateSelect = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setTimePeriod("Custom date");
      setShowCustomDatePicker(false);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    if (period === "Custom date") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Header Section */}
      <Box mb='24px'>
        <Flex direction='column' w='100%'>
          <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='8px'>
            Welcome, Admin
          </Text>
          <Text fontSize='md' color='gray.400' mb='24px'>
            Have a look at your recent status
          </Text>
          
          {/* Date Filters and Controls */}
          <Flex
            direction={{ sm: "column", lg: "row" }}
            justify='space-between'
            align={{ sm: "start", lg: "center" }}
            w='100%'
            gap='16px'>
            
            {/* Time Period Buttons */}
            <HStack spacing='8px' flexWrap='wrap'>
              {timePeriods.map((period) => (
                <Button
                  key={period}
                  size='sm'
                  variant={timePeriod === period ? 'solid' : 'outline'}
                  colorScheme='teal'
                  bg={timePeriod === period ? '#FF8D28' : 'transparent'}
                  color={timePeriod === period ? 'white' : '#FF8D28'}
                  borderColor='#FF8D28'
                  _hover={{
                    bg: timePeriod === period ? '#E67E22' : 'rgba(255, 141, 40, 0.1)'
                  }}
                  onClick={() => handleTimePeriodChange(period)}>
                  {period}
                </Button>
              ))}
            </HStack>

            {/* Custom Date Picker Modal */}
            <Modal isOpen={showCustomDatePicker} onClose={() => setShowCustomDatePicker(false)}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader color={textColor}>Select Custom Date Range</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing="16px" align="stretch">
                    <HStack spacing="16px">
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">
                          Start Date
                        </FormLabel>
                        <Input
                          type="date"
                          value={customDateRange.startDate}
                          onChange={(e) => setCustomDateRange(prev => ({
                            ...prev,
                            startDate: e.target.value
                          }))}
                          size="md"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">
                          End Date
                        </FormLabel>
                        <Input
                          type="date"
                          value={customDateRange.endDate}
                          onChange={(e) => setCustomDateRange(prev => ({
                            ...prev,
                            endDate: e.target.value
                          }))}
                          size="md"
                          min={customDateRange.startDate}
                        />
                      </FormControl>
                    </HStack>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <HStack spacing="12px">
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomDatePicker(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      colorScheme="teal"
                      bg="#FF8D28"
                      color="white"
                      _hover={{ bg: "#E67E22" }}
                      onClick={handleCustomDateSelect}
                      isDisabled={!customDateRange.startDate || !customDateRange.endDate}
                    >
                      Apply
                    </Button>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Comparison Toggle and Export */}
            <HStack spacing='16px'>
              <FormControl display='flex' alignItems='center'>
                <Switch
                  id='compare-mode'
                  colorScheme='teal'
                  isChecked={compareMode}
                  onChange={(e) => setCompareMode(e.target.checked)}
                />
                <FormLabel htmlFor='compare-mode' ml='8px' fontSize='sm' color='gray.600'>
                  Do not compare
                </FormLabel>
              </FormControl>
              
              <Button
                leftIcon={<FaDownload />}
                colorScheme='teal'
                borderColor='#FF8D28'
                color='#FF8D28'
                variant='outline'
                size='sm'>
                Export
              </Button>
            </HStack>
          </Flex>
        </Flex>
      </Box>

      {/* Active Filter Indicator */}
      <Box mb='16px'>
        <Flex align='center' gap='12px'>
          <Text fontSize='sm' color='gray.500' fontWeight='medium'>
            Showing data for:
          </Text>
          <Badge
            colorScheme='teal'
            bg='#FF8D28'
            color='white'
            px='12px'
            py='4px'
            borderRadius='full'
            fontSize='sm'
            fontWeight='bold'>
            {timePeriod}
          </Badge>
        </Flex>
      </Box>

      {/* KPI Summary Cards */}
      {isLoading ? (
        <Center h='200px' mb='24px'>
          <VStack spacing='12px'>
            <Spinner thickness='4px' speed='0.65s' emptyColor='gray.200' color='#FF8D28' size='lg' />
            <Text color='gray.500' fontSize='sm'>Loading KPIs...</Text>
          </VStack>
        </Center>
      ) : error ? (
        <Center h='200px' mb='24px'>
          <VStack spacing='12px'>
            <Text color='red.500' fontSize='sm'>Failed to load KPIs: {error}</Text>
            <Button size='sm' colorScheme='orange' onClick={fetchDashboardData}>Retry</Button>
          </VStack>
        </Center>
      ) : (
      <Grid
        templateColumns={{
          sm: "1fr",
          md: "1fr 1fr",
          xl: "1fr 1fr 1fr 1fr",
        }}
        gap='24px'
        mb='24px'>
        {kpiData.map((kpi, index) => (
          <Card key={index} bg={cardBg} boxShadow={cardShadow}>
            <CardBody p='20px'>
              <VStack align='start' spacing='12px'>
                <Text fontSize='sm' color='gray.500' fontWeight='medium'>
                  {kpi.title}
                </Text>
                <Text fontSize='2xl' color={textColor} fontWeight='bold'>
                  {kpi.value}
                </Text>
                <HStack spacing='8px'>
                  <Flex
                    align='center'
                    color={kpi.changeType === 'increase' ? 'green.500' : 'red.500'}
                    fontSize='sm'>
                    {kpi.changeType === 'increase' ? (
                      <FaArrowUp size='12px' />
                    ) : (
                      <FaArrowDown size='12px' />
                    )}
                    <Text ml='4px' fontWeight='semibold'>
                      {kpi.change}
                    </Text>
                  </Flex>
                  <Text fontSize='sm' color='gray.500'>
                    {kpi.period}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Grid>
      )}

      {/* Charts Section */}
      <Grid
        templateColumns={{
          sm: "1fr",
          lg: "2fr 1fr",
        }}
        gap='24px'
        mb='24px'>
        <StockValueChart 
          timePeriod={timePeriod} 
          customDateRange={customDateRange} 
          chartData={dashboardData?.charts?.production_trend || []}
        />
        <MaterialsChart 
          categoryData={dashboardData?.charts?.material_breakdown || []}
        />
      </Grid>

      {/* Data Tables Section */}
      <Grid
        templateColumns={{
          sm: "1fr",
          lg: "1fr 1fr",
        }}
        gap='24px'>
        <BestProducedMaterials 
          timePeriod={timePeriod} 
          customDateRange={customDateRange}
          data={dashboardData?.charts?.material_breakdown || []}
        />
        <TopManufacturingCategories 
          timePeriod={timePeriod} 
          customDateRange={customDateRange}
          data={dashboardData?.charts?.material_breakdown || []}
        />
      </Grid>
    </Flex>
  );
}

export default ManufacturingReports;