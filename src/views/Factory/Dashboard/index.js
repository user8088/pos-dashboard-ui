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

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid columns={{ sm: 1, md: 2, xl: 4 }} spacing='24px'>
        <MiniStatistics
          title={"Today's Gross Stock Value"}
          amount={"PKR. 120,000"}
          percentage={55}
          icon={<WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Production Efficiency Today"}
          amount={"50 %"}
          percentage={5}
          icon={<GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Comparative Loss"}
          amount={"PKR. 11,052"}
          percentage={-14}
          icon={<DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />}
        />
        <MiniStatistics
          title={"Comparative Global Value"}
          amount={"PKR. 173,000"}
          percentage={8}
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
          percentage={23}
          chart={<BarChart />}
        />
        <SalesOverview
          title={"Production overview"}
          percentage={5}
          chart={<LineChart />}
        />
      </Grid>
      <Grid
        templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "2fr 1fr" }}
        templateRows={{ sm: "1fr auto", md: "1fr", lg: "1fr" }}
        gap='24px'>
        <Projects
          title={"Stock Produced"}
          amount={30}
          captions={["Companies", "Stock Produced", "Manufacture Cost", "Manufacture Loss %", "Stock Value"]}
          data={factoryTableData}
        />
        <OrdersOverview
          title={"Expense Notifications"}
          amount={30}
          data={factoryTimelineData}
        />
      </Grid>
    </Flex>
  );
}
