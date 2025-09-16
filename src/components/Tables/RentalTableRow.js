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
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { FaTrash, FaCog, FaUndo } from "react-icons/fa";

function RentalTableRow(props) {
  const {
    logo,
    name,
    quantity,
    category,
    status,
    stockValue,
    totalRented,
    currentRent,
    totalProfit,
    rentedOn,
    rentedTill,
    rentalDurationDays,
    dailyRate,
    isOverdue,
    onEdit,
    onDelete,
    onRent,
    onEndRental,
  } = props;
  const textColor = useColorModeValue("gray.700", "white");

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green";
      case "rented":
        return isOverdue ? "red" : "yellow";
      case "maintenance":
        return "purple";
      case "pending":
        return "blue";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return "PKR.0";
    return `PKR.${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <Tr>
      <Td minWidth="200px" maxWidth="250px" pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={logo} w="30px" h="30px" me="12px" objectFit="cover" flexShrink={0} />
          <Flex direction="column" minWidth="0" flex="1">
            <Text fontSize="sm" color={textColor} fontWeight="bold" isTruncated>
              {name}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td minWidth="100px" maxWidth="120px">
        <Text fontSize="sm" color={textColor} fontWeight="bold" isTruncated>{quantity}</Text>
      </Td>

      <Td minWidth="150px" maxWidth="180px">
        <VStack spacing="1px" align="start">
          <Text fontSize="xs" color={textColor} fontWeight="bold" isTruncated>
            {rentalDurationDays ? `${rentalDurationDays}d` : "—"}
          </Text>
          <Text fontSize="xs" color={textColor} fontWeight="bold" isTruncated>
            {dailyRate ? `PKR.${dailyRate}/d` : "—"}
          </Text>
        </VStack>
      </Td>

      <Td minWidth="120px" maxWidth="150px">
        <Text fontSize="sm" color={textColor} fontWeight="bold" isTruncated>{category}</Text>
      </Td>

      <Td minWidth="120px" maxWidth="150px">
        <Text fontSize="sm" color={textColor} fontWeight="bold" isTruncated>{formatCurrency(stockValue)}</Text>
      </Td>

      <Td minWidth="120px" maxWidth="150px">
        <Text fontSize="sm" color={textColor} fontWeight="bold" isTruncated>{totalRented || "0"}</Text>
      </Td>

      <Td minWidth="120px" maxWidth="150px">
        <Text fontSize="sm" color={textColor} fontWeight="bold" isTruncated>{formatCurrency(currentRent)}</Text>
      </Td>

      <Td minWidth="120px" maxWidth="150px">
        <Text fontSize="sm" color={textColor} fontWeight="bold" isTruncated>{formatCurrency(totalProfit)}</Text>
      </Td>

      <Td minWidth="180px" maxWidth="220px">
        <VStack spacing="1px" align="start">
          <Text fontSize="xs" color={textColor} fontWeight="bold" isTruncated>
            {formatDate(rentedOn)}
          </Text>
          <Text fontSize="xs" color={textColor} fontWeight="bold" isTruncated>
            {formatDate(rentedTill)}
          </Text>
        </VStack>
      </Td>

      <Td minWidth="100px" maxWidth="120px">
        <Badge colorScheme={getStatusColor(status)} fontSize="12px" p="2px 8px" borderRadius="15px">
          {status}
        </Badge>
      </Td>

      <Td minWidth="120px" maxWidth="150px">
        <HStack spacing="8px" justify="flex-start">
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onEdit} size="sm">
            <Text fontSize="xs" color="gray.400" fontWeight="bold" cursor="pointer" _hover={{ color: "brand.500" }}>
              Edit
            </Text>
          </Button>
          {status === "rented" ? (
            <Button p="0px" bg="transparent" variant="no-hover" onClick={onEndRental} title="End Rental" size="sm">
              <FaUndo color="#FF6B6B" size="14px" style={{ cursor: "pointer" }} />
            </Button>
          ) : (
            <Button p="0px" bg="transparent" variant="no-hover" onClick={onRent} title="Record Rental" size="sm">
              <FaCog color="#4CAF50" size="14px" style={{ cursor: "pointer" }} />
            </Button>
          )}
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onDelete} size="sm">
            <FaTrash color="#FF8D28" size="14px" style={{ cursor: "pointer" }} />
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
}

export default RentalTableRow;


