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
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect } from "react";
import { FaPlus, FaUserShield, FaUsers, FaCalendarCheck, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { EditIcon, DeleteIcon, HamburgerIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import ResponsiveTable from "components/Tables/ResponsiveTable";
import userService from "services/userService";
import logo from "assets/img/avatars/placeholder.png";
import { useSearch } from "contexts/SearchContext";

// User Table Row Component
const UserTableRow = ({ user, currentUserId, onEdit, onDelete }) => {
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
        <Text fontSize="sm" color="gray.400" fontWeight="medium">
          {new Date(user.created_at).toLocaleDateString()}
        </Text>
      </Td>

      <Td>
        <HStack spacing="12px">
          <Button p="0px" bg="transparent" variant="no-hover" onClick={() => onEdit(user)}>
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
            onClick={() => onDelete(user)}
            isDisabled={isCurrentUser}
          >
            <DeleteIcon 
              color={isCurrentUser ? "gray.300" : "#FF8D28"} 
              style={{ cursor: isCurrentUser ? "not-allowed" : "pointer" }} 
            />
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

function UserManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();
  const { filterData, isSearchActive } = useSearch();
 
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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
    allowances: "",
    deductions: "",
    salary_currency: "PKR",
    salary_effective_from: ""
  });

  // Attendance state
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceFilters, setAttendanceFilters] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [showSalaryFields, setShowSalaryFields] = useState(false);
  const { isOpen: isAttendanceOpen, onOpen: onAttendanceOpen, onClose: onAttendanceClose } = useDisclosure();
  const [attendanceForm, setAttendanceForm] = useState({
    user_id: "",
    date: new Date().toISOString().split('T')[0],
    status: "present",
    check_in: "",
    check_out: "",
    notes: ""
  });

  // Fetch attendance data
  const fetchAttendance = async () => {
    try {
      setIsAttendanceLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const queryParams = new URLSearchParams(attendanceFilters).toString();
      const response = await fetch(`${apiUrl}/core/attendance/list?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      } else {
        throw new Error('Failed to fetch attendance');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance records',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  // Mark attendance
  const handleMarkAttendance = async () => {
    if (!attendanceForm.user_id || !attendanceForm.date) {
      toast({
        title: 'Validation Error',
        description: 'Please select a staff member and date',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/core/attendance/mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceForm),
      });

      if (response.ok) {
        toast({
          title: 'Attendance Marked',
          description: 'Attendance has been recorded successfully',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        onAttendanceClose();
        setAttendanceForm({
          user_id: "",
          date: new Date().toISOString().split('T')[0],
          status: "present",
          check_in: "",
          check_out: "",
          notes: ""
        });
        fetchAttendance();
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
        setShowSalaryFields(false);
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
              captions={["User / Email", "Role", "Created", "Actions"]}
              data={filterData(users, ['name', 'email', 'user_role', 'created_at'])}
              isLoading={isLoading}
              actionButtons={[
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
                />
              ))}
            </ResponsiveTable>
          )}
        </CardBody>
      </Card>
          </TabPanel>

          {/* Attendance Tab Panel */}
          <TabPanel px={0}>
            {/* Attendance Filters and Actions */}
            <Flex mb="24px" gap="12px" direction={{ base: "column", lg: "row" }} align={{ base: "stretch", lg: "center" }}>
              <FormControl maxW={{ base: "100%", lg: "200px" }}>
                <FormLabel fontSize="sm" color="gray.500">From Date</FormLabel>
                <Input
                  type="date"
                  value={attendanceFilters.from}
                  onChange={(e) => setAttendanceFilters(prev => ({ ...prev, from: e.target.value }))}
                  size="md"
                />
              </FormControl>

              <FormControl maxW={{ base: "100%", lg: "200px" }}>
                <FormLabel fontSize="sm" color="gray.500">To Date</FormLabel>
                <Input
                  type="date"
                  value={attendanceFilters.to}
                  onChange={(e) => setAttendanceFilters(prev => ({ ...prev, to: e.target.value }))}
                  size="md"
                />
              </FormControl>

              <Button
                colorScheme='teal'
                bg='blue.500'
                color='white'
                _hover={{ bg: 'blue.600' }}
                onClick={fetchAttendance}
                mt={{ base: 0, lg: "auto" }}
                size='md'>
                Filter
              </Button>

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
                {isAttendanceLoading ? (
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
        </TabPanels>
      </Tabs>

      {/* Add New User Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setShowSalaryFields(false); }} size="lg">
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
                onClick={() => setShowSalaryFields(!showSalaryFields)}
                rightIcon={showSalaryFields ? <ChevronUpIcon /> : <ChevronDownIcon />}
                size="sm"
                color="gray.600"
              >
                <HStack>
                  <Icon as={FaMoneyBillWave} />
                  <Text>Salary Settings (Optional)</Text>
                </HStack>
              </Button>

              {/* Collapsible Salary Fields */}
              <Collapse in={showSalaryFields} animateOpacity>
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
              <Button variant="outline" onClick={() => { onAddClose(); setShowSalaryFields(false); }}>
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
    </Flex>
  );
}

export default UserManagement;

