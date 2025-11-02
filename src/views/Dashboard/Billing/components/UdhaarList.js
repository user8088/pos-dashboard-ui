// Chakra imports
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Badge,
  useToast,
  Spinner,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { FiSearch } from "react-icons/fi";
import { staffService } from "services/staffService";

const UdhaarList = ({ onTotalChange }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
  const [udhaarData, setUdhaarData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();
  
  // Load Udhaar data from API
  const loadUdhaars = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await staffService.getUdhaars();
      if (response && response.success) {
        const data = response.data || [];
        setUdhaarData(data);
      } else {
        setUdhaarData([]);
      }
    } catch (error) {
      console.error('Failed to load Udhaars:', error);
      setUdhaarData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  React.useEffect(() => {
    loadUdhaars();
  }, [loadUdhaars]);

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  // Calculate and notify parent of total loans
  React.useEffect(() => {
    if (onTotalChange) {
      const total = udhaarData.reduce((sum, loan) => sum + parseFloat(loan.remaining_amount || 0), 0);
      onTotalChange(total);
    }
  }, [udhaarData, onTotalChange]);

  const filteredData = React.useMemo(() => {
    const q = query.toLowerCase();
    return udhaarData.filter(
      (row) =>
        (row.staff?.name || '').toLowerCase().includes(q) ||
        row.amount.toString().includes(q) ||
        row.loan_date.toLowerCase().includes(q) ||
        (row.notes && row.notes.toLowerCase().includes(q))
    );
  }, [udhaarData, query]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card>
      <Flex direction='column'>
        <CardHeader py='12px'>
          <Flex justify='space-between' align='center' w='100%'>
            <Text color={textColor} fontSize='lg' fontWeight='bold'>
              Udhaar (Loans to Staff)
            </Text>
            <Button
              colorScheme='teal'
              borderColor='#FF8D28'
              color='#FF8D28'
              variant='outline'
              fontSize='xs'
              p='8px 24px'
              onClick={onOpen}>
              VIEW ALL
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            {loading ? (
              <Flex justify="center" align="center" p="24px">
                <Spinner size="lg" />
              </Flex>
            ) : udhaarData.length === 0 ? (
              <Text color="gray.500" fontSize="sm" p="24px">
                No Udhaar records found
              </Text>
            ) : (
              udhaarData.slice(0, 3).map((row) => {
                return (
                  <Box
                    key={row.id}
                    p="24px"
                    bg={useColorModeValue("#F8F9FA", "gray.800")}
                    my="22px"
                    borderRadius="12px"
                  >
                    <Flex justify="space-between" w="100%">
                      <Flex direction="column" maxWidth="70%">
                        <Flex align="center" mb="10px">
                          <Text color={textColor} fontSize="md" fontWeight="bold" mr="12px">
                            {row.staff?.name || 'Unknown Staff'}
                          </Text>
                          <Badge colorScheme="orange" fontSize="xs">
                            {row.status === 'fully_paid' ? 'Paid' : 'Active'}
                          </Badge>
                        </Flex>
                        <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb="4px">
                          Amount:{" "}
                          <Text as="span" color="gray.700" fontWeight="bold">
                            {formatCurrency(row.amount)}
                          </Text>
                        </Text>
                        <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb="4px">
                          Date:{" "}
                          <Text as="span" color="gray.500">
                            {formatDate(row.loan_date)}
                          </Text>
                        </Text>
                        <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb="4px">
                          Remaining:{" "}
                          <Text as="span" color="red.500" fontWeight="bold">
                            {formatCurrency(row.remaining_amount)}
                          </Text>
                        </Text>
                        {row.notes && (
                          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                            Notes:{" "}
                            <Text as="span" color="gray.500">
                              {row.notes}
                            </Text>
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                );
              })
            )}
          </Flex>
        </CardBody>
      </Flex>

      {/* Glassy Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='4xl' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Udhaar Records</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb='16px'>
              <InputLeftElement pointerEvents='none'>
                <FiSearch color={useColorModeValue("#718096", "#A0AEC0")} />
              </InputLeftElement>
              <Input
                placeholder='Search Udhaar by staff name, amount, or date'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filteredData.length === 0 ? (
                <Text color="gray.500" fontSize="sm" p="24px" textAlign="center">
                  No Udhaar records found
                </Text>
              ) : (
                filteredData.map((row) => (
                  <Box
                    key={row.id}
                    p="24px"
                    bg={useColorModeValue("#F8F9FA", "gray.800")}
                    my="12px"
                    borderRadius="12px"
                  >
                    <Flex justify="space-between" w="100%">
                      <Flex direction="column" maxWidth="70%">
                        <Flex align="center" mb="10px">
                          <Text color={textColor} fontSize="md" fontWeight="bold" mr="12px">
                            {row.staff?.name || 'Unknown Staff'}
                          </Text>
                          <Badge colorScheme="orange" fontSize="xs">
                            {row.status === 'fully_paid' ? 'Paid' : 'Active'}
                          </Badge>
                        </Flex>
                        <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb="4px">
                          Amount:{" "}
                          <Text as="span" color="gray.700" fontWeight="bold">
                            {formatCurrency(row.amount)}
                          </Text>
                        </Text>
                        <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb="4px">
                          Date:{" "}
                          <Text as="span" color="gray.500">
                            {formatDate(row.loan_date)}
                          </Text>
                        </Text>
                        <Text color="gray.400" fontSize="sm" fontWeight="semibold" mb="4px">
                          Remaining:{" "}
                          <Text as="span" color="red.500" fontWeight="bold">
                            {formatCurrency(row.remaining_amount)}
                          </Text>
                        </Text>
                        {row.notes && (
                          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                            Notes:{" "}
                            <Text as="span" color="gray.500">
                              {row.notes}
                            </Text>
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                  </Box>
                ))
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default UdhaarList;

