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
          title: "Gross Production revenue",
          value: "PKR. 725,000",
          change: "20%",
          changeType: "increase",
          period: "From last season"
        },
        {
          title: "Avg. Stock Value",
          value: "PKR. 120,000",
          change: "44%",
          changeType: "increase",
          period: "From last season"
        },
        {
          title: "Stock Conversion Rate",
          value: "40%",
          change: "12%",
          changeType: "increase",
          period: "From last season"
        },
        {
          title: "Suppliers",
          value: "3000",
          change: "1200",
          changeType: "increase",
          period: "From last season"
        }
      ],
      "Week": [
        {
          title: "Gross Production revenue",
          value: "PKR. 5,075,000",
          change: "25%",
          changeType: "increase",
          period: "From last week"
        },
        {
          title: "Avg. Stock Value",
          value: "PKR. 840,000",
          change: "52%",
          changeType: "increase",
          period: "From last week"
        },
        {
          title: "Stock Conversion Rate",
          value: "45%",
          change: "18%",
          changeType: "increase",
          period: "From last week"
        },
        {
          title: "Suppliers",
          value: "21000",
          change: "8400",
          changeType: "increase",
          period: "From last week"
        }
      ],
      "Month": [
        {
          title: "Gross Production revenue",
          value: "PKR. 21,750,000",
          change: "30%",
          changeType: "increase",
          period: "From last month"
        },
        {
          title: "Avg. Stock Value",
          value: "PKR. 3,600,000",
          change: "60%",
          changeType: "increase",
          period: "From last month"
        },
        {
          title: "Stock Conversion Rate",
          value: "48%",
          change: "22%",
          changeType: "increase",
          period: "From last month"
        },
        {
          title: "Suppliers",
          value: "90000",
          change: "36000",
          changeType: "increase",
          period: "From last month"
        }
      ],
      "Seasonal": [
        {
          title: "Gross Production revenue",
          value: "PKR. 725,000",
          change: "20%",
          changeType: "increase",
          period: "From last season"
        },
        {
          title: "Avg. Stock Value",
          value: "PKR. 120,000",
          change: "44%",
          changeType: "increase",
          period: "From last season"
        },
        {
          title: "Stock Conversion Rate",
          value: "40%",
          change: "12%",
          changeType: "increase",
          period: "From last season"
        },
        {
          title: "Suppliers",
          value: "3000",
          change: "1200",
          changeType: "increase",
          period: "From last season"
        }
      ],
      "Year": [
        {
          title: "Gross Production revenue",
          value: "PKR. 261,000,000",
          change: "45%",
          changeType: "increase",
          period: "From last year"
        },
        {
          title: "Avg. Stock Value",
          value: "PKR. 43,200,000",
          change: "72%",
          changeType: "increase",
          period: "From last year"
        },
        {
          title: "Stock Conversion Rate",
          value: "52%",
          change: "35%",
          changeType: "increase",
          period: "From last year"
        },
        {
          title: "Suppliers",
          value: "1080000",
          change: "432000",
          changeType: "increase",
          period: "From last year"
        }
      ],
      "Custom date": [
        {
          title: "Gross Production revenue",
          value: customDateRange.startDate && customDateRange.endDate 
            ? `PKR. ${(getCustomDateDuration() * 25000).toLocaleString()}`
            : "PKR. 750,000",
          change: "18%",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        },
        {
          title: "Avg. Stock Value",
          value: customDateRange.startDate && customDateRange.endDate 
            ? `PKR. ${(25000 + Math.floor(Math.random() * 15000)).toLocaleString()}`
            : "PKR. 125,000",
          change: "48%",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        },
        {
          title: "Stock Conversion Rate",
          value: customDateRange.startDate && customDateRange.endDate 
            ? `${(35 + Math.random() * 15).toFixed(0)}%`
            : "42%",
          change: "15%",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        },
        {
          title: "Suppliers",
          value: customDateRange.startDate && customDateRange.endDate 
            ? (getCustomDateDuration() * 100).toString()
            : "3200",
          change: "1280",
          changeType: "increase",
          period: customDateRange.startDate && customDateRange.endDate 
            ? `From ${customDateRange.startDate} to ${customDateRange.endDate}`
            : "From selected period"
        }
      ]
    };
    
    return kpiDataMap[period] || kpiDataMap["Seasonal"];
  };

  const kpiData = getKpiData(timePeriod);

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
        <StockValueChart timePeriod={timePeriod} customDateRange={customDateRange} />
        <MaterialsChart />
      </Grid>

      {/* Data Tables Section */}
      <Grid
        templateColumns={{
          sm: "1fr",
          lg: "1fr 1fr",
        }}
        gap='24px'>
        <BestProducedMaterials timePeriod={timePeriod} customDateRange={customDateRange} />
        <TopManufacturingCategories timePeriod={timePeriod} customDateRange={customDateRange} />
      </Grid>
    </Flex>
  );
}

export default ManufacturingReports;