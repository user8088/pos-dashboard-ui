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
import { FaChartLine } from "react-icons/fa";

const SalesOverview = ({ title, percentage, chart, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const iconTeal = useColorModeValue("teal.300", "teal.300");
  const iconBoxInside = useColorModeValue("white", "white");

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
              icon={<FaChartLine w="24px" h="24px" color={iconBoxInside} />}
            />
            <Text color={textColor} fontSize="lg" fontWeight="bold" ml="12px">
              {title}
            </Text>
          </Flex>
          <Flex direction="column" justify="center" align="center" w="100%">
            <Text color={textColor} fontSize="2xl" fontWeight="bold">
              PKR {data && data.length > 0 ? data[data.length - 1].value : 0}
            </Text>
            <Text color={textColor} fontSize="sm" fontWeight="normal">
              Revenue Today
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
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default SalesOverview;
