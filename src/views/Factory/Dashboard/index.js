// Chakra imports
import {
  Flex,
  Grid,
  Image,
  SimpleGrid,
  useColorModeValue,
  Text,
  Spinner,
  Box,
  VStack,
  Button,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
// assets
import peopleImage from "assets/img/people-image.png";
import logoChakra from "assets/svg/logo-white.svg";
import BarChart from "components/Charts/BarChart";
import LineChart from "components/Charts/LineChart";
// Custom icons
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
} from "components/Icons/Icons.js";
import React, { useState, useEffect } from "react";
import { factoryTableData, factoryTimelineData } from "variables/factory";
import ActiveUsers from "views/Dashboard/Dashboard/components/ActiveUsers";
import BuiltByDevelopers from "views/Dashboard/Dashboard/components/BuiltByDevelopers";
import MiniStatistics from "views/Dashboard/Dashboard/components/MiniStatistics";
import OrdersOverview from "views/Dashboard/Dashboard/components/OrdersOverview";
import Projects from "views/Dashboard/Dashboard/components/Projects";
import SalesOverview from "views/Dashboard/Dashboard/components/SalesOverview";
import WorkWithTheRockets from "views/Dashboard/Dashboard/components/WorkWithTheRockets";

export default function FactoryDashboard() {
  const iconBoxInside = useColorModeValue("white", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  // State for manufacturing data
  const [manufacturingData, setManufacturingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch manufacturing dashboard data
  const fetchManufacturingData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://server.mughalsupplier.com/api/core/manufacturing/dashboard?period=today', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Manufacturing API Response:', data);
        if (data.success && data.data) {
          setManufacturingData(data.data);
          setError(null);
        } else {
          throw new Error('Invalid response format from server');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch manufacturing data');
      }
    } catch (err) {
      console.error('Error fetching manufacturing data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturingData();
  }, []);

  // Refresh data function
  const refreshData = () => {
    fetchManufacturingData();
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "PKR. 0";
    return `PKR. ${Number(amount).toLocaleString()}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (!value) return "0%";
    return `${Number(value).toFixed(1)}%`;
  };

  // No data card component
  const NoDataCard = ({ title, height = "400px" }) => (
    <Card bg={cardBg} boxShadow={cardShadow} borderRadius="15px">
      <CardBody p="24px">
        <Flex h={height} w='100%' align='center' justify='center' direction='column'>
          <VStack spacing="16px">
            <Box 
              w="60px" 
              h="60px" 
              borderRadius="full" 
              bg="gray.100" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Text fontSize="24px" color="gray.400">📊</Text>
            </Box>
            <VStack spacing="8px">
              <Text fontSize='lg' color={mutedColor} fontWeight='semibold'>
                {title}
              </Text>
              <Text fontSize='md' color="red.400" textAlign='center' fontWeight="bold">
                NO DATA AVAILABLE
              </Text>
              <Text fontSize='sm' color="gray.400" textAlign='center'>
                Graph data is empty or missing
              </Text>
            </VStack>
          </VStack>
        </Flex>
      </CardBody>
    </Card>
  );

  // Loading component
  const LoadingCard = ({ title, height = "400px" }) => (
    <Card bg={cardBg} boxShadow={cardShadow}>
      <CardBody>
        <Flex h={height} w='100%' align='center' justify='center' direction='column'>
          <VStack spacing="16px">
            <Spinner size="lg" color="brand.500" />
            <Text fontSize='md' color={mutedColor} textAlign='center'>
              Loading {title}...
            </Text>
          </VStack>
        </Flex>
      </CardBody>
    </Card>
  );

  // Show error state if API fails
  if (error) {
    return (
      <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
        <Card bg={cardBg} boxShadow={cardShadow} p="24px">
          <VStack spacing="16px">
            <Text fontSize='lg' color="red.500" fontWeight='semibold'>
              Error Loading Manufacturing Data
            </Text>
            <Text fontSize='md' color={mutedColor} textAlign='center'>
              {error}
            </Text>
            <Text fontSize='sm' color={mutedColor} textAlign='center'>
              Please check your connection and try again.
            </Text>
            <Button 
              colorScheme="brand" 
              onClick={refreshData}
              isLoading={isLoading}
              loadingText="Retrying..."
            >
              Retry
            </Button>
          </VStack>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      {/* Refresh Button */}
      <Flex justify="flex-end" mb="16px">
        <Button 
          size="sm" 
          colorScheme="brand" 
          variant="outline"
          onClick={refreshData}
          isLoading={isLoading}
          loadingText="Refreshing..."
        >
          Refresh Data
        </Button>
      </Flex>
      
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={"Gross Production Revenue"}
          amount={isLoading ? "Loading..." : formatCurrency(manufacturingData?.kpis?.gross_production_revenue?.value)}
          percentage={isLoading ? 0 : manufacturingData?.kpis?.gross_production_revenue?.change || 0}
          icon={<WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Stock Conversion Rate"}
          amount={isLoading ? "Loading..." : formatPercentage(manufacturingData?.kpis?.stock_conversion_rate?.value)}
          percentage={isLoading ? 0 : manufacturingData?.kpis?.stock_conversion_rate?.change || 0}
          icon={<GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Average Stock Value"}
          amount={isLoading ? "Loading..." : formatCurrency(manufacturingData?.kpis?.avg_stock_value?.value)}
          percentage={isLoading ? 0 : manufacturingData?.kpis?.avg_stock_value?.change || 0}
          icon={<DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Total Suppliers"}
          amount={isLoading ? "Loading..." : manufacturingData?.kpis?.suppliers?.value || 0}
          percentage={isLoading ? 0 : manufacturingData?.kpis?.suppliers?.change || 0}
          icon={<CartIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
      </SimpleGrid>
      <Grid
        templateColumns={{ md: "1fr", lg: "1.8fr 1.2fr" }}
        templateRows={{ md: "1fr auto", lg: "1fr" }}
        my='26px'
        gap='24px'>
        <BuiltByDevelopers
          title={"You are viewing"}
          name={"Factory Dashboard"}
          description={
            "Manage cash flow, track raw material usage, manage salaries and store related expenses."
          }
          image={
            <Image
              src={logoChakra}
              alt='chakra image'
              minWidth={{ md: "300px", lg: "auto" }}
            />
          }
        />
        <WorkWithTheRockets
          backgroundImage={peopleImage}
          title={"Store Dashboard"}
          description={
            "Manage cash flow, track raw material usage, manage salaries and store related expenses."
          }
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", lg: "1.3fr 1.7fr" }}
        templateRows={{ sm: "repeat(2, 1fr)", lg: "1fr" }}
        gap='24px'
        mb={{ lg: "26px" }}>
        <ActiveUsers
          title={"Manufacturing Reports"}
          percentage={isLoading ? 0 : manufacturingData?.kpis?.stock_conversion_rate?.value || 0}
          chart={
            isLoading ? (
              <LoadingCard title="Manufacturing Reports" height="300px" />
            ) : manufacturingData?.charts?.production_trend && 
               Array.isArray(manufacturingData.charts.production_trend) && 
               manufacturingData.charts.production_trend.length > 0 ? (
              <BarChart data={manufacturingData.charts.production_trend} />
            ) : (
              <NoDataCard title="Manufacturing Reports" height="300px" />
            )
          }
        />
        <SalesOverview
          title={"Production Overview"}
          percentage={isLoading ? 0 : manufacturingData?.kpis?.gross_production_revenue?.change || 0}
          chart={
            isLoading ? (
              <LoadingCard title="Production Overview" height="300px" />
            ) : manufacturingData?.charts?.production_trend && 
               Array.isArray(manufacturingData.charts.production_trend) && 
               manufacturingData.charts.production_trend.length > 0 ? (
              <LineChart data={manufacturingData.charts.production_trend} />
            ) : (
              <NoDataCard title="Production Overview" height="300px" />
            )
          }
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        templateRows={{ sm: "1fr auto", md: "1fr", lg: "1fr" }}
        gap='24px'>
        <Projects
          title={"Material Breakdown"}
          amount={isLoading ? 0 : manufacturingData?.charts?.material_breakdown?.length || 0}
          captions={["Category", "Production Value", "Quantity Produced", "Percentage"]}
          data={
            isLoading ? [] : 
            manufacturingData?.charts?.material_breakdown?.map((item, index) => ({
              logo: <Box w="30px" h="30px" bg="brand.500" borderRadius="md" />,
              name: item.category,
              members: [item.production_value, item.quantity_produced, item.percentage],
              budget: formatCurrency(item.production_value),
              completion: item.percentage
            })) || []
          }
        />
        <OrdersOverview
          title={"Production Notifications"}
          amount={isLoading ? 0 : manufacturingData?.kpis?.suppliers?.value || 0}
          data={
            isLoading ? [] :
            manufacturingData?.charts?.material_breakdown?.map((item, index) => ({
              logo: <Box w="30px" h="30px" bg="brand.500" borderRadius="md" />,
              name: `${item.category} Production`,
              date: new Date().toLocaleDateString(),
              price: formatCurrency(item.production_value)
            })) || []
          }
        />
      </Grid>
    </Flex>
  );
}
