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
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { staffService } from '../../../services/staffService';

const AttendanceReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substr(0, 7));
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [staff, setStaff] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Clear current view to avoid any visual carry-over while fetching
    setAttendanceData([]);
    setSummaryData({});
    loadStaff();
    loadAttendanceData();
  }, [reportType, selectedDate, selectedMonth]);

  const loadStaff = async () => {
    try {
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
      console.error('Failed to load staff:', error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      let params = {};
      
      if (reportType === 'daily') {
        params = { date: selectedDate };
      } else {
        const startDate = `${selectedMonth}-01`;
        const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
          .toISOString().split('T')[0];
        params = { start_date: startDate, end_date: endDate };
      }

      const response = await staffService.getAttendanceRecords(params);
      if (response && response.success) {
        // Normalize API shape: sometimes it returns { data: [...] } or { data: { data: [...] } }
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setAttendanceData(list);
        calculateSummary(list);
      } else {
        setAttendanceData([]);
        calculateSummary([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const summary = {
      total: data.length,
      present: data.filter(record => record.status === 'present').length,
      absent: data.filter(record => record.status === 'absent').length,
      late: data.filter(record => record.status === 'late').length,
      halfDay: data.filter(record => record.status === 'half-day').length,
      leave: data.filter(record => record.status === 'leave').length,
    };

    // Calculate attendance percentage
    const totalWorkingDays = summary.present + summary.absent + summary.late + summary.halfDay;
    summary.attendancePercentage = totalWorkingDays > 0 ? 
      ((summary.present + summary.halfDay * 0.5) / totalWorkingDays * 100).toFixed(1) : 0;

    setSummaryData(summary);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStaffName = (userId) => {
    const member = staff.find(s => s.id === userId);
    return member ? member.name : `User ${userId}`;
  };

  const groupedData = reportType === 'monthly' ? 
    attendanceData.reduce((acc, record) => {
      const date = record.date.split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(record);
      return acc;
    }, {}) : {};

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color="brand.500">
          Attendance Reports
        </Heading>
        <Text fontSize="sm" color="gray.500">
          View and analyze staff attendance patterns
        </Text>
      </Flex>

      {/* Controls */}
      <Box mb={6} p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
        <Flex gap={4} align="center" wrap="wrap">
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            maxW="200px"
          >
            <option value="daily">Daily Report</option>
            <option value="monthly">Monthly Report</option>
          </Select>

          {reportType === 'daily' ? (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          ) : (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
          )}

          <Button onClick={loadAttendanceData} colorScheme="blue">
            Refresh
          </Button>
        </Flex>
      </Box>

      {/* Summary Stats */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Total Records</StatLabel>
              <StatNumber>{summaryData.total || 0}</StatNumber>
            </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Present</StatLabel>
              <StatNumber color="green.500">{summaryData.present || 0}</StatNumber>
              <StatHelpText>
                {summaryData.total > 0 ? 
                  ((summaryData.present / summaryData.total) * 100).toFixed(1) : 0}%
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Absent</StatLabel>
              <StatNumber color="red.500">{summaryData.absent || 0}</StatNumber>
              <StatHelpText>
                {summaryData.total > 0 ? 
                  ((summaryData.absent / summaryData.total) * 100).toFixed(1) : 0}%
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Late</StatLabel>
              <StatNumber color="orange.500">{summaryData.late || 0}</StatNumber>
              <StatHelpText>
                {summaryData.total > 0 ? 
                  ((summaryData.late / summaryData.total) * 100).toFixed(1) : 0}%
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>On Leave</StatLabel>
              <StatNumber color="blue.500">{summaryData.leave || 0}</StatNumber>
              <StatHelpText>
                {summaryData.total > 0 ? 
                  ((summaryData.leave / summaryData.total) * 100).toFixed(1) : 0}%
              </StatHelpText>
            </Stat>
          </Box>
        </GridItem>
        <GridItem>
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
            <Stat>
              <StatLabel>Attendance Rate</StatLabel>
              <StatNumber color="green.500">{summaryData.attendancePercentage || 0}%</StatNumber>
            </Stat>
          </Box>
        </GridItem>
      </Grid>

      {/* Reports */}
      <Tabs>
        <TabList>
          <Tab>Detailed View</Tab>
          <Tab>Summary by Staff</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
              <Box p={4} borderBottom="1px" borderColor="gray.200">
                <Heading size="md">
                  {reportType === 'daily' ? 'Daily' : 'Monthly'} Attendance Details
                </Heading>
              </Box>
              <Box p={4}>
                {reportType === 'daily' ? (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Staff Member</Th>
                        <Th>Status</Th>
                        <Th>Remarks</Th>
                        <Th>Time</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {attendanceData.map((record) => (
                        <Tr key={record.id}>
                          <Td fontWeight="bold">{getStaffName(record.user_id)}</Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </Td>
                          <Td>{record.remarks || '-'}</Td>
                          <Td>{formatDate(record.created_at)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {Object.entries(groupedData).map(([date, records]) => (
                      <Box key={date} bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
                        <Box p={4} borderBottom="1px" borderColor="gray.200">
                          <Heading size="sm">{formatDate(date)}</Heading>
                        </Box>
                        <Box p={4}>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Staff Member</Th>
                                <Th>Status</Th>
                                <Th>Remarks</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {records.map((record) => (
                                <Tr key={record.id}>
                                  <Td>{getStaffName(record.user_id)}</Td>
                                  <Td>
                                    <Badge colorScheme={getStatusColor(record.status)}>
                                      {record.status}
                                    </Badge>
                                  </Td>
                                  <Td>{record.remarks || '-'}</Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </Box>
          </TabPanel>

          <TabPanel>
            <Box bg="white" borderRadius="md" boxShadow="sm" border="1px" borderColor="gray.200">
              <Box p={4} borderBottom="1px" borderColor="gray.200">
                <Heading size="md">Staff Summary</Heading>
              </Box>
              <Box p={4}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Staff Member</Th>
                      <Th>Total Days</Th>
                      <Th>Present</Th>
                      <Th>Absent</Th>
                      <Th>Late</Th>
                      <Th>Leave</Th>
                      <Th>Attendance %</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {staff.map((member) => {
                      const memberRecords = attendanceData.filter(record => record.user_id === member.id);
                      const present = memberRecords.filter(r => r.status === 'present').length;
                      const absent = memberRecords.filter(r => r.status === 'absent').length;
                      const late = memberRecords.filter(r => r.status === 'late').length;
                      const leave = memberRecords.filter(r => r.status === 'leave').length;
                      const totalWorkingDays = present + absent + late;
                      const attendanceRate = totalWorkingDays > 0 ? 
                        ((present + late * 0.5) / totalWorkingDays * 100).toFixed(1) : 0;

                      return (
                        <Tr key={member.id}>
                          <Td fontWeight="bold">{member.name}</Td>
                          <Td>{memberRecords.length}</Td>
                          <Td color="green.500">{present}</Td>
                          <Td color="red.500">{absent}</Td>
                          <Td color="orange.500">{late}</Td>
                          <Td color="blue.500">{leave}</Td>
                          <Td>
                            <Badge colorScheme={attendanceRate >= 90 ? 'green' : attendanceRate >= 70 ? 'yellow' : 'red'}>
                              {attendanceRate}%
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AttendanceReports;
