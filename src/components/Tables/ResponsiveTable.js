import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Image,
  useColorModeValue,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import { HamburgerIcon, EditIcon, DeleteIcon, RepeatIcon } from "@chakra-ui/icons";

function ResponsiveTable({
  captions,
  children,
  data,
  renderMobileCard,
  actionButtons = [],
  searchBar,
  emptyState,
  isLoading = false,
  ...props
}) {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.800");

  // Default mobile card renderer
  const defaultMobileCard = (item, index) => (
    <Box key={index} bg={cardBg} mb="16px" boxShadow="lg" borderRadius="lg">
      <Box p="16px">
        <VStack spacing="12px" align="stretch">
          {/* Header with image and name */}
          <Flex justify="space-between" align="center">
            <Flex align="center">
              {item.logo && (
                <Image 
                  src={item.logo} 
                  w="40px" 
                  h="40px" 
                  me="12px" 
                  objectFit="cover" 
                  borderRadius="8px"
                />
              )}
              <VStack align="start" spacing="2px">
                <Text fontSize="md" color={textColor} fontWeight="bold">
                  {item.name}
                </Text>
                {item.category && (
                  <Text fontSize="sm" color="gray.500">
                    {item.category}
                  </Text>
                )}
              </VStack>
            </Flex>
            <Badge 
              colorScheme={
                item.status === "rented" && item.isOverdue 
                  ? "red" 
                  : item.status === "rented" 
                  ? "yellow" 
                  : item.status === "available" 
                  ? "green" 
                  : "gray"
              } 
              fontSize="10px" 
              p="4px 8px"
            >
              {item.status}
            </Badge>
          </Flex>

          {/* Main content grid */}
          <Flex justify="space-between" wrap="wrap" gap="12px">
            {item.quantity && (
              <VStack align="start" spacing="2px">
                <Text fontSize="xs" color="gray.500">Quantity</Text>
                <Text fontSize="sm" color={textColor} fontWeight="bold">
                  {item.quantity}
                </Text>
              </VStack>
            )}
            {item.stockValue && (
              <VStack align="start" spacing="2px">
                <Text fontSize="xs" color="gray.500">Stock Value</Text>
                <Text fontSize="sm" color={textColor} fontWeight="bold">
                  {item.stockValue}
                </Text>
              </VStack>
            )}
            {item.totalRented && (
              <VStack align="start" spacing="2px">
                <Text fontSize="xs" color="gray.500">Total Rented</Text>
                <Text fontSize="sm" color={textColor} fontWeight="bold">
                  {item.totalRented}
                </Text>
              </VStack>
            )}
            {item.currentRent && (
              <VStack align="start" spacing="2px">
                <Text fontSize="xs" color="gray.500">Current Rent</Text>
                <Text fontSize="sm" color={textColor} fontWeight="bold">
                  {item.currentRent}
                </Text>
              </VStack>
            )}
          </Flex>

          {/* Additional info */}
          {item.rentalDurationDays && (
            <Flex justify="space-between" wrap="wrap" gap="12px">
              <VStack align="start" spacing="2px">
                <Text fontSize="xs" color="gray.500">Duration</Text>
                <Text fontSize="sm" color={textColor} fontWeight="bold">
                  {item.rentalDurationDays} days
                </Text>
              </VStack>
              <VStack align="start" spacing="2px">
                <Text fontSize="xs" color="gray.500">Daily Rate</Text>
                <Text fontSize="sm" color={textColor} fontWeight="bold">
                  {item.dailyRate ? `PKR.${item.dailyRate}/day` : "—"}
                </Text>
              </VStack>
            </Flex>
          )}

          {/* Actions */}
          {actionButtons.length > 0 && (
            <Flex justify="flex-end" mt="8px">
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  rightIcon={<HamburgerIcon />}
                >
                  Actions
                </MenuButton>
                <MenuList>
                  {actionButtons.map((button, idx) => (
                    <MenuItem
                      key={idx}
                      icon={button.icon}
                      onClick={button.onClick}
                      color={button.color || "inherit"}
                    >
                      {button.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Flex>
          )}
        </VStack>
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return emptyState || (
      <Flex justify="center" align="center" minH="200px">
        <Text color="gray.500">No data available</Text>
      </Flex>
    );
  }

  const fontSize = useBreakpointValue({ base: "xs", md: "sm" });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });

  return (
    <>
      {/* Search Bar */}
      {searchBar}

      {/* Desktop Table View (md+) */}
      <Box display={{ base: "none", md: "block" }} w="100%">
        <Box 
          w="100%" 
          overflowX="auto" 
          css={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: useColorModeValue('#f1f1f1', '#2d3748'),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#FF8D28',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#E67E22',
            },
          }}
        >
          <Table 
            variant="simple" 
            color={textColor} 
            size={tableSize}
            w="100%" 
            minW="800px"
            {...props}
          >
            <Thead>
              <Tr my=".8rem" pl="0px" color="gray.400">
                {captions.map((caption, idx) => (
                  <Th
                    color="gray.400"
                    key={idx}
                    ps={idx === 0 ? "0px" : null}
                    fontSize={fontSize}
                    py={{ base: "8px", md: "12px" }}
                    whiteSpace="nowrap"
                    textAlign={
                      idx === 1 ? "center" : 
                      idx === 2 ? "center" : 
                      idx === 3 ? "center" : 
                      idx === 4 ? "center" : 
                      idx === 5 ? "center" : 
                      idx === 6 ? "center" : 
                      idx === 7 ? "center" : 
                      idx === 8 ? "right" : 
                      "left"
                    }
                    w={
                      idx === 0 ? "200px" : 
                      idx === 1 ? "100px" : 
                      idx === 2 ? "120px" : 
                      idx === 3 ? "130px" : 
                      idx === 4 ? "120px" : 
                      idx === 5 ? "120px" : 
                      idx === 6 ? "100px" : 
                      idx === 7 ? "120px" : 
                      "80px"
                    }
                    px="16px"
                  >
                    {caption}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {children}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Mobile Card View (base-md) */}
      <Box display={{ base: "block", md: "none" }} w="100%">
        <VStack spacing="16px" align="stretch">
          {data.map((item, index) => 
            renderMobileCard ? renderMobileCard(item, index) : defaultMobileCard(item, index)
          )}
        </VStack>
      </Box>
    </>
  );
}

export default ResponsiveTable;
