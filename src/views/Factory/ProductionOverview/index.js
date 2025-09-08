// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function ProductionOverview() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='20px'>
        Production Overview
      </Text>
      <Text fontSize='md' color={textColor}>
        Production overview charts and metrics will be displayed here.
      </Text>
    </Flex>
  );
}
