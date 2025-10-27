// Chakra imports
import {
  Box,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  Button,
  HStack,
  VStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Image,
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
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  NumberInput,
  NumberInputField,
  Divider,
  Collapse,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  IconButton,
  InputGroup,
  InputLeftElement,
  TableContainer,
  Heading,
  InputRightElement,
  CalendarIcon,
  TimeIcon,
  CheckIcon,
  CloseIcon,
  WarningIcon,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect } from "react";
import { 
  FaPlus, 
  FaUserShield, 
  FaUsers, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaClock,
  FaCalendarAlt,
  FaWallet,
  FaCreditCard,
  FaHandHoldingUsd,
  FaChartLine,
  FaUserClock,
  FaCoins,
  FaReceipt,
  FaHistory,
  FaEdit,
  FaTrash,
  FaDownload,
  FaUpload
} from "react-icons/fa";
import { EditIcon, DeleteIcon, HamburgerIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import ResponsiveTable from "components/Tables/ResponsiveTable";
import userService from "services/userService";
import logo from "assets/img/avatars/placeholder.png";
import { useSearch } from "contexts/SearchContext";
import { useDashboard } from "contexts/DashboardContext";
import { ApiService } from "services/apiService";
import { getHeaders } from "services/apiConfig";

// User Table Row Component
const UserTableRow = ({ user, currentUserId, onEdit, onDelete, onViewAttendance, onPaySalary }) => {
  const textColor = useColorModeValue("gray.700", "white");

  const getRoleBadgeColor = (role) => {
    return role === "admin" ? "purple" : "blue";
  };

  const isCurrentUser = user.id === currentUserId;

  return (
    <Tr>
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={logo} w="30px" h="30px" me="18px" objectFit="cover" borderRadius="full" />
          <Flex direction="column">
            <Text
              fontSize="md"
              color={textColor}
              fontWeight="bold"
              minWidth="100%"
            >
              {user.name} {isCurrentUser && "(You)"}
            </Text>
            <Text fontSize="sm" color="gray.400" fontWeight="medium">
              {user.email}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Badge
          colorScheme={getRoleBadgeColor(user.user_role)}
          fontSize="14px"
          p="3px 10px"
          borderRadius="20px"
          textTransform="capitalize"
        >
          {user.user_role}
        </Badge>
      </Td>

      <Td>
        <Text fontSize="sm" color={textColor} fontWeight="bold">
          {user.base_salary ? `PKR ${parseFloat(user.base_salary).toLocaleString()}` : "Not Set"}
        </Text>
        {user.commission_rate && (
          <Text fontSize="xs" color="gray.500">
            + {user.commission_rate}% Commission
          </Text>
        )}
      </Td>

      <Td>
        <Text fontSize="sm" color={textColor} fontWeight="bold">
          {user.attendance_rate || 0}%
        </Text>
        <Text fontSize="xs" color="gray.500">
          This Month
        </Text>
      </Td>

      <Td>
        <Text fontSize="sm" color={textColor} fontWeight="bold">
          {user.last_payment_date || "Never"}
        </Text>
        <Text fontSize="xs" color="gray.500">
          Last Payment
        </Text>
      </Td>

      <Td>
        <Text fontSize="sm" color="gray.400" fontWeight="medium">
          {new Date(user.created_at).toLocaleDateString()}
        </Text>
      </Td>

      <Td>
        <HStack spacing="8px">
          <Tooltip label="View Attendance">
            <IconButton
              aria-label="View Attendance"
              icon={<FaCalendarCheck />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={() => onViewAttendance(user)}
            />
          </Tooltip>
          <Tooltip label="Pay Salary">
            <IconButton
              aria-label="Pay Salary"
              icon={<FaMoneyBillWave />}
              size="sm"
              colorScheme="green"
              variant="ghost"
              onClick={() => onPaySalary(user)}
            />
          </Tooltip>
          <Tooltip label="Edit User">
            <IconButton
              aria-label="Edit User"
              icon={<EditIcon />}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={() => onEdit(user)}
            />
          </Tooltip>
          {!isCurrentUser && (
            <Tooltip label="Delete User">
              <IconButton
                aria-label="Delete User"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(user)}
              />
            </Tooltip>
          )}
        </HStack>
      </Td>
    </Tr>
  );
};

function UserManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const { currentDashboard } = useDashboard();
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAttendanceOpen, onOpen: onAttendanceOpen, onClose: onAttendanceClose } = useDisclosure();
  const { isOpen: isSalaryOpen, onOpen: onSalaryOpen, onClose: onSalaryClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const toast = useToast();
  const { filterData, isSearchActive } = useSearch();
 
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Get current user ID
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  }, []);

  useEffect(() => {
    // Check if user is admin
    if (!userService.isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access user management.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      window.location.href = "/#/admin/dashboard";
      return;
    }
    
    fetchUsers();
    fetchStats();
    fetchAccounts();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const result = await userService.getAllUsers();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await userService.getUserStats();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    user_role: "staff",
    base_salary: "",
    commission_rate: "",
    allowances: "",
    deductions: "",
    salary_currency: "PKR",
    salary_effective_from: ""
  });

  const [attendanceForm, setAttendanceForm] = useState({
    user_id: "",
    date: new Date().toISOString().split('T')[0],
    status: "present",
    check_in: "",
    check_out: "",
    notes: ""
  });

  const [salaryForm, setSalaryForm] = useState({
    user_id: "",
    month: new Date().toISOString().slice(0, 7),
    base_salary: "",
    commission: "",
    allowances: "",
    deductions: "",
    total_amount: "",
    payment_method: "bank_transfer",
    account_id: "",
    notes: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    user_id: "",
    amount: "",
    payment_method: "bank_transfer",
    account_id: "",
    reference: "",
    notes: ""
  });


  // Fetch attendance data


  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      password: "", // Don't populate password for security
      base_salary: user.base_salary || "",
      allowances: user.allowances || "",
      deductions: user.deductions || "",
      salary_currency: user.salary_currency || "PKR",
      salary_effective_from: user.salary_effective_from || ""
    });
    onEditOpen();
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // Prepare update data (only include password if it's been changed)
    const updateData = {
      name: editingUser.name,
      email: editingUser.email,
      user_role: editingUser.user_role,
    };

    // Only include password if it's not empty
    if (editingUser.password && editingUser.password.trim() !== "") {
      updateData.password = editingUser.password;
    }

    // Include salary fields if they have values
    if (editingUser.base_salary) updateData.base_salary = parseFloat(editingUser.base_salary);
    if (editingUser.allowances) updateData.allowances = parseFloat(editingUser.allowances);
    if (editingUser.deductions) updateData.deductions = parseFloat(editingUser.deductions);
    if (editingUser.salary_currency) updateData.salary_currency = editingUser.salary_currency;
    if (editingUser.salary_effective_from) updateData.salary_effective_from = editingUser.salary_effective_from;

    try {
      const result = await userService.updateUser(editingUser.id, updateData);
      
      if (result.success) {
        toast({
          title: "User Updated",
          description: result.message || `Updated ${editingUser.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onEditClose();
        setEditingUser(null);
        fetchUsers();
        fetchStats();
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to update user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Prepare user data with salary fields
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        user_role: newUser.user_role,
      };

      // Include salary fields if they have values
      if (newUser.base_salary) userData.base_salary = parseFloat(newUser.base_salary);
      if (newUser.allowances) userData.allowances = parseFloat(newUser.allowances);
      if (newUser.deductions) userData.deductions = parseFloat(newUser.deductions);
      if (newUser.salary_currency) userData.salary_currency = newUser.salary_currency;
      if (newUser.salary_effective_from) userData.salary_effective_from = newUser.salary_effective_from;

      const result = await userService.createUser(userData);
      
      if (result.success) {
        toast({
          title: "User Created",
          description: result.message || `Created user ${newUser.name}`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        setNewUser({
          name: "",
          email: "",
          password: "",
          user_role: "staff",
          base_salary: "",
          allowances: "",
          deductions: "",
          salary_currency: "PKR",
          salary_effective_from: ""
        });
        onAddClose();
        fetchUsers();
        fetchStats();
      } else {
        toast({
          title: "Create Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to create user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUserId) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await userService.deleteUser(user.id);
      
      if (result.success) {
        toast({
          title: "User Deleted",
          description: result.message || `Deleted user ${user.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
        fetchStats();
      } else {
        toast({
          title: "Delete Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to delete user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Attendance Management
  const handleViewAttendance = (user) => {
    setSelectedUser(user);
    setAttendanceForm({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      status: "present",
      check_in: "",
      check_out: "",
      notes: ""
    });
    fetchAttendance(user.id);
    onAttendanceOpen();
  };

  const handleMarkAttendance = async () => {
    if (!attendanceForm.user_id || !attendanceForm.date) {
      toast({
        title: "Validation Error",
        description: "Please select user and date.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const apiService = new ApiService(currentDashboard);
      const result = await apiService.markAttendance(attendanceForm);
      
      if (result.success) {
        toast({
          title: "Attendance Marked Successfully",
          description: `Attendance recorded for ${attendanceForm.date}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        setAttendanceForm({
          user_id: "",
          date: new Date().toISOString().split('T')[0],
          status: "present",
          check_in: "",
          check_out: "",
          notes: ""
        });
        
        fetchAttendance(attendanceForm.user_id);
        onAttendanceClose();
      } else {
        toast({
          title: "Error",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Salary Management
  const handlePaySalary = (user) => {
    setSelectedUser(user);
    setPaymentForm({
      user_id: user.id,
      amount: user.base_salary || "",
      payment_method: "bank_transfer",
      account_id: "",
      reference: "",
      notes: ""
    });
    onSalaryOpen();
  };

  const handleProcessSalaryPayment = async () => {
    if (!paymentForm.user_id || !paymentForm.amount || !paymentForm.account_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const apiService = new ApiService(currentDashboard);
      const result = await apiService.paySalary(paymentForm);
      
      if (result.success) {
        toast({
          title: "Salary Paid Successfully",
          description: `Payment of PKR ${paymentForm.amount} has been processed.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        setPaymentForm({
          user_id: "",
          amount: "",
          payment_method: "bank_transfer",
          account_id: "",
          reference: "",
          notes: ""
        });
        
        fetchUsers();
        onSalaryClose();
      } else {
        toast({
          title: "Error",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to pay salary:', error);
      toast({
        title: "Error",
        description: "Failed to process salary payment.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchAttendance = async (userId, month = null) => {
    try {
      const apiService = new ApiService(currentDashboard);
      const result = await apiService.getStaffAttendance(userId, month);
      
      if (result.success) {
        setAttendanceData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const apiService = new ApiService(currentDashboard);
      const result = await apiService.getAccounts();
      
      if (result.success) {
        setAccounts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const fetchSalaryHistory = async (userId) => {
    try {
      const apiService = new ApiService(currentDashboard);
      const result = await apiService.getSalaryHistory(userId);
      
      if (result.success) {
        setSalaryHistory(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch salary history:', error);
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Statistics Cards */}
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="24px" mb="24px">
          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Total Users
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.total_users}
                  </StatNumber>
                </Stat>
                <Icon as={FaUsers} w={8} h={8} color="#FF8D28" />
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Admin Users
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.admin_users}
                  </StatNumber>
                </Stat>
                <Icon as={FaUserShield} w={8} h={8} color="purple.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Staff Users
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.staff_users}
                  </StatNumber>
                </Stat>
                <Icon as={FaUsers} w={8} h={8} color="blue.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Recent (30 days)
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.recent_users_30_days}
                  </StatNumber>
                </Stat>
                <Icon as={FaPlus} w={8} h={8} color="green.500" />
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}


      {/* Header Section */}
      <Box mb='24px'>
        <Flex direction='column' w='100%'>
          <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='8px'>
            User Management
          </Text>
          <Text fontSize='md' color='gray.400' mb='16px'>
            Manage system users, salaries, and attendance (Admin Only)
          </Text>
        </Flex>
      </Box>

      {/* Tabs for Users and Attendance */}
      <Tabs colorScheme="orange" variant="enclosed">
        <TabList mb="24px">
          <Tab _selected={{ color: '#FF8D28', borderColor: '#FF8D28', borderBottomColor: cardBg }}>
            <Icon as={FaUsers} mr={2} />
            Users
          </Tab>
          <Tab _selected={{ color: '#FF8D28', borderColor: '#FF8D28', borderBottomColor: cardBg }} onClick={() => fetchAttendance()}>
            <Icon as={FaCalendarCheck} mr={2} />
            Attendance
          </Tab>
          <Tab _selected={{ color: '#FF8D28', borderColor: '#FF8D28', borderBottomColor: cardBg }}>
            <Icon as={FaMoneyBillWave} mr={2} />
            Salary Tracker
          </Tab>
        </TabList>

        <TabPanels>
          {/* Users Tab Panel */}
          <TabPanel px={0}>
            {/* Action Buttons */}
            <Flex mb="24px" gap="12px" direction={{ base: "column", sm: "row" }}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                onClick={onAddOpen}
                size='md'>
                Add New User
              </Button>
            </Flex>

      {/* Users Table */}
      <Card bg={cardBg} boxShadow={cardShadow}>
        <CardBody>
          {isLoading ? (
            <Flex 
              justify="center" 
              align="center" 
              h="200px" 
              w="100%"
            >
              <VStack spacing="16px" textAlign="center">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="#FF8D28"
                  size="xl"
                />
              </VStack>
            </Flex>
          ) : users.length === 0 ? (
            <Flex 
              direction="column" 
              justify="center" 
              align="center" 
              h="400px" 
              p="40px"
              w="100%"
            >
              <VStack spacing="24px" maxW="400px" textAlign="center">
                <Text fontSize="2xl" color={textColor} fontWeight="bold">
                  No Users Yet
                </Text>
                <Text color="gray.500" fontSize="md" lineHeight="1.6">
                  Add your first user to get started with user management.
                </Text>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme='teal'
                  bg='#FF8D28'
                  color='white'
                  _hover={{ bg: '#E67E22' }}
                  size="lg"
                  px="32px"
                  py="12px"
                  onClick={onAddOpen}>
                  ADD FIRST USER
                </Button>
              </VStack>
            </Flex>
          ) : (
            <ResponsiveTable
              captions={["User / Email", "Role", "Salary", "Attendance", "Last Payment", "Created", "Actions"]}
              data={filterData(users, ['name', 'email', 'user_role', 'created_at'])}
              isLoading={isLoading}
              actionButtons={[
                {
                  label: "Attendance",
                  icon: <FaCalendarCheck />,
                  onClick: (user) => handleViewAttendance(user),
                },
                {
                  label: "Pay Salary",
                  icon: <FaMoneyBillWave />,
                  onClick: (user) => handlePaySalary(user),
                },
                {
                  label: "Edit",
                  icon: <EditIcon />,
                  onClick: (user) => handleEditUser(user),
                },
                {
                  label: "Delete",
                  icon: <DeleteIcon />,
                  onClick: (user) => handleDeleteUser(user),
                  color: "red.500",
                  isDisabled: (user) => user.id === currentUserId,
                },
              ]}
            >
              {filterData(users, ['name', 'email', 'user_role', 'created_at']).map((user) => (
                <UserTableRow 
                  key={user.id} 
                  user={user}
                  currentUserId={currentUserId}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onViewAttendance={handleViewAttendance}
                  onPaySalary={handlePaySalary}
                />
              ))}
            </ResponsiveTable>
          )}
        </CardBody>
      </Card>
          </TabPanel>

          {/* Attendance Tab Panel */}
          <TabPanel px={0}>
            {/* Attendance Actions */}
            <Flex mb="24px" gap="12px" direction={{ base: "column", lg: "row" }} align={{ base: "stretch", lg: "center" }}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                onClick={onAttendanceOpen}
                mt={{ base: 0, lg: "auto" }}
                size='md'>
                Mark Attendance
              </Button>
            </Flex>

            {/* Attendance Table */}
            <Card bg={cardBg} boxShadow={cardShadow}>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" align="center" h="200px" w="100%">
                    <Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="#FF8D28"
                      size="xl"
                    />
                  </Flex>
                ) : attendanceData.length === 0 ? (
                  <Flex direction="column" justify="center" align="center" h="400px" p="40px" w="100%">
                    <VStack spacing="24px" maxW="400px" textAlign="center">
                      <Icon as={FaCalendarCheck} w={20} h={20} color="gray.300" />
                      <Text fontSize="2xl" color={textColor} fontWeight="bold">
                        No Attendance Records
                      </Text>
                      <Text color="gray.500" fontSize="md" lineHeight="1.6">
                        Start marking attendance to track staff presence and hours.
                      </Text>
                      <Button
                        leftIcon={<FaPlus />}
                        colorScheme='teal'
                        bg='#FF8D28'
                        color='white'
                        _hover={{ bg: '#E67E22' }}
                        size="lg"
                        onClick={onAttendanceOpen}>
                        MARK FIRST ATTENDANCE
                      </Button>
                    </VStack>
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead>
                        <Tr>
                          <Th>Staff Member</Th>
                          <Th>Date</Th>
                          <Th>Status</Th>
                          <Th>Check In</Th>
                          <Th>Check Out</Th>
                          <Th>Notes</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {attendanceData.map((record) => (
                          <Tr key={record.id || `${record.user_id}-${record.date}`}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" color={textColor}>
                                  {record.user?.name || 'Unknown'}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  {record.user?.email || ''}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color={textColor}>
                                {record.date && !isNaN(new Date(record.date).getTime()) 
                                  ? new Date(record.date).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })
                                  : '-'}
                              </Text>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  record.status === 'present' ? 'green' :
                                  record.status === 'absent' ? 'red' : 'yellow'
                                }
                                fontSize="sm"
                                px={3}
                                py={1}
                                borderRadius="full"
                                textTransform="capitalize"
                              >
                                <Icon
                                  as={record.status === 'present' ? FaCheckCircle : FaTimesCircle}
                                  mr={1}
                                  boxSize={3}
                                />
                                {record.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color={textColor}>
                                {record.check_in || '-'}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color={textColor}>
                                {record.check_out || '-'}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.500" maxW="200px" isTruncated>
                                {record.notes || '-'}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Salary Tracker Tab Panel */}
          <TabPanel px={0}>
            <Card bg={cardBg} boxShadow={cardShadow}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color={textColor}>
                    Monthly Salary Tracker
                  </Heading>
                  <HStack spacing="12px">
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      size="sm"
                      maxW="200px"
                    />
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => {
                        // Refresh salary data for selected month
                        users.forEach(user => {
                          if (user.base_salary) {
                            fetchSalaryHistory(user.id);
                          }
                        });
                      }}
                    >
                      Refresh
                    </Button>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody px={8} py={6}>
                <TableContainer>
                  <Table variant="simple" size="lg">
                    <Thead>
                      <Tr>
                        <Th py={6} px={4} fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Employee
                        </Th>
                        <Th py={6} px={4} fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Base Salary
                        </Th>
                        <Th py={6} px={4} fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Commission
                        </Th>
                        <Th py={6} px={4} fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Total Amount
                        </Th>
                        <Th py={6} px={4} fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Payment Status
                        </Th>
                        <Th py={6} px={4} fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Payment Date
                        </Th>
                        <Th py={6} px={4} fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                          Actions
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.filter(user => user.base_salary).map((user) => {
                        const monthlySalary = salaryHistory.find(s => 
                          s.user_id === user.id && s.month === selectedMonth
                        );
                        
                        return (
                          <Tr key={user.id} _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
                            <Td py={6} px={4}>
                              <VStack align="start" spacing="6px">
                                <Text fontWeight="bold" fontSize="lg" color={textColor}>{user.name}</Text>
                                <Text fontSize="md" color="gray.500">{user.email}</Text>
                              </VStack>
                            </Td>
                            <Td py={6} px={4}>
                              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                PKR {parseFloat(user.base_salary || 0).toLocaleString()}
                              </Text>
                            </Td>
                            <Td py={6} px={4}>
                              <Text fontSize="lg" color={textColor}>
                                {user.commission_rate ? `${user.commission_rate}%` : "0%"}
                              </Text>
                            </Td>
                            <Td py={6} px={4}>
                              <Text fontSize="lg" fontWeight="bold" color="green.500">
                                PKR {parseFloat(user.base_salary || 0).toLocaleString()}
                              </Text>
                            </Td>
                            <Td py={6} px={4}>
                              <Badge
                                colorScheme={monthlySalary ? "green" : "red"}
                                fontSize="md"
                                px="16px"
                                py="6px"
                                borderRadius="full"
                                fontWeight="medium"
                              >
                                {monthlySalary ? "Paid" : "Pending"}
                              </Badge>
                            </Td>
                            <Td py={6} px={4}>
                              <Text fontSize="md" color="gray.500">
                                {monthlySalary ? new Date(monthlySalary.payment_date).toLocaleDateString() : "Not Paid"}
                              </Text>
                            </Td>
                            <Td py={6} px={4}>
                              <HStack spacing="12px">
                                <Tooltip label="View Details" placement="top">
                                  <IconButton
                                    aria-label="View Details"
                                    icon={<FaEye />}
                                    size="md"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      fetchSalaryHistory(user.id);
                                      onSalaryOpen();
                                    }}
                                  />
                                </Tooltip>
                                {!monthlySalary && (
                                  <Tooltip label="Pay Salary" placement="top">
                                    <IconButton
                                      aria-label="Pay Salary"
                                      icon={<FaMoneyBillWave />}
                                      size="md"
                                      colorScheme="green"
                                      variant="ghost"
                                      onClick={() => handlePaySalary(user)}
                                    />
                                  </Tooltip>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Add New User Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader color={textColor}>Add New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Name
                </FormLabel>
                <Input
                  value={newUser.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, name: value }));
                  }}
                  placeholder="Enter full name"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, email: value }));
                  }}
                  placeholder="Enter email address"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, password: value }));
                  }}
                  placeholder="Enter password (min 8 characters)"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Role
                </FormLabel>
                <Select
                  value={newUser.user_role}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, user_role: value }));
                  }}
                  size="md"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
                <Text fontSize="xs" color="gray.400" mt="8px">
                  Admin: Full access. Staff: Limited access (no user management, expenses, or transactions)
                </Text>
              </FormControl>

              <Divider my={2} />

              {/* Salary Settings Toggle */}
              <Button
                variant="ghost"
                justifyContent="space-between"
                onClick={() => {}}
                rightIcon={<ChevronDownIcon />}
                size="sm"
                color="gray.600"
              >
                <HStack>
                  <Icon as={FaMoneyBillWave} />
                  <Text>Salary Settings (Optional)</Text>
                </HStack>
              </Button>

              {/* Collapsible Salary Fields */}
              <Collapse in={true} animateOpacity>
                <VStack spacing="16px" align="stretch" p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md">
                  <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        Base Salary
                      </FormLabel>
                      <NumberInput
                        value={newUser.base_salary}
                        onChange={(value) => setNewUser(prev => ({ ...prev, base_salary: value }))}
                        min={0}
                      >
                        <NumberInputField placeholder="0" />
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        Currency
                      </FormLabel>
                      <Select
                        value={newUser.salary_currency}
                        onChange={(e) => setNewUser(prev => ({ ...prev, salary_currency: e.target.value }))}
                        size="md"
                      >
                        <option value="PKR">PKR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        Allowances
                      </FormLabel>
                      <NumberInput
                        value={newUser.allowances}
                        onChange={(value) => setNewUser(prev => ({ ...prev, allowances: value }))}
                        min={0}
                      >
                        <NumberInputField placeholder="0" />
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        Deductions
                      </FormLabel>
                      <NumberInput
                        value={newUser.deductions}
                        onChange={(value) => setNewUser(prev => ({ ...prev, deductions: value }))}
                        min={0}
                      >
                        <NumberInputField placeholder="0" />
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">
                      Effective From
                    </FormLabel>
                    <Input
                      type="date"
                      value={newUser.salary_effective_from}
                      onChange={(e) => setNewUser(prev => ({ ...prev, salary_effective_from: e.target.value }))}
                      size="md"
                    />
                  </FormControl>

                  {newUser.base_salary && (
                    <Box p={3} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="md">
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        Net Salary: {newUser.salary_currency} {
                          (parseFloat(newUser.base_salary || 0) + parseFloat(newUser.allowances || 0) - parseFloat(newUser.deductions || 0)).toLocaleString()
                        }
                      </Text>
                    </Box>
                  )}
                </VStack>
              </Collapse>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onAddClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleAddUser}
                isDisabled={!newUser.name || !newUser.email || !newUser.password}
              >
                Add User
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader color={textColor}>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingUser && (
              <VStack spacing="16px" align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.500">
                    Name
                  </FormLabel>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, name: value }));
                    }}
                    size="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.500">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, email: value }));
                    }}
                    size="md"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={editingUser.password || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, password: value }));
                    }}
                    placeholder="Leave blank to keep current password"
                    size="md"
                  />
                  <Text fontSize="xs" color="gray.400" mt="4px">
                    Only enter a new password if you want to change it
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.500">
                    Role
                  </FormLabel>
                  <Select
                    value={editingUser.user_role}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, user_role: value }));
                    }}
                    size="md"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <Text fontSize="xs" color="gray.400" mt="8px">
                    Admin: Full access. Staff: Limited access
                  </Text>
                </FormControl>

                <Divider my={2} />

                {/* Salary Settings */}
                <Box>
                  <HStack mb={3}>
                    <Icon as={FaMoneyBillWave} color="gray.600" />
                    <Text fontSize="md" fontWeight="bold" color="gray.600">
                      Salary Settings
                    </Text>
                  </HStack>

                  <VStack spacing="16px" align="stretch" p={4} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md">
                    <SimpleGrid columns={2} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">
                          Base Salary
                        </FormLabel>
                        <NumberInput
                          value={editingUser.base_salary}
                          onChange={(value) => setEditingUser(prev => ({ ...prev, base_salary: value }))}
                          min={0}
                        >
                          <NumberInputField placeholder="0" />
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">
                          Currency
                        </FormLabel>
                        <Select
                          value={editingUser.salary_currency}
                          onChange={(e) => setEditingUser(prev => ({ ...prev, salary_currency: e.target.value }))}
                          size="md"
                        >
                          <option value="PKR">PKR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={2} spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">
                          Allowances
                        </FormLabel>
                        <NumberInput
                          value={editingUser.allowances}
                          onChange={(value) => setEditingUser(prev => ({ ...prev, allowances: value }))}
                          min={0}
                        >
                          <NumberInputField placeholder="0" />
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">
                          Deductions
                        </FormLabel>
                        <NumberInput
                          value={editingUser.deductions}
                          onChange={(value) => setEditingUser(prev => ({ ...prev, deductions: value }))}
                          min={0}
                        >
                          <NumberInputField placeholder="0" />
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.500">
                        Effective From
                      </FormLabel>
                      <Input
                        type="date"
                        value={editingUser.salary_effective_from}
                        onChange={(e) => setEditingUser(prev => ({ ...prev, salary_effective_from: e.target.value }))}
                        size="md"
                      />
                    </FormControl>

                    {editingUser.base_salary && (
                      <Box p={3} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                          Net Salary: {editingUser.salary_currency} {
                            (parseFloat(editingUser.base_salary || 0) + parseFloat(editingUser.allowances || 0) - parseFloat(editingUser.deductions || 0)).toLocaleString()
                          }
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onEditClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleUpdateUser}
              >
                Update User
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Mark Attendance Modal */}
      <Modal isOpen={isAttendanceOpen} onClose={onAttendanceClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Mark Attendance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Staff Member
                </FormLabel>
                <Select
                  value={attendanceForm.user_id || ""}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, user_id: e.target.value }))}
                  placeholder="Select staff member"
                  size="md"
                >
                  {users.filter(u => u.user_role === 'staff').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Date
                </FormLabel>
                <Input
                  type="date"
                  value={attendanceForm.date || ""}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Status
                </FormLabel>
                <Select
                  value={attendanceForm.status || "present"}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value }))}
                  size="md"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </Select>
              </FormControl>

              {attendanceForm.status === 'present' && (
                <SimpleGrid columns={2} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">
                      Check In Time
                    </FormLabel>
                    <Input
                      type="time"
                      value={attendanceForm.check_in || ""}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, check_in: e.target.value }))}
                      size="md"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.500">
                      Check Out Time
                    </FormLabel>
                    <Input
                      type="time"
                      value={attendanceForm.check_out || ""}
                      onChange={(e) => setAttendanceForm(prev => ({ ...prev, check_out: e.target.value }))}
                      size="md"
                    />
                  </FormControl>
                </SimpleGrid>
              )}

              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">
                  Notes
                </FormLabel>
                <Input
                  value={attendanceForm.notes || ""}
                  onChange={(e) => setAttendanceForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes (e.g., late due to traffic)"
                  size="md"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onAttendanceClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleMarkAttendance}
                isDisabled={!attendanceForm.user_id || !attendanceForm.date}
              >
                Mark Attendance
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Attendance Modal */}
      <Modal isOpen={isAttendanceOpen} onClose={onAttendanceClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? `Mark Attendance - ${selectedUser.name}` : "Mark Attendance"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="24px">
            <VStack spacing="16px">
              {!selectedUser && (
                <FormControl isRequired>
                  <FormLabel>Select Staff Member</FormLabel>
                  <Select
                    value={attendanceForm.user_id}
                    onChange={(e) => setAttendanceForm({...attendanceForm, user_id: e.target.value})}
                  >
                    <option value="">Choose staff member</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({...attendanceForm, status: e.target.value})}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">On Leave</option>
                  <option value="late">Late</option>
                </Select>
              </FormControl>

              {attendanceForm.status === "present" && (
                <>
                  <FormControl>
                    <FormLabel>Check In Time</FormLabel>
                    <Input
                      type="time"
                      value={attendanceForm.check_in}
                      onChange={(e) => setAttendanceForm({...attendanceForm, check_in: e.target.value})}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Check Out Time</FormLabel>
                    <Input
                      type="time"
                      value={attendanceForm.check_out}
                      onChange={(e) => setAttendanceForm({...attendanceForm, check_out: e.target.value})}
                    />
                  </FormControl>
                </>
              )}

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  value={attendanceForm.notes}
                  onChange={(e) => setAttendanceForm({...attendanceForm, notes: e.target.value})}
                  placeholder="Enter any notes (optional)"
                />
              </FormControl>

              {selectedUser && attendanceData.length > 0 && (
                <>
                  <Divider />
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Recent Attendance
                  </Text>
                  <Box w="100%" maxH="200px" overflowY="auto">
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Status</Th>
                          <Th>Check In</Th>
                          <Th>Check Out</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {attendanceData.slice(0, 10).map((record, index) => (
                          <Tr key={index}>
                            <Td>{record.date}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  record.status === "present" ? "green" :
                                  record.status === "absent" ? "red" :
                                  record.status === "leave" ? "blue" : "orange"
                                }
                              >
                                {record.status}
                              </Badge>
                            </Td>
                            <Td>{record.check_in || "-"}</Td>
                            <Td>{record.check_out || "-"}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="12px" onClick={onAttendanceClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" bg="#FF8D28" color="white" _hover={{ bg: "#E67E22" }} onClick={handleMarkAttendance}>
              Mark Attendance
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Salary Payment Modal */}
      <Modal isOpen={isSalaryOpen} onClose={onSalaryClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser ? `Pay Salary - ${selectedUser.name}` : "Pay Salary"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="24px">
            <VStack spacing="16px">
              {!selectedUser && (
                <FormControl isRequired>
                  <FormLabel>Select Staff Member</FormLabel>
                  <Select
                    value={paymentForm.user_id}
                    onChange={(e) => {
                      const selectedUser = users.find(u => u.id === e.target.value);
                      setPaymentForm({
                        ...paymentForm,
                        user_id: e.target.value,
                        amount: selectedUser?.base_salary || ""
                      });
                    }}
                  >
                    <option value="">Choose staff member</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - PKR {user.base_salary ? parseFloat(user.base_salary).toLocaleString() : "0"}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Payment Amount (PKR)</FormLabel>
                <NumberInput
                  value={paymentForm.amount}
                  onChange={(valueString) => setPaymentForm({...paymentForm, amount: valueString})}
                >
                  <NumberInputField placeholder="Enter payment amount" />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({...paymentForm, payment_method: e.target.value})}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="mobile_payment">Mobile Payment</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Payment Account</FormLabel>
                <Select
                  value={paymentForm.account_id}
                  onChange={(e) => setPaymentForm({...paymentForm, account_id: e.target.value})}
                >
                  <option value="">Choose payment account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} - {account.account_type} (PKR {parseFloat(account.balance || 0).toLocaleString()})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Reference Number</FormLabel>
                <Input
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                  placeholder="Enter reference number (optional)"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  placeholder="Enter payment notes (optional)"
                />
              </FormControl>

              {paymentForm.amount && paymentForm.account_id && (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Payment Summary</AlertTitle>
                    <AlertDescription>
                      You are about to pay PKR {parseFloat(paymentForm.amount).toLocaleString()} to {selectedUser?.name || "selected staff"} 
                      from {accounts.find(a => a.id === paymentForm.account_id)?.account_name || "selected account"}.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr="12px" onClick={onSalaryClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleProcessSalaryPayment}>
              Process Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default UserManagement;

