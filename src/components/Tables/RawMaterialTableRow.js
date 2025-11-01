import {
  Badge,
  Button,
  Flex,
  HStack,
  Image,
  Td,
  Text,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

function RawMaterialTableRow(props) {
  const { logo, name, amountPerUnit, totalPurchaseCost, invoiceLink, status, amountPending, onEdit, onDelete } = props;
  const textColor = useColorModeValue("gray.700", "white");

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "orange";
      case "Pending":
        return "gray";
      default:
        return "gray";
    }
  };

  const handleDownloadInvoice = () => {
    // Here you would typically trigger a download
    // For now, we'll just show an alert
    alert(`Downloading invoice for ${name}`);
  };

  return (
    <Tr>
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={logo} w="30px" h="30px" me="18px" objectFit="cover" />
          <Flex direction="column">
            <Text
              fontSize="md"
              color={textColor}
              fontWeight="bold"
              minWidth="100%"
            >
              {name}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {amountPerUnit}
        </Text>
      </Td>

      <Td>
        <Flex direction="column" align="start">
          <Text fontSize="md" color={textColor} fontWeight="bold">
            {totalPurchaseCost}
          </Text>
          <Button
            variant="link"
            color="blue.500"
            fontSize="sm"
            p="0"
            h="auto"
            fontWeight="normal"
            onClick={handleDownloadInvoice}
            _hover={{ textDecoration: "underline" }}
          >
            {invoiceLink}
          </Button>
        </Flex>
      </Td>

      <Td>
        <Badge
          colorScheme={getStatusColor(status)}
          fontSize="14px"
          p="3px 10px"
          borderRadius="20px"
        >
          {status}
        </Badge>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {amountPending}
        </Text>
      </Td>

      <Td>
        <HStack spacing='2'>
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onEdit}>
            <Text
              fontSize="md"
              color="blue.500"
              fontWeight="bold"
              cursor="pointer"
              transition="all .5s ease"
              _hover={{ me: "4px" }}
            >
              Edit
            </Text>
          </Button>
          {onDelete && (
            <Button p="0px" bg="transparent" variant="no-hover" onClick={onDelete}>
              <Text
                fontSize="md"
                color="red.500"
                fontWeight="bold"
                cursor="pointer"
                transition="all .5s ease"
                _hover={{ me: "4px" }}
              >
                Delete
              </Text>
            </Button>
          )}
        </HStack>
      </Td>
    </Tr>
  );
}

export default RawMaterialTableRow;
