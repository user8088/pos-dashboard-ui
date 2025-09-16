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
import { FaTrash, FaCog } from "react-icons/fa";

function RentalTableRow(props) {
  const {
    logo,
    name,
    quantity,
    rentWeek,
    rentMonth,
    rentYear,
    category,
    status,
    stockValue,
    totalRented,
    totalProfit,
    onEdit,
    onDelete,
    onRent,
  } = props;
  const textColor = useColorModeValue("gray.700", "white");

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
      case "In Stock":
        return "green";
      case "Rented":
        return "yellow";
      case "Maintenance":
        return "purple";
      default:
        return "gray";
    }
  };

  return (
    <Tr>
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={logo} w="30px" h="30px" me="18px" objectFit="cover" />
          <Flex direction="column">
            <Text fontSize="md" color={textColor} fontWeight="bold" minWidth="100%">
              {name}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{quantity}</Text>
      </Td>

      <Td>
        <VStack spacing="2px" align="start">
          <Text fontSize="sm" color={textColor} fontWeight="bold">W: {rentWeek}</Text>
          <Text fontSize="sm" color={textColor} fontWeight="bold">M: {rentMonth}</Text>
          <Text fontSize="sm" color={textColor} fontWeight="bold">Y: {rentYear}</Text>
        </VStack>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{category}</Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{stockValue}</Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{totalRented}</Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">{totalProfit}</Text>
      </Td>

      <Td>
        <Badge colorScheme={getStatusColor(status)} fontSize="14px" p="3px 10px" borderRadius="20px">
          {status}
        </Badge>
      </Td>

      <Td>
        <HStack spacing="12px">
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onEdit}>
            <Text fontSize="md" color="gray.400" fontWeight="bold" cursor="pointer" _hover={{ color: "brand.500" }}>
              Edit
            </Text>
          </Button>
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onRent} title="Record Rental">
            <FaCog color="#4CAF50" size="16px" style={{ cursor: "pointer" }} />
          </Button>
          <Button p="0px" bg="transparent" variant="no-hover" onClick={onDelete}>
            <FaTrash color="#FF8D28" size="16px" style={{ cursor: "pointer" }} />
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
}

export default RentalTableRow;


