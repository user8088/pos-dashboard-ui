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

function StockTableRow(props) {
  const { logo, name, quantity, category, status, stockValue, onEdit, onDelete } = props;
  const textColor = useColorModeValue("gray.700", "white");

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
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

  return (
    <Tr>
             <Td minWidth={{ sm: "250px" }} pl="0px">
         <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
           <Image src={logo} w="30px" h="30px"  me="18px" objectFit="cover" />
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
          {quantity}
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
          {stockValue}
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

export default StockTableRow;
