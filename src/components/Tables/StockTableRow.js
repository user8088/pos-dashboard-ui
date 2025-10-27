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
  useBreakpointValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Portal,
} from "@chakra-ui/react";
import React from "react";
import { FaTrash, FaCog, FaEllipsisV, FaEye, FaEdit } from "react-icons/fa";

function StockTableRow(props) {
  const { 
    logo, 
    name, 
    serialNumber,
    quantity, 
    itemPrice, 
    category, 
    status, 
    stockValue, 
    totalSold, 
    totalProfit, 
    canBeComponent,
    onEdit, 
    onDelete, 
    onEditProduction,
    onViewComponents,
    onProduce
  } = props;
  const textColor = useColorModeValue("gray.700", "white");
  
  const fontSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });
  const imageSize = useBreakpointValue({ base: "20px", sm: "24px", md: "30px" });

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "in_stock":
        return "green";
      case "out_of_stock":
        return "red";
      case "pending":
        return "orange";
      case "In Stock":
        return "green";
      case "Out of Stock":
        return "red";
      case "Pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "PKR.0.00";
    // If already formatted as PKR.X.XX, return as is
    if (typeof amount === 'string' && amount.startsWith('PKR.')) {
      return amount;
    }
    // Otherwise format as currency
    return `PKR.${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <Tr>
      <Td w="200px" pl="0px">
        <Flex align="center" py={{ base: ".4rem", md: ".8rem" }} minWidth="100%" flexWrap="nowrap">
          <Image 
            src={logo} 
            w={imageSize} 
            h={imageSize} 
            me={{ base: "8px", sm: "12px", md: "18px" }} 
            objectFit="cover" 
            borderRadius="md"
          />
          <Flex direction="column" minW="0" flex="1">
            <Text
              fontSize={fontSize}
              color={textColor}
              fontWeight="bold"
              minWidth="100%"
            >
              {name}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td w="160px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {serialNumber || '-'}
        </Text>
      </Td>

      <Td w="100px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {quantity}
        </Text>
      </Td>

      <Td w="120px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {formatCurrency(itemPrice)}
        </Text>
      </Td>

      <Td w="130px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold">
          {category}
        </Text>
      </Td>

      <Td w="120px">
        <Flex justify="center">
          <Badge
            colorScheme={getStatusColor(status)}
            fontSize={{ base: "10px", sm: "12px", md: "14px" }}
            p={{ base: "1px 6px", sm: "2px 8px", md: "3px 10px" }}
            borderRadius="20px"
          >
            {status}
          </Badge>
        </Flex>
      </Td>

      <Td w="140px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {formatCurrency(stockValue)}
        </Text>
      </Td>

      <Td w="120px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {totalSold}
        </Text>
      </Td>

      <Td w="130px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {formatCurrency(totalProfit)}
        </Text>
      </Td>

      <Td w="100px">
        <Flex justify="center">
          <Badge
            colorScheme={canBeComponent ? "blue" : "gray"}
            fontSize={{ base: "10px", sm: "12px", md: "14px" }}
            p={{ base: "1px 6px", sm: "2px 8px", md: "3px 10px" }}
            borderRadius="20px"
          >
            {canBeComponent ? "Component" : "Product"}
          </Badge>
        </Flex>
      </Td>

      <Td w="80px">
        <Flex justify="center">
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size={{ base: "xs", sm: "sm", md: "md" }}
              color="gray.500"
              _hover={{ 
                color: "#FF8D28", 
                bg: useColorModeValue("orange.50", "orange.900") 
              }}
              _active={{ 
                color: "#FF8D28", 
                bg: useColorModeValue("orange.100", "orange.800") 
              }}
            />
            <Portal>
              <MenuList 
                minW="160px" 
                boxShadow="lg" 
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.600")}
              >
                {onViewComponents && (
                  <MenuItem 
                    icon={<FaEye />} 
                    onClick={onViewComponents}
                    _hover={{ bg: useColorModeValue("blue.50", "blue.900") }}
                    fontSize="sm"
                  >
                    View Components
                  </MenuItem>
                )}
                <MenuItem 
                  icon={<FaEdit />} 
                  onClick={onEdit}
                  _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                  fontSize="sm"
                >
                  Edit
                </MenuItem>
                {/* {onProduce && (
                  <MenuItem 
                    icon={<FaCog />} 
                    onClick={onProduce}
                    color="#4CAF50"
                    _hover={{ 
                      bg: useColorModeValue("green.50", "green.900"),
                      color: "#2E7D32" 
                    }}
                    fontSize="sm"
                  >
                    Produce Stock
                  </MenuItem>
                )} */}
                {onEditProduction && (
                  <MenuItem 
                    icon={<FaCog />} 
                    onClick={onEditProduction}
                    color="#4CAF50"
                    _hover={{ 
                      bg: useColorModeValue("green.50", "green.900"),
                      color: "#2E7D32" 
                    }}
                    fontSize="sm"
                  >
                    Edit Production
                  </MenuItem>
                )}
                <MenuDivider />
                <MenuItem 
                  icon={<FaTrash />} 
                  onClick={onDelete}
                  color="red.500"
                  _hover={{ 
                    bg: useColorModeValue("red.50", "red.900"),
                    color: "red.600" 
                  }}
                  fontSize="sm"
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
      </Td>
    </Tr>
  );
}

export default StockTableRow;
