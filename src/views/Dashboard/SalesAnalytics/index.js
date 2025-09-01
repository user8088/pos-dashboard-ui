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
import RevenueChart from "./components/RevenueChart";
import CategoriesChart from "./components/CategoriesChart";
import BestSellingProducts from "./components/BestSellingProducts";
import BestSellingCategories from "./components/BestSellingCategories";

function SalesAnalytics() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const [timePeriod, setTimePeriod] = React.useState("Today");
  const [compareMode, setCompareMode] = React.useState(false);
  const [customDateRange, setCustomDateRange] = React.useState({
    startDate: "",
    endDate: ""
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);

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

  // Dynamic KPI Data based on time period
  const getKpiData = (period) => {
    const kpiDataMap = {
      "Today": [
        {
          title: "Gross revenue",
          value: "PKR. 120,000",
          change: "11%",
          changeType: "increase",
          period: "From yesterday"
        },
        {
          title: "Avg. order value",
          value: "PKR. 20,000",
          change: "2%",
          changeType: "increase",
          period: "From yesterday"
        },
        {
          title: "Conversion rate",
          value: "3%",
          change: "4%",
          changeType: "increase",
          period: "From yesterday"
        },
        {
          title: "Customers",
          value: "80",
          change: "2",
          changeType: "decrease",
          period: "From yesterday"
        }
      ],
      "Week": [
        {
          title: "Gross revenue",
          value: "PKR. 850,000",
          change: "18%",
          changeType: "increase",
          period: "From last week"
        },
        {
          title: "Avg. order value",
          value: "PKR. 25,000",
          change: "8%",
          changeType: "increase",
          period: "From last week"
        },
        {
          title: "Conversion rate",
          value: "4.2%",
          change: "12%",
          changeType: "increase",
          period: "From last week"
        },
        {
          title: "Customers",
          value: "340",
          change: "45",
          changeType: "increase",
          period: "From last week"
        }
      ],
      "Month": [
        {
          title: "Gross revenue",
          value: "PKR. 3,200,000",
          change: "25%",
          changeType: "increase",
          period: "From last month"
        },
        {
          title: "Avg. order value",
          value: "PKR. 28,000",
          change: "15%",
          changeType: "increase",
          period: "From last month"
        },
        {
          title: "Conversion rate",
          value: "5.1%",
          change: "18%",
          changeType: "increase",
          period: "From last month"
        },
        {
          title: "Customers",
          value: "1,140",
          change: "180",
          changeType: "increase",
          period: "From last month"
        }
      ],
      "Business Season": [
        {
          title: "Gross revenue",
          value: "PKR. 8,500,000",
          change: "32%",
          changeType: "increase",
          period: "From last business season (Mar-Jan)"
        },
        {
          title: "Avg. order value",
          value: "PKR. 32,000",
          change: "22%",
          changeType: "increase",
          period: "From last business season (Mar-Jan)"
        },
        {
          title: "Conversion rate",
          value: "6.2%",
          change: "24%",
          changeType: "increase",
          period: "From last business season (Mar-Jan)"
        },
        {
          title: "Customers",
          value: "2,650",
          change: "420",
          changeType: "increase",
          period: "From last business season (Mar-Jan)"
        }
      ],
      "Year": [
        {
          title: "Gross revenue",
          value: "PKR. 28,500,000",
          change: "45%",
          changeType: "increase",
          period: "From last year"
        },
        {
          title: "Avg. order value",
          value: "PKR. 35,000",
          change: "28%",
          changeType: "increase",
          period: "From last year"
        },
        {
          title: "Conversion rate",
          value: "7.8%",
          change: "35%",
          changeType: "increase",
          period: "From last year"
        },
        {
          title: "Customers",
          value: "8,140",
          change: "1,200",
          changeType: "increase",
          period: "From last year"
        }
      ],
      "Custom date": [
        {
          title: "Gross revenue",
          value: customDateRange.startDate && customDateRange.endDate 
            ? `PKR. ${(getCustomDateDuration() * 15000).toLocaleString()}`
            : "PKR. 450,000",
          change: "15%",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        },
        {
          title: "Avg. order value",
          value: customDateRange.startDate && customDateRange.endDate 
            ? `PKR. ${(15000 + Math.floor(Math.random() * 10000)).toLocaleString()}`
            : "PKR. 22,000",
          change: "5%",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        },
        {
          title: "Conversion rate",
          value: customDateRange.startDate && customDateRange.endDate 
            ? `${(3.5 + Math.random() * 2).toFixed(1)}%`
            : "3.8%",
          change: "8%",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        },
        {
          title: "Customers",
          value: customDateRange.startDate && customDateRange.endDate 
            ? (getCustomDateDuration() * 6).toString()
            : "180",
          change: "25",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        }
      ]
    };
    
    return kpiDataMap[period] || kpiDataMap["Today"];
  };

  const kpiData = getKpiData(timePeriod);

  const timePeriods = ["Today", "Week", "Month", "Business Season", "Year", "Custom date"];

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
        <RevenueChart timePeriod={timePeriod} customDateRange={customDateRange} />
        <CategoriesChart />
      </Grid>

      {/* Data Tables Section */}
      <Grid
        templateColumns={{
          sm: "1fr",
          lg: "1fr 1fr",
        }}
        gap='24px'>
        <BestSellingProducts timePeriod={timePeriod} customDateRange={customDateRange} />
        <BestSellingCategories timePeriod={timePeriod} customDateRange={customDateRange} />
      </Grid>
    </Flex>
  );
}

export default SalesAnalytics;
