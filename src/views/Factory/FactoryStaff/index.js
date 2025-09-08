// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function FactoryStaff() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='20px'>
        Factory Staff
      </Text>
      <Text fontSize='md' color={textColor}>
        Factory staff management will be displayed here.
      </Text>
    </Flex>
  );
}
