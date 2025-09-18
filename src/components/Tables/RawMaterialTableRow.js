import {
  Badge,
  Button,
  Flex,
  Image,
  Td,
  Text,
  Tr,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import React from "react";
import { FaTrash } from "react-icons/fa";

function RawMaterialTableRow(props) {
  const { logo, name, amountPerUnit, unitCost, totalPurchaseCost, supplierName, wasteQuantity, lossCost, invoiceLink, status, amountPending, onEdit, onDelete, onWaste } = props;
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
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {unitCost}
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
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {supplierName || "—"}
        </Text>
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
          {wasteQuantity}
        </Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {lossCost}
        </Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {amountPending}
        </Text>
      </Td>

      <Td>
        <HStack spacing="12px">
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onEdit}>
            <Text
              fontSize="md"
              color="gray.400"
              fontWeight="bold"
              cursor="pointer"
              _hover={{ color: "brand.500" }}
            >
              Edit
            </Text>
          </Button>
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onWaste}>
            <Text
              fontSize="md"
              color="#FF8D28"
              fontWeight="bold"
              cursor="pointer"
              _hover={{ color: "#E67E22" }}
            >
              Set Waste
            </Text>
          </Button>
          <Button 
            p="0px" 
            bg="transparent" 
            variant="no-hover" 
            onClick={onDelete}
            _hover={{ bg: "transparent" }}
          >
            <FaTrash 
              color="#FF8D28" 
              size="16px" 
              style={{ cursor: "pointer" }}
            />
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
}

export default RawMaterialTableRow;
