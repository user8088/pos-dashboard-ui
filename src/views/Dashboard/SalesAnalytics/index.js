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
  Select,
  Badge,
  Input,
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
import { useToast, Spinner, Center } from "@chakra-ui/react";
import RevenueChart from "./components/RevenueChart";
import CategoriesChart from "./components/CategoriesChart";
import BestSellingProducts from "./components/BestSellingProducts";
import BestSellingCategories from "./components/BestSellingCategories";

function SalesAnalytics() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const toast = useToast();
  
  // State management
  const [timePeriod, setTimePeriod] = React.useState("today");
  const [compareMode, setCompareMode] = React.useState(false);
  const [customDateRange, setCustomDateRange] = React.useState({
    startDate: "",
    endDate: ""
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);
  
  // API data state
  const [dashboardData, setDashboardData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Fetch dashboard data from API
  const fetchDashboardData = React.useCallback(async (period = "today", params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({ period, ...params });
      
      const response = await fetch(`https://server.mughalsupplier.com/api/core/analytics/dashboard?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Export analytics data
  const exportAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {
        period: timePeriod === "Custom date" ? "business_season" : timePeriod,
        format: "json"
      };

      if (timePeriod === "Custom date" && customDateRange.startDate && customDateRange.endDate) {
        params.start_date = customDateRange.startDate;
        params.end_date = customDateRange.endDate;
      }
      
      const response = await fetch('https://server.mughalsupplier.com/api/core/analytics/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Create and download JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_${timePeriod}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Analytics data exported successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch data when component mounts or period changes
  React.useEffect(() => {
    const params = {};
    
    if (timePeriod === "Custom date" && customDateRange.startDate && customDateRange.endDate) {
      params.start_date = customDateRange.startDate;
      params.end_date = customDateRange.endDate;
      fetchDashboardData("business_season", params);
    } else {
      fetchDashboardData(timePeriod);
    }
  }, [timePeriod, customDateRange, fetchDashboardData]);

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

  // Format currency helper
  const formatCurrency = (amount) => {
    return `PKR. ${Number(amount || 0).toLocaleString()}`;
  };

  // Dynamic KPI Data based on API response or fallback
  const getKpiData = () => {
    if (!dashboardData || !dashboardData.kpis) {
      // Fallback data while loading or on error
      return [
        {
          title: "Gross revenue",
          value: "PKR. 0",
          change: "0%",
          changeType: "increase",
          period: "Loading..."
        },
        {
          title: "Avg. order value",
          value: "PKR. 0",
          change: "0%",
          changeType: "increase",
          period: "Loading..."
        },
        {
          title: "Conversion rate",
          value: "0%",
          change: "0%",
          changeType: "increase",
          period: "Loading..."
        },
        {
          title: "Customers",
          value: "0",
          change: "0",
          changeType: "increase",
          period: "Loading..."
        }
      ];
    }

    const kpis = dashboardData.kpis;
    const periodInfo = dashboardData.period_info;
    const periodLabel = getPeriodLabel();

    return [
      {
        title: "Gross revenue",
        value: formatCurrency(kpis.gross_revenue?.value || 0),
        change: `${kpis.gross_revenue?.change || 0}%`,
        changeType: kpis.gross_revenue?.change_type || "increase",
        period: `From ${periodLabel}`
      },
      {
        title: "Avg. order value",
        value: formatCurrency(kpis.avg_order_value?.value || 0),
        change: `${kpis.avg_order_value?.change || 0}%`,
        changeType: kpis.avg_order_value?.change_type || "increase",
        period: `From ${periodLabel}`
      },
      {
        title: "Conversion rate",
        value: `${kpis.conversion_rate?.value || 0}%`,
        change: `${kpis.conversion_rate?.change || 0}%`,
        changeType: kpis.conversion_rate?.change_type || "increase",
        period: `From ${periodLabel}`
      },
      {
        title: "Customers",
        value: `${kpis.customers?.value || 0}`,
        change: `${kpis.customers?.change || 0}`,
        changeType: kpis.customers?.change_type || "increase",
        period: `From ${periodLabel}`
      }
    ];
  };

  // Get period label for comparison text
  const getPeriodLabel = () => {
    switch(timePeriod) {
      case "today": return "yesterday";
      case "week": return "last week";
      case "month": return "last month";
      case "year": return "last year";
      case "business_season": return "last business season";
      case "Custom date": return "previous period";
      default: return "previous period";
    }
  };

  const kpiData = getKpiData();

  const timePeriods = ["today", "week", "month", "business_season", "year", "Custom date"];

  // Map display names to API values
  const getDisplayTimePeriod = (period) => {
    const displayMap = {
      "today": "Today",
      "week": "Week", 
      "month": "Month",
      "business_season": "Business Season",
      "year": "Year",
      "Custom date": "Custom date"
    };
    return displayMap[period] || period;
  };

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

  // Show loading spinner if data is loading
  if (isLoading) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.500" />
        </Center>
      </Flex>
    );
  }

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
                  {getDisplayTimePeriod(period)}
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
                size='sm'
                onClick={exportAnalytics}>
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
            {getDisplayTimePeriod(timePeriod)}
          </Badge>
        </Flex>
      </Box>

      {/* KPI Summary Cards */}
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

      {/* Charts Section */}
      <Grid
        templateColumns={{
          sm: "1fr",
          lg: "2fr 1fr",
        }}
        gap='24px'
        mb='24px'>
        <RevenueChart 
          timePeriod={timePeriod} 
          customDateRange={customDateRange}
          chartData={dashboardData?.charts?.revenue_trend}
        />
        <CategoriesChart 
          categoryData={dashboardData?.charts?.category_breakdown}
        />
      </Grid>

      {/* Data Tables Section */}
      <Grid
        templateColumns={{
          sm: "1fr",
          lg: "1fr 1fr",
        }}
        gap='24px'>
        <BestSellingProducts 
          timePeriod={timePeriod} 
          customDateRange={customDateRange}
          productsData={dashboardData?.best_selling_products}
        />
        <BestSellingCategories 
          timePeriod={timePeriod} 
          customDateRange={customDateRange}
          categoryData={dashboardData?.charts?.category_breakdown}
        />
      </Grid>
    </Flex>
  );
}

export default SalesAnalytics;
