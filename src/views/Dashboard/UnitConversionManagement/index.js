import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
  VStack,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Divider,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { FaPlus, FaEdit, FaTrash, FaEllipsisV, FaExchangeAlt } from "react-icons/fa";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import unitConversionService from "services/unitConversionService";

function UnitConversionManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const bgCard = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  // State
  const [conversions, setConversions] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState(null);

  // Modal for creating/editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Form state
  const [formData, setFormData] = useState({
    primaryUnitId: "",
    secondaryUnitId: "",
    conversionFactor: "",
    notes: "",
  });

  useEffect(() => {
    fetchUnits();
    fetchConversions();
  }, []);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/core/unit`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      toast({
        title: "Error",
        description: "Failed to load units",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchConversions = async () => {
    setIsLoading(true);
    try {
      const data = await unitConversionService.getUnitConversions();
      if (data.data) {
        setConversions(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversions:', error);
      toast({
        title: "Error",
        description: "Failed to load unit conversions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (conversion = null) => {
    if (conversion) {
      setSelectedConversion(conversion);
      setFormData({
        primaryUnitId: conversion.primary_unit?.id || conversion.primary_unit_id,
        secondaryUnitId: conversion.secondary_unit?.id || conversion.secondary_unit_id,
        conversionFactor: conversion.conversion_factor,
        notes: conversion.notes || "",
      });
    } else {
      setSelectedConversion(null);
      setFormData({
        primaryUnitId: "",
        secondaryUnitId: "",
        conversionFactor: "",
        notes: "",
      });
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedConversion(null);
    setFormData({
      primaryUnitId: "",
      secondaryUnitId: "",
      conversionFactor: "",
      notes: "",
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.primaryUnitId || !formData.secondaryUnitId || !formData.conversionFactor) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.primaryUnitId === formData.secondaryUnitId) {
      toast({
        title: "Validation Error",
        description: "Primary and secondary units must be different",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (selectedConversion) {
        // Update existing
        response = await unitConversionService.updateUnitConversion(
          selectedConversion.id,
          parseFloat(formData.conversionFactor),
          formData.notes
        );
      } else {
        // Create new
        response = await unitConversionService.createUnitConversion(
          parseInt(formData.primaryUnitId),
          parseInt(formData.secondaryUnitId),
          parseFloat(formData.conversionFactor),
          formData.notes
        );
      }

      if (response.message || response.data) {
        toast({
          title: selectedConversion ? "Updated" : "Created",
          description: `Unit conversion ${selectedConversion ? "updated" : "created"} successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        handleCloseModal();
        fetchConversions();
      } else if (response.error) {
        toast({
          title: "Error",
          description: response.error || "Operation failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this conversion?")) return;

    try {
      await unitConversionService.deleteUnitConversion(id);
      toast({
        title: "Deleted",
        description: "Unit conversion deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchConversions();
    } catch (error) {
      console.error('Error deleting conversion:', error);
      toast({
        title: "Error",
        description: "Failed to delete unit conversion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.unit_id === unitId);
    return unit ? unit.unit_name : "Unknown";
  };

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", lg: "hidden" }} mb="20px">
        <CardHeader p="12px 5px" mb="12px">
          <Flex justifyContent="space-between" align="center">
            <Text fontSize="lg" color={textColor} fontWeight="bold">
              Unit Conversions
            </Text>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="brand"
              bg="#FF8D28"
              _hover={{ bg: "#E67E22" }}
              size="sm"
              onClick={() => handleOpenModal()}
            >
              New Conversion
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" align="center" minH="300px">
              <Spinner color="#FF8D28" size="lg" />
            </Flex>
          ) : conversions.length === 0 ? (
            <Flex justify="center" align="center" minH="300px">
              <Text color="gray.500" fontSize="lg">
                No unit conversions set up yet. Create one to get started.
              </Text>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr borderBottom={`1px solid ${borderColor}`}>
                    <Th color={textColor} fontSize="sm" fontWeight="bold">
                      Primary Unit
                    </Th>
                    <Th color={textColor} fontSize="sm" fontWeight="bold">
                      Secondary Unit
                    </Th>
                    <Th color={textColor} fontSize="sm" fontWeight="bold">
                      Conversion Factor
                    </Th>
                    <Th color={textColor} fontSize="sm" fontWeight="bold">
                      Example
                    </Th>
                    <Th color={textColor} fontSize="sm" fontWeight="bold">
                      Notes
                    </Th>
                    <Th color={textColor} fontSize="sm" fontWeight="bold" textAlign="center">
                      Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {conversions.map((conversion) => (
                    <Tr key={conversion.id} borderBottom={`1px solid ${borderColor}`} _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
                      <Td>
                        <Text color={textColor} fontSize="sm" fontWeight="500">
                          {conversion.primary_unit?.unit_name || "Unknown"}
                        </Text>
                      </Td>
                      <Td>
                        <Text color={textColor} fontSize="sm" fontWeight="500">
                          {conversion.secondary_unit?.unit_name || "Unknown"}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue" px="10px" py="5px" borderRadius="4px">
                          {conversion.conversion_factor}
                        </Badge>
                      </Td>
                      <Td>
                        <Text color="gray.500" fontSize="sm">
                          1 {conversion.primary_unit?.unit_name} = {conversion.conversion_factor} {conversion.secondary_unit?.unit_name}
                        </Text>
                      </Td>
                      <Td>
                        <Text color="gray.500" fontSize="xs" noOfLines={1}>
                          {conversion.notes || "-"}
                        </Text>
                      </Td>
                      <Td textAlign="center">
                        <HStack spacing="0" justify="center">
                          <Button
                            icon={<EditIcon />}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(conversion)}
                            aria-label="Edit"
                          />
                          <Button
                            icon={<DeleteIcon />}
                            variant="ghost"
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(conversion.id)}
                            aria-label="Delete"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(6px)" />
        <ModalContent>
          <ModalHeader color={textColor}>
            {selectedConversion ? "Edit Unit Conversion" : "Create New Unit Conversion"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="24px">
            <VStack spacing="16px">
              <FormControl isRequired>
                <FormLabel color={textColor}>Primary Unit</FormLabel>
                <Select
                  placeholder="Select primary unit"
                  value={formData.primaryUnitId}
                  onChange={(e) => setFormData({ ...formData, primaryUnitId: e.target.value })}
                >
                  {units.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name} ({unit.metric})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Secondary Unit</FormLabel>
                <Select
                  placeholder="Select secondary unit"
                  value={formData.secondaryUnitId}
                  onChange={(e) => setFormData({ ...formData, secondaryUnitId: e.target.value })}
                >
                  {units.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name} ({unit.metric})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Conversion Factor</FormLabel>
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 1000 (for 1 KG = 1000 grams)"
                  value={formData.conversionFactor}
                  onChange={(e) => setFormData({ ...formData, conversionFactor: e.target.value })}
                />
                <Text fontSize="xs" color="gray.500" mt="4px">
                  How many secondary units in 1 primary unit
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Notes (Optional)</FormLabel>
                <Input
                  placeholder="e.g., 1 KG = 1000 grams (standard conversion)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              bg="#FF8D28"
              color="white"
              _hover={{ bg: "#E67E22" }}
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              {selectedConversion ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default UnitConversionManagement;
