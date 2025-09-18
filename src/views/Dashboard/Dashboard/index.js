// Chakra imports
import {
  Flex,
  Grid,
  Image,
  SimpleGrid,
  useColorModeValue,
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
import React from "react";
import { dashboardTableData, timelineData } from "variables/general";
import ActiveUsers from "./components/ActiveUsers";
import BuiltByDevelopers from "./components/BuiltByDevelopers";
import MiniStatistics from "./components/MiniStatistics";
import OrdersOverview from "./components/OrdersOverview";
import Projects from "./components/Projects";
import SalesOverview from "./components/SalesOverview";
import WorkWithTheRockets from "./components/WorkWithTheRockets";

export default function Dashboard() {
  const iconBoxInside = useColorModeValue("white", "white");
  const [dashboardData, setDashboardData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Fetch dashboard data from Sales Analytics API
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/analytics/dashboard?period=today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={"Today's Moneys"}
          amount={isLoading ? "Loading..." : dashboardData ? `PKR. ${dashboardData.kpis.gross_revenue.value.toLocaleString()}` : "PKR. 0"}
          percentage={dashboardData ? dashboardData.kpis.gross_revenue.change : 0}
          icon={<WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Customers Today"}
          amount={isLoading ? "Loading..." : dashboardData ? dashboardData.kpis.customers.value.toLocaleString() : "0"}
          percentage={dashboardData ? dashboardData.kpis.customers.change : 0}
          icon={<GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Avg Order Value"}
          amount={isLoading ? "Loading..." : dashboardData ? `PKR. ${dashboardData.kpis.avg_order_value.value.toLocaleString()}` : "PKR. 0"}
          percentage={dashboardData ? dashboardData.kpis.avg_order_value.change : 0}
          icon={<DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Conversion Rate"}
          amount={isLoading ? "Loading..." : dashboardData ? `${dashboardData.kpis.conversion_rate.value}%` : "0%"}
          percentage={dashboardData ? dashboardData.kpis.conversion_rate.change : 0}
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
          percentage={dashboardData ? dashboardData.kpis.gross_revenue.change : 0}
          chart={<BarChart data={dashboardData ? dashboardData.charts.revenue_trend : []} />}
          dashboardData={dashboardData}
          isLoading={isLoading}
        />
        <SalesOverview
          title={"Sales Overview"}
          percentage={dashboardData ? dashboardData.kpis.gross_revenue.change : 0}
          chart={<LineChart data={dashboardData ? dashboardData.charts.revenue_trend : []} />}
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
          isLoading={isLoading}
        />
        <OrdersOverview
          title={"Recent Transactions"}
          amount={30}
          data={timelineData}
          isLoading={isLoading}
        />
      </Grid>
    </Flex>
  );
}
