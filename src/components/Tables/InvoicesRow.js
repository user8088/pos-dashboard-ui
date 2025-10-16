import {
  Box,
  Button,
  Flex,
  Icon,
  Spacer,
  Text,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import React from "react";

function InvoicesRow(props) {
  const textColor = useColorModeValue("gray.700", "white");
  const { date, code, price, format, logo, onDownload, customerName } = props;
  
  const fontSize = useBreakpointValue({ base: "sm", md: "md" });
  const iconSize = useBreakpointValue({ base: "16px", md: "20px" });

  return (
    <Flex 
      my={{ base: "0.5rem", sm: "1rem", xl: "10px" }} 
      alignItems="center"
      p={{ base: "8px", md: "12px" }}
      borderRadius="md"
      _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
    >
      <Flex direction="column" minW="0" flex="1">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" noOfLines={1}>
          {date}
        </Text>
        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.400" fontWeight="semibold">
          {code}
        </Text>
        {customerName && (
          <Text fontSize="xs" color="blue.500" fontWeight="medium" mt="2px">
            {customerName}
          </Text>
        )}
      </Flex>
      <Spacer />
      <Box me={{ base: "8px", md: "12px" }} minW="0">
        <Text fontSize={fontSize} color="gray.400" fontWeight="semibold" textAlign="right">
          {price}
        </Text>
      </Box>
      <Button 
        p="0px" 
        bg="transparent" 
        variant="no-hover" 
        onClick={onDownload} 
        title="Download invoice"
        size={{ base: "xs", md: "sm" }}
      >
        <Flex alignItems="center" p={{ base: "8px", md: "12px" }}>
          <Icon as={logo} w={iconSize} h="auto" me={{ base: "3px", md: "5px" }} />
          <Text fontSize={fontSize} color={textColor} fontWeight="bold">
            {format}
          </Text>
        </Flex>
      </Button>
    </Flex>
  );
}

export default InvoicesRow;
