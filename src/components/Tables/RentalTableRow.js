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
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import React from "react";
import { FaTrash, FaCog, FaUndo, FaEllipsisV, FaEye, FaEdit } from "react-icons/fa";

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
  
  // Responsive values
  const fontSize = useBreakpointValue({ base: "xs", md: "sm" });
  const imageSize = useBreakpointValue({ base: "20px", md: "30px" });
  const buttonSize = useBreakpointValue({ base: "xs", md: "sm" });

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
      <Td w="200px" pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={logo} w={imageSize} h={imageSize} me="12px" objectFit="cover" flexShrink={0} />
          <Flex direction="column" minWidth="0" flex="1">
            <Text fontSize={fontSize} color={textColor} fontWeight="bold">
              {name}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td w="120px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {quantity}
        </Text>
      </Td>

      <Td w="150px">
        <VStack spacing="1px" align="center">
          <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
            {rentalDurationDays ? `${rentalDurationDays}d` : "—"}
          </Text>
          <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
            {dailyRate ? `PKR.${dailyRate}/d` : "—"}
          </Text>
        </VStack>
      </Td>

      <Td w="130px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {category}
        </Text>
      </Td>

      <Td w="140px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {formatCurrency(stockValue)}
        </Text>
      </Td>

      <Td w="140px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {totalRented || "0"}
        </Text>
      </Td>

      <Td w="140px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {formatCurrency(currentRent)}
        </Text>
      </Td>

      <Td w="140px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {formatCurrency(totalProfit)}
        </Text>
      </Td>

      <Td w="180px">
        <VStack spacing="1px" align="center">
          <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
            {formatDate(rentedOn)}
          </Text>
          <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
            {formatDate(rentedTill)}
          </Text>
        </VStack>
      </Td>

      <Td w="120px">
        <Flex justify="center" align="center">
          <Badge colorScheme={getStatusColor(status)} fontSize="12px" p="2px 8px" borderRadius="15px">
            {status}
          </Badge>
        </Flex>
      </Td>

      <Td w="80px">
        <Flex justify="flex-end" align="center">
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size={buttonSize}
              aria-label="Actions"
            />
            <MenuList>
              <MenuItem icon={<FaEye />} onClick={() => { /* View Details logic */ }}>
                View Details
              </MenuItem>
              <MenuItem icon={<FaEdit />} onClick={onEdit}>
                Edit
              </MenuItem>
              {status === "rented" ? (
                <MenuItem icon={<FaUndo />} onClick={onEndRental} color="red.500">
                  End Rental
                </MenuItem>
              ) : (
                <MenuItem icon={<FaCog />} onClick={onRent} color="green.500">
                  Record Rental
                </MenuItem>
              )}
              <MenuItem icon={<FaTrash />} onClick={onDelete} color="red.500">
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Td>
    </Tr>
  );
}

export default RentalTableRow;


