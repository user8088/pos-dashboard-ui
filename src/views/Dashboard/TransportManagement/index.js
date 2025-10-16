import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  Badge,
  Icon,
  IconButton,
  Tooltip,
  useColorModeValue,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  HStack,
  VStack,
  Divider,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FaTruck,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaGasPump,
  FaMoneyBillWave,
  FaChartLine,
  FaBox,
  FaUser,
  FaRoad,
  FaCalculator,
  FaCheck,
} from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';

function TransportManagement() {
  const toast = useToast();
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgCard = useColorModeValue('white', 'gray.700');
  const bgStats = useColorModeValue('gray.50', 'gray.800');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  // State
  const [vehicles, setVehicles] = useState([]);
  const [runs, setRuns] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingRuns, setIsLoadingRuns] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  
  // Vehicle Modal
  const { isOpen: isVehicleOpen, onOpen: onVehicleOpen, onClose: onVehicleClose } = useDisclosure();
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    plate_number: '',
    type: 'truck',
    fuel_efficiency: 12.5,
    active: true,
  });

  // Run Modal
  const { isOpen: isRunOpen, onOpen: onRunOpen, onClose: onRunClose } = useDisclosure();
  const [runForm, setRunForm] = useState({
    vehicle_id: '',
    driver_name: '',
    start_time: '',
    end_time: '',
    distance_km: 0,
    items: [{ stock_id: '', quantity: 1, unit_profit: 0 }],
    costs: [{ type: 'fuel', label: '', amount: 0 }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchVehicles();
    fetchRuns();
    fetchStockItems();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/core/transport/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        throw new Error('Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const fetchRuns = async () => {
    try {
      setIsLoadingRuns(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/core/transport/runs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRuns(data);
      } else {
        throw new Error('Failed to fetch runs');
      }
    } catch (error) {
      console.error('Error fetching runs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transport runs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingRuns(false);
    }
  };

  const fetchStockItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/core/stock`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStockItems(data);
      }
    } catch (error) {
      console.error('Error fetching stock items:', error);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setVehicleForm({
      name: '',
      plate_number: '',
      type: 'truck',
      fuel_efficiency: 12.5,
      active: true,
    });
    onVehicleOpen();
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name,
      plate_number: vehicle.plate_number,
      type: vehicle.type,
      fuel_efficiency: vehicle.fuel_efficiency,
      active: vehicle.active,
    });
    onVehicleOpen();
  };

  const handleSaveVehicle = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const url = selectedVehicle
        ? `${apiUrl}/core/transport/vehicles/${selectedVehicle.id}`
        : `${apiUrl}/core/transport/vehicles`;

      const response = await fetch(url, {
        method: selectedVehicle ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleForm),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Vehicle ${selectedVehicle ? 'updated' : 'added'} successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onVehicleClose();
        fetchVehicles();
      } else {
        throw new Error('Failed to save vehicle');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to save vehicle',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/core/transport/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Vehicle deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchVehicles();
      } else {
        throw new Error('Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCompleteRun = async (runId) => {
    if (!window.confirm('Complete and delete this run? This will remove it from active runs and stats.')) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/core/transport/runs/${runId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'Run Completed',
          description: 'Transport run has been completed and removed',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        // Refresh runs list which will automatically update the stats
        fetchRuns();
      } else {
        throw new Error('Failed to complete run');
      }
    } catch (error) {
      console.error('Error completing run:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete run',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddRun = () => {
    setSelectedRun(null);
    setRunForm({
      vehicle_id: '',
      driver_name: '',
      start_time: '',
      end_time: '',
      distance_km: 0,
      items: [{ stock_id: '', quantity: 1, unit_profit: 0 }],
      costs: [{ type: 'fuel', label: '', amount: 0 }],
    });
    onRunOpen();
  };

  const handleAddRunItem = () => {
    setRunForm({
      ...runForm,
      items: [...runForm.items, { stock_id: '', quantity: 1, unit_profit: 0 }],
    });
  };

  const handleRemoveRunItem = (index) => {
    setRunForm({
      ...runForm,
      items: runForm.items.filter((_, i) => i !== index),
    });
  };

  const handleRunItemChange = (index, field, value) => {
    const updatedItems = [...runForm.items];
    updatedItems[index][field] = value;
    
    // Auto-calculate unit_profit when stock item is selected
    if (field === 'stock_id' && value) {
      const selectedStock = stockItems.find(stock => stock.item_id === parseInt(value));
      if (selectedStock && selectedStock.item_price) {
        updatedItems[index]['unit_profit'] = parseFloat(selectedStock.item_price);
      }
    }
    
    setRunForm({ ...runForm, items: updatedItems });
  };

  const handleAddCost = () => {
    setRunForm({
      ...runForm,
      costs: [...runForm.costs, { type: 'fuel', label: '', amount: 0 }],
    });
  };

  const handleRemoveCost = (index) => {
    setRunForm({
      ...runForm,
      costs: runForm.costs.filter((_, i) => i !== index),
    });
  };

  const handleCostChange = (index, field, value) => {
    const updatedCosts = [...runForm.costs];
    updatedCosts[index][field] = value;
    setRunForm({ ...runForm, costs: updatedCosts });
  };

  const handleSaveRun = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/core/transport/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runForm),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: `Transport run created! ${result.summary.profit_status === 'profit' ? '✅ Profitable' : '⚠️ Loss'}`,
          status: result.summary.profit_status === 'profit' ? 'success' : 'warning',
          duration: 5000,
          isClosable: true,
        });
        onRunClose();
        fetchRuns();
      } else {
        throw new Error('Failed to create run');
      }
    } catch (error) {
      console.error('Error saving run:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transport run',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `PKR ${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'planned': return 'purple';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getProfitColor = (netProfit) => {
    return netProfit >= 0 ? 'green' : 'red';
  };

  // Calculate summary statistics
  const totalRuns = runs.length;
  const profitableRuns = runs.filter(r => r.net_profit >= 0).length;
  const totalProfit = runs.reduce((sum, r) => sum + parseFloat(r.estimated_profit || 0), 0);
  const totalCosts = runs.reduce((sum, r) => sum + parseFloat(r.total_cost || 0), 0);
  const netProfit = totalProfit - totalCosts;

  return (
    <Flex direction="column" pt={{ base: '120px', md: '75px' }} px={{ base: 4, md: 6 }} w="full" maxW="full">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color={textColor}>
            Transport Management
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Track delivery costs, monitor profit/loss per run
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FaTruck />}
            colorScheme="brand"
            size={isMobile ? 'sm' : 'md'}
            onClick={handleAddVehicle}
          >
            Add Vehicle
          </Button>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            size={isMobile ? 'sm' : 'md'}
            onClick={handleAddRun}
          >
            New Run
          </Button>
        </HStack>
      </Flex>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Total Runs</StatLabel>
              <StatNumber fontSize="2xl" color={textColor}>{totalRuns}</StatNumber>
              <StatHelpText fontSize="xs">
                <Badge colorScheme="green" fontSize="2xs">{profitableRuns}</Badge> profitable
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Total Revenue</StatLabel>
              <StatNumber fontSize="xl" color="green.500">{formatCurrency(totalProfit)}</StatNumber>
              <StatHelpText fontSize="xs">From all runs</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Total Costs</StatLabel>
              <StatNumber fontSize="xl" color="orange.500">{formatCurrency(totalCosts)}</StatNumber>
              <StatHelpText fontSize="xs">All expenses</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">Net Profit/Loss</StatLabel>
              <StatNumber fontSize="xl" color={getProfitColor(netProfit)}>
                {formatCurrency(netProfit)}
              </StatNumber>
              <StatHelpText fontSize="xs">
                {netProfit >= 0 ? (
                  <><StatArrow type="increase" /> Profit</>
                ) : (
                  <><StatArrow type="decrease" /> Loss</>
                )}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Vehicles Section */}
      <Card mb={6}>
        <CardHeader py={4}>
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Icon as={FaTruck} boxSize={5} color={brandColor} />
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Fleet
              </Text>
              <Badge colorScheme="blue" fontSize="sm" px={2} py={1} borderRadius="full">
                {vehicles.length}
              </Badge>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={2}>
          {isLoadingVehicles ? (
            <Flex justify="center" align="center" py={16}>
              <VStack spacing={4}>
                <Spinner size="xl" color={brandColor} thickness="4px" />
                <Text color="gray.500" fontSize="sm">Loading vehicles...</Text>
              </VStack>
            </Flex>
          ) : vehicles.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py={16} px={4}>
              <Icon as={MdLocalShipping} boxSize={20} color="gray.300" mb={4} />
              <Text color={textColor} fontWeight="semibold" fontSize="lg" mb={2}>No Vehicles Yet</Text>
              <Text color="gray.500" fontSize="sm" textAlign="center" mb={6} maxW="400px">
                Start building your fleet by adding your first delivery vehicle
              </Text>
              <Button 
                leftIcon={<FaTruck />}
                colorScheme="brand" 
                size="lg"
                onClick={handleAddVehicle}
                boxShadow="md"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Add Your First Vehicle
              </Button>
            </Flex>
          ) : (
            <Grid 
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(2, 1fr)' }} 
              gap={8}
            >
              {vehicles.map((vehicle) => (
                <Card 
                  key={vehicle.id} 
                  bg={bgCard} 
                  border="1px" 
                  borderColor={borderColor}
                  boxShadow="md"
                  _hover={{ 
                    boxShadow: 'xl', 
                    transform: 'translateY(-4px)',
                    borderColor: vehicle.active ? brandColor : borderColor 
                  }}
                  transition="all 0.3s"
                  borderRadius="2xl"
                  overflow="hidden"
                >
                  <CardBody p={8}>
                    {/* Header with Icon and Menu */}
                    <Flex justify="space-between" align="start" mb={8}>
                      <HStack spacing={6}>
                        <Flex
                          align="center"
                          justify="center"
                          w="80px"
                          h="80px"
                          borderRadius="2xl"
                          bg={vehicle.active ? 'orange.50' : 'gray.100'}
                          border="3px solid"
                          borderColor={vehicle.active ? 'orange.200' : 'gray.200'}
                        >
                          <Icon 
                            as={FaTruck} 
                            boxSize={10} 
                            color={vehicle.active ? brandColor : 'gray.400'} 
                          />
                        </Flex>
                        <VStack align="start" spacing={3}>
                          <Text fontWeight="bold" fontSize="2xl" color={textColor}>
                            {vehicle.name}
                          </Text>
                          <VStack align="start" spacing={2}>
                            <Badge 
                              colorScheme={vehicle.active ? 'green' : 'gray'} 
                              fontSize="sm" 
                              px={4}
                              py={1.5}
                              borderRadius="full"
                              fontWeight="semibold"
                            >
                              <HStack spacing={2}>
                                <Box
                                  w={2}
                                  h={2}
                                  borderRadius="full"
                                  bg={vehicle.active ? 'green.400' : 'gray.400'}
                                />
                                <Text>{vehicle.active ? 'Active' : 'Inactive'}</Text>
                              </HStack>
                            </Badge>
                            <Text fontSize="md" color="gray.500" fontFamily="mono" fontWeight="medium">
                              {vehicle.plate_number}
                            </Text>
                          </VStack>
                        </VStack>
                      </HStack>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FaEllipsisV />}
                          size="md"
                          variant="ghost"
                          color="gray.400"
                          _hover={{ bg: 'gray.100', color: textColor }}
                        />
                        <MenuList>
                          <MenuItem icon={<FaEdit />} onClick={() => handleEditVehicle(vehicle)}>
                            Edit Vehicle
                          </MenuItem>
                          <MenuItem 
                            icon={<FaTrash />} 
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            color="red.500"
                          >
                            Delete Vehicle
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                    
                    <Divider mb={8} />
                    
                    {/* Vehicle Details */}
                    <Grid templateColumns="1fr 1fr" gap={6}>
                      <VStack 
                        align="start" 
                        spacing={3} 
                        p={5} 
                        bg={bgStats} 
                        borderRadius="xl"
                      >
                        <HStack spacing={3}>
                          <Icon as={FaBox} boxSize={5} color="blue.500" />
                          <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                            Type
                          </Text>
                        </HStack>
                        <Text fontSize="xl" fontWeight="bold" color={textColor} textTransform="capitalize">
                          {vehicle.type}
                        </Text>
                      </VStack>
                      
                      <VStack 
                        align="start" 
                        spacing={3} 
                        p={5} 
                        bg={bgStats} 
                        borderRadius="xl"
                      >
                        <HStack spacing={3}>
                          <Icon as={FaGasPump} boxSize={5} color="green.500" />
                          <Text fontSize="sm" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                            Efficiency
                          </Text>
                        </HStack>
                        <Text fontSize="xl" fontWeight="bold" color={textColor}>
                          {vehicle.fuel_efficiency} <Text as="span" fontSize="md" color="gray.500">km/L</Text>
                        </Text>
                      </VStack>
                    </Grid>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </CardBody>
      </Card>

      {/* Transport Runs Section */}
      <Card>
        <CardHeader py={4}>
          <HStack spacing={2}>
            <Icon as={FaRoad} boxSize={5} color={brandColor} />
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Transport Runs
            </Text>
            <Badge colorScheme="purple" fontSize="sm" px={2} py={1} borderRadius="full">
              {runs.length}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={2}>
          {isLoadingRuns ? (
            <Flex justify="center" align="center" py={16}>
              <VStack spacing={4}>
                <Spinner size="xl" color={brandColor} thickness="4px" />
                <Text color="gray.500" fontSize="sm">Loading transport runs...</Text>
              </VStack>
            </Flex>
          ) : runs.length === 0 ? (
            <Flex direction="column" align="center" justify="center" py={16} px={4}>
              <Icon as={FaChartLine} boxSize={20} color="gray.300" mb={4} />
              <Text color={textColor} fontWeight="semibold" fontSize="lg" mb={2}>No Transport Runs Yet</Text>
              <Text color="gray.500" fontSize="sm" textAlign="center" mb={6} maxW="400px">
                Create your first transport run to start tracking delivery costs and profits
              </Text>
              <Button 
                leftIcon={<FaRoad />}
                colorScheme="blue" 
                size="lg"
                onClick={handleAddRun}
                boxShadow="md"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Create First Run
              </Button>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th py={4} fontSize="xs">Vehicle</Th>
                    <Th py={4} fontSize="xs">Driver</Th>
                    <Th py={4} fontSize="xs">Date</Th>
                    <Th py={4} fontSize="xs" isNumeric>Distance</Th>
                    <Th py={4} fontSize="xs" isNumeric>Est. Revenue</Th>
                    <Th py={4} fontSize="xs" isNumeric>Total Cost</Th>
                    <Th py={4} fontSize="xs" isNumeric>Net P/L</Th>
                    <Th py={4} fontSize="xs">Status</Th>
                    <Th py={4} fontSize="xs">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {runs.map((run) => (
                    <Tr key={run.id} _hover={{ bg: bgStats }}>
                      <Td py={4} px={4}>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="md">
                            {run.vehicle?.name || 'N/A'}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {run.vehicle?.plate_number}
                          </Text>
                        </VStack>
                      </Td>
                      <Td py={4} px={4}>
                        <HStack spacing={2}>
                          <Icon as={FaUser} boxSize={4} color="gray.400" />
                          <Text fontSize="md">{run.driver_name}</Text>
                        </HStack>
                      </Td>
                      <Td py={4} px={4} fontSize="md">{formatDate(run.start_time)}</Td>
                      <Td py={4} px={4} isNumeric fontSize="md">{run.distance_km} km</Td>
                      <Td py={4} px={4} isNumeric fontSize="md" color="green.500" fontWeight="semibold">
                        {formatCurrency(run.estimated_profit)}
                      </Td>
                      <Td py={4} px={4} isNumeric fontSize="md" color="orange.500" fontWeight="semibold">
                        {formatCurrency(run.total_cost)}
                      </Td>
                      <Td py={4} px={4} isNumeric>
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color={getProfitColor(run.net_profit)}
                        >
                          {formatCurrency(run.net_profit)}
                        </Text>
                      </Td>
                      <Td py={4} px={4}>
                        <Badge colorScheme={getStatusColor(run.status)} fontSize="sm" px={3} py={1}>
                          {run.status || 'planned'}
                        </Badge>
                      </Td>
                      <Td py={4} px={4}>
                        <HStack spacing={2}>
                          <Tooltip label="Complete & Remove Run">
                            <IconButton
                              icon={<FaCheck />}
                              size="sm"
                              colorScheme="green"
                              variant="outline"
                              onClick={() => handleCompleteRun(run.id)}
                            />
                          </Tooltip>
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

      {/* Vehicle Modal */}
      <Modal isOpen={isVehicleOpen} onClose={onVehicleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Vehicle Name</FormLabel>
                <Input
                  value={vehicleForm.name}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                  placeholder="e.g., Suzuki Pickup"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Plate Number</FormLabel>
                <Input
                  value={vehicleForm.plate_number}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plate_number: e.target.value })}
                  placeholder="e.g., ABC-123"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Type</FormLabel>
                <Select
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="pickup">Pickup</option>
                  <option value="bike">Bike</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Fuel Efficiency (km/L)</FormLabel>
                <NumberInput
                  value={vehicleForm.fuel_efficiency}
                  onChange={(val) => setVehicleForm({ ...vehicleForm, fuel_efficiency: parseFloat(val) })}
                  min={0}
                  step={0.1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Status</FormLabel>
                <Select
                  value={vehicleForm.active}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, active: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onVehicleClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveVehicle} isLoading={isSubmitting}>
              {selectedVehicle ? 'Update' : 'Add'} Vehicle
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Run Modal */}
      <Modal isOpen={isRunOpen} onClose={onRunClose} size="2xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>Create Transport Run</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Basic Info */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Vehicle</FormLabel>
                <Select
                  value={runForm.vehicle_id}
                  onChange={(e) => setRunForm({ ...runForm, vehicle_id: e.target.value })}
                  placeholder="Select vehicle"
                >
                  {vehicles.filter(v => v.active).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.plate_number}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Driver Name</FormLabel>
                <Input
                  value={runForm.driver_name}
                  onChange={(e) => setRunForm({ ...runForm, driver_name: e.target.value })}
                  placeholder="Driver name"
                />
              </FormControl>

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Start Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={runForm.start_time}
                    onChange={(e) => setRunForm({ ...runForm, start_time: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">End Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={runForm.end_time}
                    onChange={(e) => setRunForm({ ...runForm, end_time: e.target.value })}
                  />
                </FormControl>
              </Grid>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Distance (km)</FormLabel>
                <NumberInput
                  value={runForm.distance_km}
                  onChange={(val) => setRunForm({ ...runForm, distance_km: parseFloat(val) })}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Divider />

              {/* Items Section */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontWeight="bold" fontSize="sm">
                    <Icon as={FaBox} mr={2} />
                    Items to Deliver
                  </Text>
                  <Button size="xs" colorScheme="blue" onClick={handleAddRunItem}>
                    + Add Item
                  </Button>
                </Flex>

                <VStack spacing={3}>
                  {runForm.items.map((item, index) => {
                    const totalProfit = (parseInt(item.quantity) || 0) * (parseFloat(item.unit_profit) || 0);
                    return (
                      <Card key={index} w="full" bg={bgStats}>
                        <CardBody p={3}>
                          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr auto' }} gap={3}>
                            <FormControl size="sm">
                              <FormLabel fontSize="xs">Stock Item</FormLabel>
                              <Select
                                size="sm"
                                value={item.stock_id}
                                onChange={(e) => handleRunItemChange(index, 'stock_id', e.target.value)}
                                placeholder="Select item"
                              >
                                {stockItems.map((stock) => (
                                  <option key={stock.item_id} value={stock.item_id}>
                                    {stock.item_name}
                                  </option>
                                ))}
                              </Select>
                            </FormControl>

                            <FormControl size="sm">
                              <FormLabel fontSize="xs">Quantity</FormLabel>
                              <NumberInput
                                size="sm"
                                value={item.quantity}
                                onChange={(val) => handleRunItemChange(index, 'quantity', parseInt(val))}
                                min={1}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>

                            <FormControl size="sm">
                              <FormLabel fontSize="xs">Unit Profit (PKR)</FormLabel>
                              <NumberInput
                                size="sm"
                                value={item.unit_profit}
                                onChange={(val) => handleRunItemChange(index, 'unit_profit', parseFloat(val))}
                                min={0}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>

                            <Flex align="flex-end" pb={1}>
                              <IconButton
                                size="sm"
                                colorScheme="red"
                                icon={<FaTrash />}
                                onClick={() => handleRemoveRunItem(index)}
                                isDisabled={runForm.items.length === 1}
                              />
                            </Flex>
                          </Grid>
                          
                          {/* Total Profit Display */}
                          {totalProfit > 0 && (
                            <Box mt={2} textAlign="right">
                              <Text fontSize="xs" color="gray.500" display="inline" mr={2}>
                                Total:
                              </Text>
                              <Text fontSize="sm" fontWeight="bold" color="green.600" display="inline">
                                PKR {totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </Text>
                            </Box>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </VStack>
              </Box>

              <Divider />

              {/* Costs Section */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontWeight="bold" fontSize="sm">
                    <Icon as={FaMoneyBillWave} mr={2} />
                    Operational Costs
                  </Text>
                  <Button size="xs" colorScheme="orange" onClick={handleAddCost}>
                    + Add Cost
                  </Button>
                </Flex>

                <VStack spacing={3}>
                  {runForm.costs.map((cost, index) => (
                    <Card key={index} w="full" bg={bgStats}>
                      <CardBody p={3}>
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr auto' }} gap={3}>
                          <FormControl size="sm">
                            <FormLabel fontSize="xs">Type</FormLabel>
                            <Select
                              size="sm"
                              value={cost.type}
                              onChange={(e) => handleCostChange(index, 'type', e.target.value)}
                            >
                              <option value="fuel">Fuel</option>
                              <option value="driver">Driver Wage</option>
                              <option value="toll">Toll</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="other">Other</option>
                            </Select>
                          </FormControl>

                          <FormControl size="sm">
                            <FormLabel fontSize="xs">Label/Note</FormLabel>
                            <Input
                              size="sm"
                              value={cost.label}
                              onChange={(e) => handleCostChange(index, 'label', e.target.value)}
                              placeholder="e.g., PSO Station"
                            />
                          </FormControl>

                          <FormControl size="sm" isRequired>
                            <FormLabel fontSize="xs">Amount (PKR)</FormLabel>
                            <NumberInput
                              size="sm"
                              value={cost.amount}
                              onChange={(val) => handleCostChange(index, 'amount', parseFloat(val))}
                              min={0}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </FormControl>

                          <Flex align="flex-end" pb={1}>
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              icon={<FaTrash />}
                              onClick={() => handleRemoveCost(index)}
                              isDisabled={runForm.costs.length === 1}
                            />
                          </Flex>
                        </Grid>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>
              
              {/* Summary Section */}
              <Box mt={4} p={4} bg={useColorModeValue('blue.50', 'gray.700')} borderRadius="lg">
                <VStack spacing={2} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      Total Expected Revenue:
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="green.600">
                      PKR {runForm.items.reduce((sum, item) => 
                        sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.unit_profit) || 0)), 0
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </Flex>
                  
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      Total Operational Costs:
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="orange.600">
                      PKR {runForm.costs.reduce((sum, cost) => 
                        sum + (parseFloat(cost.amount) || 0), 0
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </Flex>
                  
                  <Divider />
                  
                  <Flex justify="space-between" align="center">
                    <Text fontSize="md" fontWeight="bold" color={textColor}>
                      Net Profit/Loss:
                    </Text>
                    <Text 
                      fontSize="lg" 
                      fontWeight="bold" 
                      color={
                        (runForm.items.reduce((sum, item) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.unit_profit) || 0)), 0) -
                        runForm.costs.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0)) >= 0 
                          ? 'green.600' 
                          : 'red.600'
                      }
                    >
                      PKR {(
                        runForm.items.reduce((sum, item) => sum + ((parseInt(item.quantity) || 0) * (parseFloat(item.unit_profit) || 0)), 0) -
                        runForm.costs.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0)
                      ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </Flex>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRunClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<FaCalculator />}
              onClick={handleSaveRun}
              isLoading={isSubmitting}
            >
              Calculate & Create Run
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default TransportManagement;

