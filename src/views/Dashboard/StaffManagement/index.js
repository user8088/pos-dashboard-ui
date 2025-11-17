import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useToast,
  Spinner,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { useHistory } from 'react-router-dom';
import { staffService } from '../../../services/staffService';

const StaffManagement = () => {
  const history = useHistory();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState({});
  const [stats, setStats] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddStaffOpen, onOpen: onAddStaffOpen, onClose: onAddStaffClose } = useDisclosure();
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    user_type: 'staff',
  });
  const toast = useToast();

  useEffect(() => {
    // Reset attendance state when date changes to avoid showing previous day's marks
    setAttendanceData({});
    loadStaff();
    loadAttendanceData();
  }, [selectedDate]);

  // Recalculate stats whenever staff or attendanceData changes
  useEffect(() => {
    // Calculate stats from loaded staff and attendance data
    const totalStaff = staff.length;
    
    // Count attendance statuses for the selected date
    let presentToday = 0;
    let absentToday = 0;
    let onLeaveToday = 0;
    
    Object.values(attendanceData).forEach(record => {
      if (record.status === 'present' || record.status === 'late' || record.status === 'half-day') {
        presentToday++;
      } else if (record.status === 'absent') {
        absentToday++;
      } else if (record.status === 'leave') {
        onLeaveToday++;
      }
    });
    
    setStats({
      total_staff: totalStaff,
      present_today: presentToday,
      absent_today: absentToday,
      on_leave_today: onLeaveToday,
    });
  }, [staff, attendanceData]);

  const handleDateChange = (value) => {
    setAttendanceData({});
    setSelectedDate(value);
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff();
      if (response && response.success) {
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setStaff(list);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load staff data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const response = await staffService.getAttendanceRecords({
        date: selectedDate,
      });
      if (response && response.success) {
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const attendanceMap = {};
        list.forEach(record => {
          attendanceMap[record.user_id] = {
            status: record.status,
            remarks: record.remarks,
            id: record.id,
          };
        });
        setAttendanceData(attendanceMap);
      } else {
        setAttendanceData({});
      }
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    }
  };


  const markAttendance = async (userId, status, customRemarks = '') => {
    try {
      const remarksToUse = customRemarks || remarks;
      
      if (attendanceData[userId]) {
        // Update existing attendance
        await staffService.updateAttendance(attendanceData[userId].id, {
          status,
          remarks: remarksToUse,
        });
      } else {
        // Create new attendance record
        await staffService.markAttendance({
          user_id: userId,
          status,
          remarks: remarksToUse,
          date: selectedDate,
        });
      }

      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        [userId]: {
          status,
          remarks: remarksToUse,
          id: attendanceData[userId]?.id || Date.now(),
        },
      }));

      toast({
        title: 'Success',
        description: `Attendance marked as ${status}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const bulkMarkAttendance = async (status) => {
    try {
      const bulkData = {
        date: selectedDate,
        attendances: staff.map(member => ({
          user_id: member.id,
          status,
          remarks: status === 'present' ? 'Bulk marked as present' : 
                  status === 'absent' ? 'Bulk marked as absent' : 
                  'Bulk marked as leave',
        })),
      };

      await staffService.bulkMarkAttendance(bulkData);
      
      // Update local state
      const newAttendanceData = {};
      staff.forEach(member => {
        newAttendanceData[member.id] = {
          status,
          remarks: bulkData.attendances.find(a => a.user_id === member.id).remarks,
          id: Date.now() + member.id,
        };
      });
      setAttendanceData(newAttendanceData);

      toast({
        title: 'Success',
        description: `All staff marked as ${status}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk mark attendance',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'green';
      case 'absent': return 'red';
      case 'late': return 'orange';
      case 'half-day': return 'yellow';
      case 'leave': return 'blue';
      default: return 'gray';
    }
  };

  const handleAddStaff = async () => {
    try {
      if (!newStaffData.name || !newStaffData.email || !newStaffData.password || !newStaffData.password_confirmation) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (newStaffData.password !== newStaffData.password_confirmation) {
        toast({
          title: 'Validation Error',
          description: 'Password and password confirmation do not match',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await staffService.createUser(newStaffData);
      if (response && response.success) {
        toast({
          title: 'Success',
          description: 'Staff member added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setNewStaffData({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          user_type: 'staff',
        });
        onAddStaffClose();
        loadStaff();
      } else {
        // Handle case where response doesn't have success property
        toast({
          title: 'Error',
          description: response?.message || 'Failed to add staff member',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      // Extract validation errors if they exist
      let errorMessage = error.message || 'Failed to add staff member';
      
      if (error.errors) {
        // Format validation errors
        const validationErrors = Object.entries(error.errors)
          .map(([field, messages]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
            const messageList = Array.isArray(messages) ? messages.join(', ') : messages;
            return `${fieldName}: ${messageList}`;
          })
          .join('\n');
        
        errorMessage = validationErrors || errorMessage;
      }
      
      toast({
        title: 'Validation Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" color="brand.500">
            Staff Management
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Manage staff attendance and track daily records
          </Text>
        </Box>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onAddStaffOpen}
        >
          Add Staff
        </Button>
      </Flex>

      {/* Stats Cards */}
      <Flex gap={4} mb={6}>
        <Box flex={1} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
          <Stat>
            <StatLabel>Total Staff</StatLabel>
            <StatNumber>{stats.total_staff || 0}</StatNumber>
          </Stat>
        </Box>
        <Box flex={1} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
          <Stat>
            <StatLabel>Present Today</StatLabel>
            <StatNumber color="green.500">{stats.present_today || 0}</StatNumber>
          </Stat>
        </Box>
        <Box flex={1} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
          <Stat>
            <StatLabel>Absent Today</StatLabel>
            <StatNumber color="red.500">{stats.absent_today || 0}</StatNumber>
          </Stat>
        </Box>
        <Box flex={1} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
          <Stat>
            <StatLabel>On Leave</StatLabel>
            <StatNumber color="blue.500">{stats.on_leave_today || 0}</StatNumber>
          </Stat>
        </Box>
      </Flex>

      {/* Controls */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
        <Flex gap={4} align="center" wrap="wrap">
          <FormControl maxW="200px">
            <FormLabel fontSize="sm">Date</FormLabel>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </FormControl>

          <FormControl maxW="300px">
            <FormLabel fontSize="sm">Search Staff</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </FormControl>

          <VStack spacing={2}>
            <Text fontSize="sm" fontWeight="bold">Bulk Actions</Text>
            <HStack>
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => bulkMarkAttendance('present')}
              >
                Mark All Present
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => bulkMarkAttendance('absent')}
              >
                Mark All Absent
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={() => bulkMarkAttendance('leave')}
              >
                Mark All Leave
              </Button>
            </HStack>
          </VStack>
        </Flex>
      </Box>

      {/* Staff Table */}
      <Box bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
        <Box p={4} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Staff Attendance - {selectedDate}</Heading>
        </Box>
        <Box p={4}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>User Type</Th>
                <Th>Status</Th>
                <Th>Remarks</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStaff.map((member) => (
                <Tr key={member.id}>
                  <Td>
                    <Button
                      variant="link"
                      fontWeight="bold"
                      color="blue.500"
                      onClick={() => history.push(`/admin/staff-management/${member.id}`)}
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {member.name}
                    </Button>
                  </Td>
                  <Td>{member.email}</Td>
                  <Td>
                    <Badge colorScheme={member.user_type === 'admin' ? 'purple' : 'blue'}>
                      {member.user_type}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(attendanceData[member.id]?.status)}>
                      {attendanceData[member.id]?.status || 'Not Marked'}
                    </Badge>
                  </Td>
                  <Td maxW="200px" isTruncated>
                    {attendanceData[member.id]?.remarks || '-'}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<ViewIcon />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => history.push(`/admin/staff-management/${member.id}`)}
                      >
                        Profile
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => {
                          setSelectedStaff(member);
                          onOpen();
                        }}
                      >
                        Mark
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Attendance Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Mark Attendance - {selectedStaff?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Remarks (Optional)</FormLabel>
                <Textarea
                  placeholder="Enter remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <Button
                  colorScheme="green"
                  flex={1}
                  onClick={() => markAttendance(selectedStaff?.id, 'present')}
                >
                  Present
                </Button>
                <Button
                  colorScheme="red"
                  flex={1}
                  onClick={() => markAttendance(selectedStaff?.id, 'absent')}
                >
                  Absent
                </Button>
                <Button
                  colorScheme="blue"
                  flex={1}
                  onClick={() => markAttendance(selectedStaff?.id, 'leave')}
                >
                  Leave
                </Button>
              </HStack>

              <HStack spacing={4} w="full">
                <Button
                  colorScheme="orange"
                  flex={1}
                  onClick={() => markAttendance(selectedStaff?.id, 'late')}
                >
                  Late
                </Button>
                <Button
                  colorScheme="yellow"
                  flex={1}
                  onClick={() => markAttendance(selectedStaff?.id, 'half-day')}
                >
                  Half Day
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Staff Modal */}
      <Modal isOpen={isAddStaffOpen} onClose={onAddStaffClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Staff</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Enter staff name"
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newStaffData.email}
                  onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={newStaffData.password}
                  onChange={(e) => setNewStaffData({ ...newStaffData, password: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={newStaffData.password_confirmation}
                  onChange={(e) => setNewStaffData({ ...newStaffData, password_confirmation: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>User Type</FormLabel>
                <Select
                  value={newStaffData.user_type}
                  onChange={(e) => setNewStaffData({ ...newStaffData, user_type: e.target.value })}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>

              <HStack spacing={4} w="full" pt={4}>
                <Button
                  colorScheme="blue"
                  onClick={handleAddStaff}
                  flex={1}
                >
                  Add Staff
                </Button>
                <Button
                  variant="outline"
                  onClick={onAddStaffClose}
                  flex={1}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default StaffManagement;
