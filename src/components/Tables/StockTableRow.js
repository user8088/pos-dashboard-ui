import {
  Badge,
  Flex,
  Image,
  Td,
  Text,
  Tr,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { FaEllipsisV } from "react-icons/fa";
import React from "react";

function StockTableRow(props) {
  const {
    logo,
    name,
    quantity,
    primaryUnit,
    secondaryUnit,
    category,
    status,
    lastPurchase,
    sellingPrice,
    onEdit,
    onView,
    onDelete,
    onProduce,
  } = props;
  const textColor = useColorModeValue("gray.700", "white");

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "green";
      case "Out of Stock":
        return "red";
      case "Low Stock":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <Tr>
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={logo} w="30px" h="30px" borderRadius="8px" me="18px" objectFit="cover" />
           <Flex direction="column">
             <Text
               fontSize="md"
               color={textColor}
               fontWeight="bold"
               minWidth="100%"
              noOfLines={1}
            onClick={onView}
            cursor={onView ? 'pointer' : 'default'}
            _hover={onView ? { color: 'brand.500' } : undefined}
            >
              {name}
             </Text>
           </Flex>
         </Flex>
       </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {quantity != null && quantity !== 0 ? Number(quantity).toLocaleString() : '-'}
        </Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {primaryUnit}
        </Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {secondaryUnit}
        </Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {category}
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
          {lastPurchase}
        </Text>
      </Td>

      <Td>
        <Text fontSize="md" color={textColor} fontWeight="bold">
          {sellingPrice}
        </Text>
      </Td>

      <Td isNumeric>
        <Menu placement="bottom-end">
          <MenuButton
            as={IconButton}
            aria-label="Actions"
            icon={<FaEllipsisV />}
            size="sm"
            variant="ghost"
          />
          <MenuList>
            {onProduce && <MenuItem onClick={onProduce}>Produce</MenuItem>}
            <MenuItem onClick={onEdit}>Edit</MenuItem>
            {onDelete && <MenuItem color="red.500" onClick={onDelete}>Delete</MenuItem>}
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
}

export default StockTableRow;
