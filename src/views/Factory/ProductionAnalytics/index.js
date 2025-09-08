// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function ProductionAnalytics() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='20px'>
        Production Analytics
      </Text>
      <Text fontSize='md' color={textColor}>
        Production analytics and insights will be displayed here.
      </Text>
    </Flex>
  );
}
