import { Box, Button, Flex, Icon, Text, useColorModeValue, useBreakpointValue } from "@chakra-ui/react";
import React from "react";
import { FaTrash } from "react-icons/fa";

function TransactionRow(props) {
  const textColor = useColorModeValue("gray.700", "white");
  const { name, date, logo, price, onDelete } = props;
  
  const fontSize = useBreakpointValue({ base: "sm", md: "md" });
  const iconSize = useBreakpointValue({ base: "30px", md: "35px" });
  const iconBoxSize = useBreakpointValue({ base: "28px", md: "32px" });

  return (
    <Flex 
      my={{ base: "0.5rem", md: "1rem" }} 
      justifyContent="space-between" 
      alignItems="center"
      p={{ base: "8px", md: "12px" }}
      borderRadius="md"
      _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
    >
      <Flex alignItems="center" minW="0" flex="1">
        <Box
          me={{ base: "8px", md: "12px" }}
          borderRadius="50%"
          color={
            price[0] === "+"
              ? "#FF8D28"
              : price[0] === "-"
              ? "red.400"
              : "gray.400"
          }
          border="1px solid"
          display="flex"
          alignItems="center"
          justifyContent="center"
          w={iconBoxSize}
          h={iconBoxSize}
        >
          <Icon as={logo} w={iconSize} h={iconSize} />
        </Box>
        <Flex direction="column" minW="0" flex="1">
          <Text
            fontSize={fontSize}
            color={textColor}
            fontWeight="bold"
            noOfLines={1}
          >
            {name}
          </Text>
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color="gray.400"
            fontWeight="semibold"
          >
            {date}
          </Text>
        </Flex>
      </Flex>
      <Flex alignItems="center" gap={{ base: "4px", md: "8px" }}>
        <Box
          color={price[0] === "+" ? "#FF8D28" : price[0] === "-" ? "red.400" : textColor}
        >
          <Text fontSize={fontSize} fontWeight="bold" textAlign="right">
            {price}
          </Text>
        </Box>
        <Button
          aria-label="Delete transaction"
          p={{ base: "4px", md: "6px" }}
          h={{ base: "28px", md: "32px" }}
          minW={{ base: "28px", md: "32px" }}
          variant="ghost"
          colorScheme="red"
          onClick={onDelete}
          size={{ base: "xs", md: "sm" }}
        >
          <Icon as={FaTrash} w={{ base: "12px", md: "14px" }} h={{ base: "12px", md: "14px" }} />
        </Button>
      </Flex>
    </Flex>
  );
}

export default TransactionRow;
