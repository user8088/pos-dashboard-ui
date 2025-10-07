import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Badge,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { FaPencilAlt, FaTrashAlt, FaCheck, FaClock } from "react-icons/fa";

function BillingRow(props) {
  const textColor = useColorModeValue("gray.700", "white");
  const bgColor = useColorModeValue("#F8F9FA", "gray.800");
  const nameColor = useColorModeValue("gray.500", "white");
  const toast = useToast();
  const { 
    id, 
    type, 
    name, 
    description, 
    amount, 
    status, 
    due_date, 
    created_at, 
    paid_at,
    onEdit, 
    onDelete, 
    onMarkPaid 
  } = props;

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `PKR.${amount?.toLocaleString() || '0.00'}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'bill':
        return 'blue';
      case 'rent':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate || status === 'paid') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <Box p="24px" bg={bgColor} my="22px" borderRadius="12px">
      <Flex justify="space-between" w="100%">
        <Flex direction="column" maxWidth="70%">
          <Flex align="center" gap="12px" mb="10px">
            <Text color={nameColor} fontSize="md" fontWeight="bold">
              {name}
            </Text>
            <Badge
              colorScheme={getTypeColor(type)}
              fontSize="xs"
              px="8px"
              py="2px"
              borderRadius="12px"
            >
              {type?.toUpperCase() || 'BILL'}
            </Badge>
            <Badge
              colorScheme={getStatusColor(status)}
              fontSize="xs"
              px="8px"
              py="2px"
              borderRadius="12px"
            >
              {status?.toUpperCase() || 'PENDING'}
            </Badge>
            {isOverdue(due_date) && (
              <Badge
                colorScheme="red"
                fontSize="xs"
                px="8px"
                py="2px"
                borderRadius="12px"
              >
                OVERDUE
              </Badge>
            )}
          </Flex>
          
          {description && (
            <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb="8px">
              Description:{" "}
              <Text as="span" color="gray.500">
                {description}
              </Text>
            </Text>
          )}
          
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Amount:{" "}
            <Text as="span" color="gray.500" fontWeight="bold">
              {formatAmount(amount)}
            </Text>
          </Text>
          
          {due_date && (
            <Text color="gray.400" fontSize="sm" fontWeight="semibold">
              Due Date:{" "}
              <Text as="span" color={isOverdue(due_date) ? "red.500" : "gray.500"}>
                {formatDate(due_date)}
              </Text>
            </Text>
          )}
          
          {paid_at && (
            <Text color="gray.400" fontSize="sm" fontWeight="semibold">
              Paid On:{" "}
              <Text as="span" color="green.500">
                {formatDate(paid_at)}
              </Text>
            </Text>
          )}
        </Flex>
        <Flex
          direction={{ sm: "column", md: "row" }}
          align="flex-start"
          p={{ md: "24px" }}
          gap="8px"
        >
          {status !== 'paid' && (
            <Button
              bg="white"
              color="#FF8D28"
              border="2px solid #FF8D28"
              borderRadius="full"
              px="24px"
              py="12px"
              mb={{ sm: "10px", md: "0px" }}
              me={{ md: "12px" }}
              onClick={onMarkPaid}
              _hover={{
                bg: "#FF8D28",
                color: "white",
              }}
            >
              <Flex align="center">
                <Icon as={FaCheck} me="4px" />
                <Text fontSize="sm" fontWeight="semibold">
                  MARK PAID
                </Text>
              </Flex>
            </Button>
          )}
          
          <Button
            p="0px"
            bg="transparent"
            mb={{ sm: "10px", md: "0px" }}
            me={{ md: "12px" }}
            onClick={onEdit}
          >
            <Flex color={textColor} cursor="pointer" align="center" p="12px">
              <Icon as={FaPencilAlt} me="4px" />
              <Text fontSize="sm" fontWeight="semibold">
                EDIT
              </Text>
            </Flex>
          </Button>
          
          <Button
            p="0px"
            bg="transparent"
            onClick={onDelete}
          >
            <Flex color="red.500" cursor="pointer" align="center" p="12px">
              <Icon as={FaTrashAlt} me="4px" />
              <Text fontSize="sm" fontWeight="semibold">
                DELETE
              </Text>
            </Flex>
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export default BillingRow;
