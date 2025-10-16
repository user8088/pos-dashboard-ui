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
} from "@chakra-ui/react";
import React from "react";
import { FaTrash, FaEllipsisV, FaEdit, FaEye, FaExclamationTriangle } from "react-icons/fa";

function RawMaterialTableRow(props) {
  const { logo, name, amountPerUnit, unitCost, totalPurchaseCost, supplierName, wasteQuantity, lossCost, invoiceLink, status, amountPending, materialId, billNumber, paymentMethod, paymentMethodNote, image, onEdit, onDelete, onWaste, onDownloadInvoice } = props;
  const textColor = useColorModeValue("gray.700", "white");
  
  const fontSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });
  const imageSize = useBreakpointValue({ base: "20px", sm: "24px", md: "30px" });

  // Debug log to see what image data we're receiving
  console.log(`Image for ${name}:`, image, 'Logo:', logo);

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
    if (onDownloadInvoice && materialId) {
      onDownloadInvoice();
    } else {
      console.error('Download handler or material ID not provided');
    }
  };

  return (
    <Tr>
      <Td w="200px" pl="0px">
        <Flex align="center" py={{ base: ".4rem", md: ".8rem" }} minWidth="100%" flexWrap="nowrap">
          <Image 
            src={image || logo} 
            w={imageSize} 
            h={imageSize} 
            me={{ base: "8px", sm: "12px", md: "18px" }} 
            objectFit="cover"
            borderRadius="md"
            alt={name}
            onError={(e) => {
              console.error(`Failed to load image for ${name}:`, image, e);
              e.target.src = logo; // Fallback to logo
            }}
            onLoad={() => {
              console.log(`Successfully loaded image for ${name}:`, image);
            }}
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

      <Td w="100px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {amountPerUnit}
        </Text>
      </Td>

      <Td w="120px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {unitCost}
        </Text>
      </Td>

      <Td w="180px">
        <Flex direction="column" align="center">
          <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
            {totalPurchaseCost}
          </Text>
          <Button
            variant="link"
            color="blue.500"
            fontSize={{ base: "xs", sm: "xs", md: "sm" }}
            p="0"
            h="auto"
            fontWeight="normal"
            onClick={handleDownloadInvoice}
            _hover={{ textDecoration: "underline" }}
            title={billNumber && billNumber !== 'N/A' ? `Bill Number: ${billNumber}` : 'Download Invoice'}
          >
            {invoiceLink}
          </Button>
        </Flex>
      </Td>

      <Td w="180px">
        <Text 
          fontSize={fontSize} 
          color={billNumber && billNumber !== 'N/A' ? textColor : "gray.400"} 
          fontWeight="bold"
          fontFamily="mono"
        >
          {billNumber && billNumber !== 'N/A' ? billNumber : "—"}
        </Text>
      </Td>

      <Td w="140px">
        <Flex direction="column" align="center">
          <Text fontSize={fontSize} color={textColor} fontWeight="bold" textTransform="capitalize" textAlign="center">
            {paymentMethod && paymentMethod !== 'N/A' ? paymentMethod.replace('_', ' ') : "—"}
          </Text>
          {paymentMethodNote && (
            <Text fontSize="xs" color="gray.500" mt="1" textAlign="center">
              {paymentMethodNote}
            </Text>
          )}
        </Flex>
      </Td>

      <Td w="160px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold">
          {supplierName || "—"}
        </Text>
      </Td>

      <Td w="100px">
        <Badge
          colorScheme={getStatusColor(status)}
          fontSize={{ base: "10px", sm: "12px", md: "14px" }}
          p={{ base: "1px 6px", sm: "2px 8px", md: "3px 10px" }}
          borderRadius="20px"
        >
          {status}
        </Badge>
      </Td>

      <Td w="100px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {wasteQuantity}
        </Text>
      </Td>

      <Td w="120px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {lossCost}
        </Text>
      </Td>

      <Td w="140px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center">
          {amountPending}
        </Text>
      </Td>

      <Td w="80px">
        <Flex justify="flex-end">
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
            <MenuList 
              minW="160px" 
              boxShadow="lg" 
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
            >
              <MenuItem 
                icon={<FaEye />} 
                onClick={() => {}}
                _hover={{ bg: useColorModeValue("blue.50", "blue.900") }}
                fontSize="sm"
              >
                View Details
              </MenuItem>
              <MenuItem 
                icon={<FaEdit />} 
                onClick={onEdit}
                _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
                fontSize="sm"
              >
                Edit Material
              </MenuItem>
              <MenuItem 
                icon={<FaExclamationTriangle />} 
                onClick={onWaste}
                color="#FF8D28"
                _hover={{ 
                  bg: useColorModeValue("orange.50", "orange.900"),
                  color: "#E67E22" 
                }}
                fontSize="sm"
              >
                Set Waste
              </MenuItem>
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
                Delete Material
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Td>
    </Tr>
  );
}

export default RawMaterialTableRow;
