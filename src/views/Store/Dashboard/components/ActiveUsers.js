import React from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Progress,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import IconBox from "components/Icons/IconBox";
import { FaUsers } from "react-icons/fa";

const ActiveUsers = ({ title, percentage, chart, dashboardData, isLoading }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const iconTeal = useColorModeValue("teal.300", "teal.300");
  const iconBoxInside = useColorModeValue("white", "white");
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Card p="16px">
      <CardBody>
        <Flex direction="column" w="100%">
          <Flex
            direction="row"
            align="center"
            justify="center"
            w="100%"
            mb="25px">
            <IconBox
              w="56px"
              h="56px"
              bg={iconTeal}
              icon={<FaUsers w="24px" h="24px" color={iconBoxInside} />}
            />
            <Text color={textColor} fontSize="lg" fontWeight="bold" ml="12px">
              {title}
            </Text>
          </Flex>
          <Flex direction="column" justify="center" align="center" w="100%">
            {isLoading ? (
              <Text color={textColor} fontSize="sm" fontWeight="normal">
                Loading...
              </Text>
            ) : dashboardData ? (
              <>
                <Text color={textColor} fontSize="2xl" fontWeight="bold">
                  {dashboardData.kpis.total_customers || 0}
                </Text>
                <Text color={textColor} fontSize="sm" fontWeight="normal">
                  Total Customers
                </Text>
                <Progress
                  colorScheme="teal"
                  size="sm"
                  value={Math.abs(percentage)}
                  w="100%"
                  mt="10px"
                />
                <Text color={textColor} fontSize="sm" fontWeight="normal" mt="5px">
                  {percentage > 0 ? "+" : ""}{percentage}% from last period
                </Text>
              </>
            ) : (
              <Text color={textColor} fontSize="sm" fontWeight="normal">
                No data available
              </Text>
            )}
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ActiveUsers;
