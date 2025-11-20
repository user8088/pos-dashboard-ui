// Chakra imports
import {
  Flex,
  Grid,
  Image,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Box,
  Button,
  Text,
} from "@chakra-ui/react";
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
import React, { useState, useEffect, useCallback } from "react";
import { dashboardTableData, timelineData } from "variables/general";
import ActiveUsers from "./components/ActiveUsers";
import BuiltByDevelopers from "./components/BuiltByDevelopers";
import MiniStatistics from "./components/MiniStatistics";
import OrdersOverview from "./components/OrdersOverview";
import Projects from "./components/Projects";
import SalesOverview from "./components/SalesOverview";
import WorkWithTheRockets from "./components/WorkWithTheRockets";
import analyticsService from "services/analyticsService";
import { useAuth } from "contexts/AuthContext";

export default function Dashboard() {
  const iconBoxInside = useColorModeValue("white", "white");
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, isAuthenticated, loading: authLoading } = useAuth();

  const fetchDashboardStats = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !token) {
      setStatsData(null);
      setError("You are not authenticated. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getDashboardAnalytics(token);
      if (response.success && response.data) {
        setStatsData(response.data);
        
        // Debug: Log the analytics data to see what we're getting
        console.log('📊 Dashboard Analytics Data:', response.data);
        if (response.data.today) {
          console.log('📈 Today Stats:', response.data.today.stats);
          console.log('💰 Loss Value:', response.data.today.stats?.losses);
          console.log('📋 Loss Breakdown:', response.data.today.stats?.loss_breakdown);
          if (response.data.today.stats?.loss_breakdown) {
            const breakdown = response.data.today.stats.loss_breakdown;
            const calculatedTotal = 
              (breakdown.revenue_debits || 0) +
              (breakdown.expense_transactions || 0) +
              (breakdown.loss_account_transactions || 0) +
              (breakdown.cogs_loss || 0);
            console.log('🧮 Calculated Loss from Breakdown:', calculatedTotal);
            console.log('🔍 Breakdown Details:', {
              revenue_debits: breakdown.revenue_debits,
              expense_transactions: breakdown.expense_transactions,
              loss_account_transactions: breakdown.loss_account_transactions,
              cogs_loss: breakdown.cogs_loss,
              total: calculatedTotal
            });
          }
        }
      } else {
        setError('Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, token]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Format currency value
  const formatPKR = (value) => {
    if (value === null || value === undefined) return 'PKR. 0';
    return `PKR. ${Number(value).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Format number with commas
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    return Number(value).toLocaleString('en-PK');
  };

  // Verify loss calculation matches breakdown (for debugging)
  const verifyLossCalculation = (lossValue, breakdown) => {
    if (!breakdown) return true; // No breakdown to verify
    
    const calculatedLoss = 
      (breakdown.revenue_debits || 0) +
      (breakdown.expense_transactions || 0) +
      (breakdown.loss_account_transactions || 0) +
      (breakdown.cogs_loss || 0);
    
    const difference = Math.abs(lossValue - calculatedLoss);
    // Allow small floating point differences (0.01)
    if (difference > 0.01) {
      console.warn('Loss calculation mismatch:', {
        apiLoss: lossValue,
        calculatedLoss: calculatedLoss,
        difference: difference,
        breakdown: breakdown
      });
      return false;
    }
    return true;
  };

  // Get stats from data or return defaults
  const getStats = () => {
    if (!statsData || !statsData.today) {
      return {
        revenue: { value: 'PKR. 0', percentage: 0 },
        customers: { value: '0', percentage: 0 },
        losses: { value: 'PKR. 0', percentage: 0, breakdown: null },
        totalSales: { value: 'PKR. 0', percentage: 0 },
      };
    }

    const today = statsData.today;
    let lossValue = today.stats?.losses ?? 0;
    const lossBreakdown = today.stats?.loss_breakdown || null;
    
    // Calculate loss from breakdown if available (fallback if API value is missing/incorrect)
    if (lossBreakdown) {
      const calculatedFromBreakdown = 
        (lossBreakdown.revenue_debits || 0) +
        (lossBreakdown.expense_transactions || 0) +
        (lossBreakdown.loss_account_transactions || 0) +
        (lossBreakdown.cogs_loss || 0);
      
      // If API loss value is 0 but breakdown shows losses, use calculated value
      if (lossValue === 0 && calculatedFromBreakdown > 0) {
        console.warn('⚠️ API loss value is 0 but breakdown shows losses. Using calculated value:', {
          apiLossValue: lossValue,
          calculatedFromBreakdown: calculatedFromBreakdown,
          breakdown: lossBreakdown
        });
        lossValue = calculatedFromBreakdown;
      }
      
      // Verify loss calculation matches breakdown components
      // Loss = revenue_debits + expense_transactions + loss_account_transactions + cogs_loss
      verifyLossCalculation(lossValue, lossBreakdown);
    }
    
    return {
      revenue: {
        value: formatPKR(today.stats?.revenue || 0),
        percentage: today.comparison?.revenue?.percentage || 0,
      },
      customers: {
        value: formatNumber(today.stats?.customers || 0),
        percentage: today.comparison?.customers?.percentage || 0,
      },
      losses: {
        // Loss value from API: sum of all loss components
        // Components: revenue_debits + expense_transactions + loss_account_transactions + cogs_loss
        // Note: COGS loss is automatically recorded to LOSS-001 when invoices/sales are created
        value: formatPKR(lossValue),
        // For losses, negative percentage is good (losses decreased)
        // The API returns is_positive false when losses decreased (good)
        percentage: today.comparison?.losses?.percentage || 0,
        // Loss breakdown components:
        // - revenue_debits: Direct debits to revenue account
        // - expense_transactions: All expense account transactions (stock purchases, salaries, bills)
        // - loss_account_transactions: LOSS-001 account transactions (bad debts, damaged stock, COGS losses)
        // - cogs_loss: Loss from selling products below purchase cost (also recorded in loss_account_transactions)
        breakdown: lossBreakdown,
      },
      totalSales: {
        value: formatPKR(today.stats?.total_sales || 0),
        percentage: today.comparison?.total_sales?.percentage || 0,
      },
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Flex 
        flexDirection='column' 
        pt={{ base: "120px", md: "75px" }}
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <Spinner size="xl" thickness="4px" speed="0.65s" color="brand.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex 
        flexDirection='column' 
        pt={{ base: "120px", md: "75px" }}
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <Box color="red.500" textAlign="center">
          <Text mb={4}>Error loading dashboard stats: {error}</Text>
          <Button colorScheme="blue" onClick={fetchDashboardStats}>
            Retry
          </Button>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={"Today's Moneys"}
          amount={stats.revenue.value}
          percentage={stats.revenue.percentage}
          icon={<WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Customers Today"}
          amount={stats.customers.value}
          percentage={stats.customers.percentage}
          icon={<GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Comparitive Loss"}
          amount={stats.losses.value}
          percentage={stats.losses.percentage}
          icon={<DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Total Sales"}
          amount={stats.totalSales.value}
          percentage={stats.totalSales.percentage}
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
          name={"Store Dashboard"}
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
          title={"Manage Customers & Invoices"}
          description={
            "Wealth creation is a revolutionary recent positive-sum game. It is all about who takes the opportunity first."
          }
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", lg: "1.3fr 1.7fr" }}
        templateRows={{ sm: "repeat(2, 1fr)", lg: "1fr" }}
        gap='24px'
        mb={{ lg: "26px" }}>
        <ActiveUsers
          title={"Sales & Analytics"}
          percentage={23}
          chart={<BarChart />}
        />
        <SalesOverview
          title={"Sales Overview"}
          percentage={5}
          chart={<LineChart />}
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        templateRows={{ sm: "1fr auto", md: "1fr", lg: "1fr" }}
        gap='24px'>
        <Projects
          title={"Products in Stock"}
          amount={30}
          captions={["Products", "Stocks Sold", "Stock Value", "Remaining Stock %"]}
          data={dashboardTableData}
        />
        <OrdersOverview
          title={"Expense Notifications"}
          amount={30}
          data={timelineData}
        />
      </Grid>
    </Flex>
  );
}
