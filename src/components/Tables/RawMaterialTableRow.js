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
  const { logo, name, amountPerUnit, unitCost, totalPurchaseCost, supplierName, wasteQuantity, lossCost, invoiceLink, status, amountPending, materialId, billNumber, paymentMethod, paymentMethodNote, image, onEdit, onDelete, onWaste, onDownloadInvoice } = props;
  const textColor = useColorModeValue("gray.700", "white");

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
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image 
            src={image || logo} 
            w="30px" 
            h="30px" 
            me="18px" 
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
            title={billNumber && billNumber !== 'N/A' ? `Bill Number: ${billNumber}` : 'Download Invoice'}
          >
            {invoiceLink}
          </Button>
        </Flex>
      </Td>

      <Td>
        <Text 
          fontSize="md" 
          color={billNumber && billNumber !== 'N/A' ? textColor : "gray.400"} 
          fontWeight="bold"
          fontFamily="mono"
        >
          {billNumber && billNumber !== 'N/A' ? billNumber : "—"}
        </Text>
      </Td>

      <Td>
        <Flex direction="column">
          <Text fontSize="md" color={textColor} fontWeight="bold" textTransform="capitalize">
            {paymentMethod && paymentMethod !== 'N/A' ? paymentMethod.replace('_', ' ') : "—"}
          </Text>
          {paymentMethodNote && (
            <Text fontSize="xs" color="gray.500" mt="1">
              {paymentMethodNote}
            </Text>
          )}
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
