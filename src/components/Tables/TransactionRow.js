import { Box, Button, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FaTrash } from "react-icons/fa";

function TransactionRow(props) {
  const textColor = useColorModeValue("gray.700", "white");
  const { name, date, logo, price, onDelete } = props;

  return (
    <Flex my="1rem" justifyContent="space-between" alignItems="center">
      <Flex alignItems="center">
        <Box
          me="12px"
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
          w="35px"
          h="35px"
        >
          <Icon as={logo} />
        </Box>
        <Flex direction="column">
          <Text
            fontSize={{ sm: "md", md: "lg", lg: "md" }}
            color={textColor}
            fontWeight="bold"
          >
            {name}
          </Text>
          <Text
            fontSize={{ sm: "xs", md: "sm", lg: "xs" }}
            color="gray.400"
            fontWeight="semibold"
          >
            {date}
          </Text>
        </Flex>
      </Flex>
      <Flex alignItems="center" gap="8px">
        <Box
          color={price[0] === "+" ? "#FF8D28" : price[0] === "-" ? "red.400" : textColor}
        >
          <Text fontSize={{ sm: "md", md: "lg", lg: "md" }} fontWeight="bold">
            {price}
          </Text>
        </Box>
        <Button
          aria-label="Delete transaction"
          p="6px"
          h="32px"
          minW="32px"
          variant="ghost"
          colorScheme="red"
          onClick={onDelete}
        >
          <Icon as={FaTrash} />
        </Button>
      </Flex>
    </Flex>
  );
}

export default TransactionRow;
