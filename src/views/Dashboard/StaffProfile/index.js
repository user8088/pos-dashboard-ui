import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Badge,
  Divider,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Select,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ArrowBackIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import { useParams, useHistory } from 'react-router-dom';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import { staffService } from '../../../services/staffService';

export default function StaffProfile() {
  const { id } = useParams();
  const history = useHistory();
  const textColor = useColorModeValue('gray.700', 'white');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const itemBg = useColorModeValue('white', 'gray.800');
  const itemBorder = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.800');
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [salarySummary, setSalarySummary] = useState(null);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [udhaarSummary, setUdhaarSummary] = useState(null);
  const [individualLoans, setIndividualLoans] = useState([]);
  const [attendanceBasedSalary, setAttendanceBasedSalary] = useState(null);
  const [loadingAttendanceCalc, setLoadingAttendanceCalc] = useState(false);
  const [salaryPeriodType, setSalaryPeriodType] = useState('month');
  const [salaryPeriodValue, setSalaryPeriodValue] = useState(new Date().toISOString().substr(0, 7));
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load staff basic info
        const staffResp = await staffService.getUser(id);
        const staffInfo = staffResp?.data || staffResp;
        if (mounted) setStaffData(staffInfo);

        // Define date range for last 60 days (covers previous + current month)
        const attendanceRange = {
          start_date: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        };

        // Load attendance summary
        try {
          const attSummary = await staffService.getAttendanceSummary(id, attendanceRange);
          if (mounted && attSummary?.success) {
            setAttendanceSummary(attSummary.data);
          }
        } catch (err) {
          console.error('Failed to load attendance summary:', err);
        }

        // Load attendance records (recent + for aggregation)
        try {
          const attRecordsResp = await staffService.getAttendanceRecords({
            user_id: id,
            per_page: 200,
            ...attendanceRange,
          });
          const records = Array.isArray(attRecordsResp?.data)
            ? attRecordsResp.data
            : Array.isArray(attRecordsResp?.data?.data)
            ? attRecordsResp.data.data
            : [];
          if (mounted) {
            setAttendanceRecords(records);
            setRecentAttendance(records.slice(0, 10));
          }
        } catch (err) {
          console.error('Failed to load attendance records:', err);
        }

        // Load salary structure
        try {
          const salaryStruct = await staffService.getSalaryStructureByUser(id);
          if (mounted && salaryStruct?.success) {
            setSalaryStructure(salaryStruct.data);
          }
        } catch (err) {
          console.error('Failed to load salary structure:', err);
        }

        // Load salary summary
        try {
          const salSummary = await staffService.getPaymentSummary(id);
          if (mounted && salSummary?.success) {
            const summaryPayload = salSummary?.data?.summary || salSummary?.data || salSummary;
            if (summaryPayload) {
              const paidCount = toNumber(summaryPayload.paid_count || summaryPayload.paid_payments || 0);
              const pendingCount = toNumber(summaryPayload.pending_count || summaryPayload.pending_payments || 0);
              const totalAmount = toNumber(summaryPayload.total_amount || summaryPayload.total_salary || 0);
              const totalPaid = toNumber(summaryPayload.total_paid || summaryPayload.total_paid_amount || summaryPayload.paid_amount);
              const totalPendingDerived =
                summaryPayload.total_pending ??
                summaryPayload.pending_amount ??
                summaryPayload.total_amount_due ??
                (totalAmount > 0 ? Math.max(0, totalAmount - totalPaid) : 0);
              const totalPaymentsCount = toNumber(
                summaryPayload.total_payments ||
                  summaryPayload.payment_count ||
                  summaryPayload.payments_count ||
                  paidCount + pendingCount
              );
              setSalarySummary({
                total_paid: totalPaid,
                pending_amount: toNumber(totalPendingDerived),
                total_amount: totalAmount,
                total_payments: totalPaymentsCount,
                paid_count: paidCount,
                pending_count: pendingCount,
              });
            }
          }
        } catch (err) {
          console.error('Failed to load salary summary:', err);
        }

        // Load salary payment records
        try {
          const paymentsResp = await staffService.getSalaryPayments({ user_id: id, per_page: 50, with: 'transactions' });
          if (mounted) {
            const list = Array.isArray(paymentsResp?.data)
              ? paymentsResp.data
              : Array.isArray(paymentsResp?.data?.data)
              ? paymentsResp.data.data
              : Array.isArray(paymentsResp)
              ? paymentsResp
              : [];
            setSalaryPayments(list);
          }
        } catch (err) {
          console.error('Failed to load salary payments:', err);
        }

        // Load udhaar summary and individual loans
        let udhaarSumData = null;
        try {
          const udhaarSum = await staffService.getUserUdhaarSummary(id);
          if (mounted && udhaarSum?.success) {
            udhaarSumData = udhaarSum.data;
            setUdhaarSummary(udhaarSumData);
            // If summary includes loans array, use it as initial data
            if (udhaarSumData?.loans && Array.isArray(udhaarSumData.loans)) {
              setIndividualLoans(udhaarSumData.loans);
            }
          }
        } catch (err) {
          console.error('Failed to load udhaar summary:', err);
        }

        // Also fetch individual loans list to ensure we have all loan details with full information
        try {
          const loansList = await staffService.getUdhaars({ user_id: id, per_page: 50 });
          if (mounted) {
            const loans = Array.isArray(loansList?.data) 
              ? loansList.data 
              : Array.isArray(loansList?.data?.data) 
              ? loansList.data.data 
              : [];
            if (loans.length > 0) {
              setIndividualLoans(loans);
            } else if (udhaarSumData?.loans && Array.isArray(udhaarSumData.loans)) {
              // Fallback to summary loans if API list is empty
              setIndividualLoans(udhaarSumData.loans);
            }
          }
        } catch (err) {
          console.error('Failed to load individual loans:', err);
          // If summary has loans, use those as fallback
          if (mounted && udhaarSumData?.loans && Array.isArray(udhaarSumData.loans)) {
            setIndividualLoans(udhaarSumData.loans);
          }
        }
      } catch (error) {
        if (mounted) {
          toast({
            title: 'Error',
            description: 'Failed to load staff profile',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [id, toast]);

  // Calculate period dates based on type and value
  const getPeriodDates = (periodType, periodValue) => {
    if (!periodValue) return { start_date: null, end_date: null };
    
    let start, end;
    
    if (periodType === 'week') {
      // periodValue is YYYY-MM-DD (date within the week)
      const date = new Date(periodValue);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      start = new Date(date.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (periodType === 'month') {
      // periodValue is YYYY-MM
      const [year, month] = periodValue.split('-');
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0); // Last day of month
      end.setHours(23, 59, 59, 999);
    } else if (periodType === 'year') {
      // periodValue is YYYY
      start = new Date(periodValue, 0, 1);
      end = new Date(periodValue, 11, 31);
      end.setHours(23, 59, 59, 999);
    }
    
    return {
      start_date: start ? start.toISOString().split('T')[0] : null,
      end_date: end ? end.toISOString().split('T')[0] : null,
    };
  };

  // Fetch attendance-based salary calculation
  useEffect(() => {
    if (!id || !salaryPeriodType || !salaryPeriodValue) {
      setAttendanceBasedSalary(null);
      return;
    }

    const fetchAttendanceBasedSalary = async () => {
      try {
        setLoadingAttendanceCalc(true);
        const { start_date, end_date } = getPeriodDates(salaryPeriodType, salaryPeriodValue);
        const response = await staffService.getAttendanceBasedSalary(id, {
          period_type: salaryPeriodType,
          period_value: salaryPeriodValue,
          start_date,
          end_date,
        });
        
        if (response && response.success && response.data) {
          setAttendanceBasedSalary(response.data);
        } else {
          setAttendanceBasedSalary(null);
        }
      } catch (error) {
        console.error('Failed to fetch attendance-based salary:', error);
        setAttendanceBasedSalary(null);
        // Don't show error toast - the UI will display a warning message
      } finally {
        setLoadingAttendanceCalc(false);
      }
    };

    fetchAttendanceBasedSalary();
  }, [id, salaryPeriodType, salaryPeriodValue]);

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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
    const normalized = String(value).replace(/,/g, '');
    const num = parseFloat(normalized);
    return Number.isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value) => toNumber(value).toFixed(2);

  const formatMonth = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Calculate total amount loaned from individual loans if not in summary
  const totalAmountLoaned = useMemo(() => {
    // First try to get from summary
    if (udhaarSummary) {
      const fromSummary = toNumber(udhaarSummary.total_amount_given || udhaarSummary.total_borrowed || 0);
      if (fromSummary > 0) {
        return fromSummary;
      }
    }
    // Calculate from individual loans - sum all loan amounts (including fully paid and cancelled)
    if (individualLoans && individualLoans.length > 0) {
      const total = individualLoans.reduce((sum, loan) => sum + toNumber(loan.amount), 0);
      return total > 0 ? total : 0;
    }
    return 0;
  }, [udhaarSummary, individualLoans]);

  const aggregatedAttendanceSummary = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return {
        total_days: 0,
        present_count: 0,
        absent_count: 0,
        leave_count: 0,
        late_count: 0,
        half_day_count: 0,
      };
    }

    return attendanceRecords.reduce(
      (acc, record) => {
        acc.total_days += 1;
        const status = (record.status || '').toLowerCase();
        switch (status) {
          case 'present':
            acc.present_count += 1;
            break;
          case 'absent':
            acc.absent_count += 1;
            break;
          case 'leave':
          case 'on leave':
            acc.leave_count += 1;
            break;
          case 'late':
            acc.late_count += 1;
            break;
          case 'half-day':
          case 'half day':
          case 'halfday':
            acc.half_day_count += 1;
            break;
          default:
            break;
        }
        return acc;
      },
      {
        total_days: 0,
        present_count: 0,
        absent_count: 0,
        leave_count: 0,
        late_count: 0,
        half_day_count: 0,
      }
    );
  }, [attendanceRecords]);

  const combinedAttendanceSummary = useMemo(() => {
    const summary = attendanceSummary || {};
    const pick = (apiValue, fallback) => {
      const num = toNumber(apiValue);
      return num > 0 ? num : fallback;
    };

    return {
      total_days: pick(summary.total_days, aggregatedAttendanceSummary.total_days),
      present_count: pick(summary.present_count, aggregatedAttendanceSummary.present_count),
      absent_count: pick(summary.absent_count, aggregatedAttendanceSummary.absent_count),
      leave_count: pick(summary.leave_count, aggregatedAttendanceSummary.leave_count),
      late_count: pick(summary.late_count || summary.late, aggregatedAttendanceSummary.late_count),
      half_day_count: pick(
        summary.half_day_count || summary.half_day || summary.halfday,
        aggregatedAttendanceSummary.half_day_count
      ),
    };
  }, [attendanceSummary, aggregatedAttendanceSummary]);

  const aggregatedSalarySummary = useMemo(() => {
    if (!salaryPayments || salaryPayments.length === 0) {
      return {
        total_amount: 0,
        total_paid: 0,
        pending_amount: 0,
        total_payments: 0,
        paid_count: 0,
        pending_count: 0,
      };
    }

    return salaryPayments.reduce(
      (acc, payment) => {
        const amount = toNumber(payment.amount || payment.total_amount || 0);
        const paid = toNumber(payment.paid_amount || payment.paid || 0);
        const remaining = Math.max(0, amount - paid);
        const status = (payment.status || '').toLowerCase();

        acc.total_amount += amount;
        acc.total_paid += Math.min(paid, amount);
        acc.pending_amount += remaining;
        acc.total_payments += 1;

        if (status === 'paid' || remaining === 0) {
          acc.paid_count += 1;
        } else {
          acc.pending_count += 1;
        }

        return acc;
      },
      {
        total_amount: 0,
        total_paid: 0,
        pending_amount: 0,
        total_payments: 0,
        paid_count: 0,
        pending_count: 0,
      }
    );
  }, [salaryPayments]);

  const combinedSalarySummary = useMemo(() => {
    const api = salarySummary || {};
    const pick = (apiValue, fallback) => {
      const apiNum = toNumber(apiValue);
      return apiNum > 0 ? apiNum : fallback;
    };

    return {
      total_amount: pick(api.total_amount, aggregatedSalarySummary.total_amount),
      total_paid: pick(api.total_paid, aggregatedSalarySummary.total_paid),
      pending_amount: pick(api.pending_amount, aggregatedSalarySummary.pending_amount),
      total_payments: pick(api.total_payments, aggregatedSalarySummary.total_payments),
      paid_count: pick(api.paid_count, aggregatedSalarySummary.paid_count),
      pending_count: pick(api.pending_count, aggregatedSalarySummary.pending_count),
    };
  }, [salarySummary, aggregatedSalarySummary]);

  const getPaymentStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'paid':
        return 'green';
      case 'partial':
      case 'partially_paid':
        return 'blue';
      case 'overpaid':
      case 'excess':
        return 'purple';
      case 'pending':
      default:
        return 'orange';
    }
  };

  if (loading) {
    return (
      <Flex align='center' justify='center' minH='400px' pt={{ base: '120px', md: '75px' }}>
        <Spinner size='xl' color='brand.500' />
      </Flex>
    );
  }

  if (!staffData) {
    return (
      <Box pt={{ base: '120px', md: '75px' }}>
        <Button leftIcon={<ArrowBackIcon />} onClick={() => history.push('/admin/staff-management')} mb={4}>
          Back to Staff Management
        </Button>
        <Text color={textColor} mt='4'>Staff member not found.</Text>
      </Box>
    );
  }

  const name = staffData.name || `Staff #${id}`;
  const email = staffData.email || 'N/A';
  const userType = staffData.user_type || 'staff';
  const createdAt = staffData.created_at ? formatDate(staffData.created_at) : 'N/A';

  return (
    <Box pt={{ base: '120px', md: '75px' }} px={{ base: 4, md: 6 }} pb={8}>
      {/* Header Section */}
      <HStack justify='space-between' mb={6} flexWrap='wrap' gap={4}>
        <HStack spacing={4}>
          <Avatar
            size='xl'
            name={name}
            bg='brand.500'
            color='white'
            fontWeight='bold'
            fontSize='2xl'
          />
          <Box>
            <Text fontSize='2xl' fontWeight='bold' color={textColor} mb={1}>
              {name}
            </Text>
            <HStack spacing={3} flexWrap='wrap'>
              <Badge colorScheme={userType === 'admin' ? 'purple' : 'blue'} fontSize='sm' px={2} py={1}>
                {userType.toUpperCase()}
              </Badge>
              {staffData.id && (
                <Text fontSize='sm' color='gray.500'>
                  ID: {staffData.id}
                </Text>
              )}
            </HStack>
          </Box>
        </HStack>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant='outline'
          onClick={() => history.push('/admin/staff-management')}
        >
          Back
        </Button>
      </HStack>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <Card bg={cardBg} boxShadow='sm'>
          <CardBody>
            <Stat>
              <StatLabel fontSize='sm' color='gray.500'>Present Days (30d)</StatLabel>
              <StatNumber fontSize='2xl' color='green.500'>
                {combinedAttendanceSummary.present_count || 0}
              </StatNumber>
              <StatHelpText fontSize='xs'>
                {combinedAttendanceSummary.total_days > 0 ? 
                  `${Math.round((combinedAttendanceSummary.present_count / combinedAttendanceSummary.total_days) * 100)}% attendance` 
                  : 'No data'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} boxShadow='sm'>
          <CardBody>
            <Stat>
              <StatLabel fontSize='sm' color='gray.500'>Absent Days (30d)</StatLabel>
              <StatNumber fontSize='2xl' color='red.500'>
                {combinedAttendanceSummary.absent_count || 0}
              </StatNumber>
              <StatHelpText fontSize='xs'>
                {combinedAttendanceSummary.leave_count ? 
                  `${combinedAttendanceSummary.leave_count} on leave` 
                  : 'No leave records'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} boxShadow='sm'>
          <CardBody>
            <Stat>
              <StatLabel fontSize='sm' color='gray.500'>Monthly Salary</StatLabel>
              <StatNumber fontSize='2xl' color='blue.500'>
                {salaryStructure?.base_salary 
                  ? `PKR ${Number(salaryStructure.base_salary).toFixed(2)}`
                  : 'Not Set'}
              </StatNumber>
              <StatHelpText fontSize='xs'>
                {salarySummary?.total_paid 
                  ? `PKR ${Number(salarySummary.total_paid).toFixed(2)} paid` 
                  : 'No payments'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} boxShadow='sm'>
          <CardBody>
            <Stat>
              <StatLabel fontSize='sm' color='gray.500'>Outstanding Loans</StatLabel>
              <StatNumber fontSize='2xl' color={toNumber(udhaarSummary?.total_remaining || udhaarSummary?.total_outstanding || 0) > 0 ? 'orange.500' : 'green.500'}>
                PKR {formatCurrency(udhaarSummary?.total_remaining || udhaarSummary?.total_outstanding || 0)}
              </StatNumber>
              <StatHelpText fontSize='xs'>
                {totalAmountLoaned > 0 
                  ? `PKR ${formatCurrency(totalAmountLoaned)} loaned`
                  : `${udhaarSummary?.active_loans || individualLoans?.length || 0} active loan${(udhaarSummary?.active_loans || individualLoans?.length || 0) !== 1 ? 's' : ''}`}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Main Content Tabs */}
      <Tabs colorScheme='blue' variant='enclosed' mb={6}>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Attendance</Tab>
          <Tab>Salary</Tab>
          <Tab>Loans</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel px={0} pt={6}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Basic Information */}
              <Card bg={cardBg} boxShadow='sm'>
                <CardHeader>
                  <Text fontWeight='bold' color={textColor} fontSize='lg'>
                    Basic Information
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack align='stretch' spacing={4}>
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb={1}>
                        Email Address
                      </Text>
                      <HStack>
                        <EmailIcon color='gray.400' />
                        <Text fontWeight='medium' color={textColor}>
                          {email}
                        </Text>
                      </HStack>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb={1}>
                        User Type
                      </Text>
                      <Badge colorScheme={userType === 'admin' ? 'purple' : 'blue'} fontSize='sm' px={2} py={1}>
                        {userType.toUpperCase()}
                      </Badge>
                    </Box>
                    <Divider />
                    <Box>
                      <Text fontSize='xs' color='gray.500' mb={1}>
                        Member Since
                      </Text>
                      <Text fontWeight='medium' color={textColor}>
                        {createdAt}
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Attendance Summary Card */}
              <Card bg={cardBg} boxShadow='sm'>
                <CardHeader>
                  <Text fontWeight='bold' color={textColor} fontSize='lg'>
                    Attendance Summary (Last 30 Days)
                  </Text>
                </CardHeader>
                <CardBody>
                  {combinedAttendanceSummary.total_days > 0 ? (
                    <VStack align='stretch' spacing={4}>
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb={1}>
                            Total Days
                          </Text>
                          <Text fontSize='xl' fontWeight='bold' color={textColor}>
                            {combinedAttendanceSummary.total_days || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb={1}>
                            Present
                          </Text>
                          <Text fontSize='xl' fontWeight='bold' color='green.500'>
                            {combinedAttendanceSummary.present_count || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb={1}>
                            Absent
                          </Text>
                          <Text fontSize='xl' fontWeight='bold' color='red.500'>
                            {combinedAttendanceSummary.absent_count || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb={1}>
                            On Leave
                          </Text>
                          <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                            {combinedAttendanceSummary.leave_count || 0}
                          </Text>
                        </Box>
                      </SimpleGrid>
                      {combinedAttendanceSummary.total_days > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb={1}>
                              Attendance Rate
                            </Text>
                            <Text fontSize='2xl' fontWeight='bold' color='blue.500'>
                              {Math.round((combinedAttendanceSummary.present_count / combinedAttendanceSummary.total_days) * 100)}%
                            </Text>
                          </Box>
                        </>
                      )}
                    </VStack>
                  ) : (
                    <Text color='gray.500' fontSize='sm'>No attendance data available</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Attendance Tab */}
          <TabPanel px={0} pt={6}>
            <Card bg={cardBg} boxShadow='sm'>
              <CardHeader>
                <Text fontWeight='bold' color={textColor} fontSize='lg'>
                  Recent Attendance Records
                </Text>
              </CardHeader>
              <CardBody>
                {recentAttendance.length > 0 ? (
                  <Box overflowX='auto'>
                    <Table variant='simple' size='sm'>
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Status</Th>
                          <Th>Remarks</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {recentAttendance.map((record) => (
                          <Tr key={record.id}>
                            <Td>{formatDate(record.date || record.created_at)}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(record.status)}>
                                {record.status || 'N/A'}
                              </Badge>
                            </Td>
                            <Td maxW='300px' isTruncated>
                              {record.remarks || '-'}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Text color='gray.500' fontSize='sm'>No attendance records found</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Salary Tab */}
          <TabPanel px={0} pt={6}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Salary Structure */}
              <Card bg={cardBg} boxShadow='sm'>
                <CardHeader>
                  <Text fontWeight='bold' color={textColor} fontSize='lg'>
                    Salary Structure
                  </Text>
                </CardHeader>
                <CardBody>
                  {salaryStructure ? (
                    <VStack align='stretch' spacing={4}>
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Base Salary
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color={textColor}>
                          PKR {Number(salaryStructure.base_salary || 0).toFixed(2)}
                        </Text>
                      </Box>
                      {salaryStructure.allowances && Number(salaryStructure.allowances) > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb={1}>
                              Allowances
                            </Text>
                            <Text fontSize='lg' fontWeight='medium' color={textColor}>
                              PKR {Number(salaryStructure.allowances).toFixed(2)}
                            </Text>
                          </Box>
                        </>
                      )}
                      {salaryStructure.deductions && Number(salaryStructure.deductions) > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb={1}>
                              Deductions
                            </Text>
                            <Text fontSize='lg' fontWeight='medium' color='red.500'>
                              PKR {Number(salaryStructure.deductions).toFixed(2)}
                            </Text>
                          </Box>
                        </>
                      )}
                      <Divider />
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Net Salary
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                          PKR {(
                            Number(salaryStructure.base_salary || 0) +
                            Number(salaryStructure.allowances || 0) -
                            Number(salaryStructure.deductions || 0)
                          ).toFixed(2)}
                        </Text>
                      </Box>
                    </VStack>
                  ) : (
                    <Text color='gray.500' fontSize='sm'>No salary structure defined</Text>
                  )}
                </CardBody>
              </Card>

              {/* Attendance-Based Salary Calculation */}
              <Card bg={cardBg} boxShadow='sm'>
                <CardHeader>
                  <Text fontWeight='bold' color={textColor} fontSize='lg'>
                    Attendance-Based Salary Calculator
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack align='stretch' spacing={4}>
                    <FormControl>
                      <FormLabel fontSize='sm'>Period Type</FormLabel>
                      <Select 
                        value={salaryPeriodType} 
                        onChange={(e) => {
                          const newPeriodType = e.target.value;
                          let newPeriodValue = salaryPeriodValue;
                          
                          // Set default period value based on type
                          if (newPeriodType === 'week') {
                            newPeriodValue = new Date().toISOString().split('T')[0];
                          } else if (newPeriodType === 'month') {
                            newPeriodValue = new Date().toISOString().substr(0, 7);
                          } else if (newPeriodType === 'year') {
                            newPeriodValue = new Date().getFullYear().toString();
                          }
                          
                          setSalaryPeriodType(newPeriodType);
                          setSalaryPeriodValue(newPeriodValue);
                        }}
                        size='sm'
                      >
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize='sm'>
                        {salaryPeriodType === 'week' ? 'Select Date (Week)' : 
                         salaryPeriodType === 'month' ? 'Select Month' : 
                         'Select Year'}
                      </FormLabel>
                      {salaryPeriodType === 'week' ? (
                        <Input 
                          type="date" 
                          value={salaryPeriodValue} 
                          onChange={(e) => setSalaryPeriodValue(e.target.value)}
                          size='sm'
                        />
                      ) : salaryPeriodType === 'month' ? (
                        <Input 
                          type="month" 
                          value={salaryPeriodValue} 
                          onChange={(e) => setSalaryPeriodValue(e.target.value)}
                          size='sm'
                        />
                      ) : (
                        <Input 
                          type="number" 
                          min="2020" 
                          max="2100" 
                          value={salaryPeriodValue} 
                          onChange={(e) => setSalaryPeriodValue(e.target.value)} 
                          placeholder="YYYY"
                          size='sm'
                        />
                      )}
                    </FormControl>

                    {loadingAttendanceCalc && (
                      <Flex justify='center' align='center' py={4}>
                        <Spinner size='sm' mr={2} />
                        <Text fontSize='sm' color='gray.500'>Calculating...</Text>
                      </Flex>
                    )}

                    {attendanceBasedSalary && !loadingAttendanceCalc && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb={2}>
                            Period: {attendanceBasedSalary.start_date && attendanceBasedSalary.end_date
                              ? `${new Date(attendanceBasedSalary.start_date).toLocaleDateString()} - ${new Date(attendanceBasedSalary.end_date).toLocaleDateString()}`
                              : attendanceBasedSalary.period_value}
                          </Text>
                          <SimpleGrid columns={2} spacing={3} mb={3}>
                            <Box>
                              <Text fontSize='xs' color='gray.500'>Daily Rate</Text>
                              <Text fontSize='md' fontWeight='semibold'>
                                PKR {parseFloat(attendanceBasedSalary.daily_rate || 0).toFixed(2)}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontSize='xs' color='gray.500'>Working Days</Text>
                              <Text fontSize='md' fontWeight='semibold'>
                                {parseFloat(attendanceBasedSalary.attendance?.total_working_days || 0).toFixed(1)}
                              </Text>
                            </Box>
                          </SimpleGrid>
                          <Divider mb={3} />
                          <Box mb={3}>
                            <Text fontSize='xs' color='gray.500' mb={2}>Attendance Breakdown</Text>
                            <SimpleGrid columns={2} spacing={2} fontSize='sm'>
                              <Text>Present: <strong>{attendanceBasedSalary.attendance?.present_count || 0}</strong></Text>
                              <Text>Late: <strong>{attendanceBasedSalary.attendance?.late_count || 0}</strong></Text>
                              <Text>Half-day: <strong>{attendanceBasedSalary.attendance?.half_day_count || 0}</strong></Text>
                              {attendanceBasedSalary.attendance?.leave_count > 0 && (
                                <Text>Leave: <strong>{attendanceBasedSalary.attendance?.leave_count || 0}</strong></Text>
                              )}
                              <Text>Absent: <strong>{attendanceBasedSalary.attendance?.absent_count || 0}</strong></Text>
                              <Text>Total: <strong>{parseFloat(attendanceBasedSalary.attendance?.total_working_days || 0).toFixed(1)}</strong> days</Text>
                            </SimpleGrid>
                          </Box>
                          <Divider mb={3} />
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb={1}>Calculated Salary</Text>
                            <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                              PKR {parseFloat(attendanceBasedSalary.calculated_salary || 0).toFixed(2)}
                            </Text>
                            {attendanceBasedSalary.full_salary !== undefined && attendanceBasedSalary.full_salary !== null && (
                              <Text fontSize='xs' color='gray.500' mt={1}>
                                Full Salary: PKR {parseFloat(attendanceBasedSalary.full_salary || 0).toFixed(2)} | 
                                Difference: <strong style={{ 
                                  color: parseFloat(attendanceBasedSalary.difference || 0) >= 0 ? 'green' : 'red' 
                                }}>
                                  {parseFloat(attendanceBasedSalary.difference || 0) >= 0 ? '+' : ''}
                                  PKR {parseFloat(attendanceBasedSalary.difference || 0).toFixed(2)}
                                </strong>
                              </Text>
                            )}
                          </Box>
                          {attendanceBasedSalary.attendance?.total_working_days > 0 && attendanceBasedSalary.calculated_salary && (
                            <Alert status="info" borderRadius="md" fontSize='sm'>
                              <AlertIcon />
                              <Text>
                                Based on {parseFloat(attendanceBasedSalary.attendance.total_working_days).toFixed(1)} working days in the selected period.
                              </Text>
                            </Alert>
                          )}
                        </Box>
                      </>
                    )}

                    {!attendanceBasedSalary && !loadingAttendanceCalc && salaryPeriodType && salaryPeriodValue && (
                      <Alert status="info" borderRadius="md" fontSize='sm'>
                        <AlertIcon />
                        <Text>
                          Attendance-based calculation unavailable. This may be because:
                          <br />• No salary structure is configured
                          <br />• No attendance records exist for the selected period
                          <br />• The selected period is invalid
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Salary Summary */}
              <Card bg={cardBg} boxShadow='sm'>
                <CardHeader>
                  <Text fontWeight='bold' color={textColor} fontSize='lg'>
                    Salary Summary
                  </Text>
                </CardHeader>
                <CardBody>
                  {combinedSalarySummary.total_payments > 0 || combinedSalarySummary.total_amount > 0 ? (
                    <VStack align='stretch' spacing={4}>
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Total Salary Amount
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color={textColor}>
                          PKR {formatCurrency(combinedSalarySummary.total_amount)}
                        </Text>
                      </Box>
                      <Divider />
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Total Paid
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color='green.500'>
                          PKR {formatCurrency(combinedSalarySummary.total_paid)}
                        </Text>
                      </Box>
                      <Divider />
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Pending Amount
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color='orange.500'>
                          PKR {formatCurrency(combinedSalarySummary.pending_amount)}
                        </Text>
                      </Box>
                      <Divider />
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb={1}>
                            Paid Payments
                          </Text>
                          <Text fontSize='lg' fontWeight='semibold' color='green.500'>
                            {combinedSalarySummary.paid_count || 0}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize='xs' color='gray.500' mb={1}>
                            Pending Payments
                          </Text>
                          <Text fontSize='lg' fontWeight='semibold' color='orange.500'>
                            {combinedSalarySummary.pending_count || 0}
                          </Text>
                        </Box>
                      </SimpleGrid>
                      <Divider />
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Total Payments Recorded
                        </Text>
                        <Text fontSize='lg' fontWeight='medium' color={textColor}>
                          {combinedSalarySummary.total_payments || 0} payment{combinedSalarySummary.total_payments === 1 ? '' : 's'}
                        </Text>
                      </Box>
                    </VStack>
                  ) : (
                    <Text color='gray.500' fontSize='sm'>No salary payment records</Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>

            <Card bg={cardBg} boxShadow='sm' mt={6}>
              <CardHeader>
                <Text fontWeight='bold' color={textColor} fontSize='lg'>
                  Salary Payments
                </Text>
              </CardHeader>
              <CardBody>
                {salaryPayments.length > 0 ? (
                  <Box overflowX='auto'>
                    <Table variant='simple' size='sm'>
                      <Thead>
                        <Tr>
                          <Th>Salary Month</Th>
                          <Th isNumeric>Amount</Th>
                          <Th isNumeric>Paid</Th>
                          <Th isNumeric>Remaining</Th>
                          <Th>Status</Th>
                          <Th>Paid On</Th>
                          <Th isNumeric>Excess</Th>
                          <Th>Notes</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {salaryPayments.map((payment) => {
                          const amountNum = toNumber(payment.amount || payment.total_amount || 0);
                          const paidNum = toNumber(payment.paid_amount || payment.paid || 0);
                          const remainingNum = Math.max(0, amountNum - paidNum);
                          const excessNum = Math.max(0, paidNum - amountNum);
                          const statusRaw = payment.status || (paidNum <= 0 ? 'pending' : paidNum >= amountNum ? 'paid' : 'partial');
                          const monthLabel = payment.month || payment.salary_month || payment.for_month;
                          const paidOnRaw = payment.last_paid_on || payment.paid_on || payment.payment_date || payment.updated_at;
                          const notes = payment.notes || '-';

                          return (
                            <Tr key={payment.id || `${monthLabel}-${paidOnRaw}`}>
                              <Td>{formatMonth(monthLabel)}</Td>
                              <Td isNumeric>PKR {formatCurrency(amountNum)}</Td>
                              <Td isNumeric>PKR {formatCurrency(paidNum)}</Td>
                              <Td isNumeric>PKR {formatCurrency(remainingNum)}</Td>
                              <Td>
                                <Badge colorScheme={getPaymentStatusColor(statusRaw)}>
                                  {statusRaw ? statusRaw.replace(/_/g, ' ') : 'pending'}
                                </Badge>
                              </Td>
                              <Td>{paidOnRaw ? formatDate(paidOnRaw) : '-'}</Td>
                              <Td isNumeric>PKR {formatCurrency(payment.excess_amount || excessNum)}</Td>
                              <Td maxW='220px' isTruncated>{notes}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Text color='gray.500' fontSize='sm'>No salary payments recorded yet.</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Loans Tab */}
          <TabPanel px={0} pt={6}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Loan Summary Stats */}
              <Card bg={cardBg} boxShadow='sm'>
                <CardHeader>
                  <Text fontWeight='bold' color={textColor} fontSize='lg'>
                    Loan Summary
                  </Text>
                </CardHeader>
                <CardBody>
                  {udhaarSummary ? (
                    <SimpleGrid columns={2} spacing={4}>
                      <Box p={4} bg={sectionBg} borderRadius='md'>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Total Amount Loaned
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color='blue.500'>
                          PKR {formatCurrency(totalAmountLoaned)}
                        </Text>
                      </Box>
                      <Box p={4} bg={sectionBg} borderRadius='md'>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Total Outstanding
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color={toNumber(udhaarSummary.total_remaining || udhaarSummary.total_outstanding || 0) > 0 ? 'orange.500' : 'green.500'}>
                          PKR {formatCurrency(udhaarSummary.total_remaining || udhaarSummary.total_outstanding || 0)}
                        </Text>
                      </Box>
                      <Box p={4} bg={sectionBg} borderRadius='md'>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Total Repaid
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color='green.500'>
                          PKR {formatCurrency(udhaarSummary.total_amount_paid || udhaarSummary.total_repaid || 0)}
                        </Text>
                      </Box>
                      <Box p={4} bg={sectionBg} borderRadius='md'>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Active Loans
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color={textColor}>
                          {udhaarSummary.active_loans || 0}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  ) : (
                    <Text color='gray.500' fontSize='sm'>No loan records found</Text>
                  )}
                </CardBody>
              </Card>

              {/* Loan Breakdown */}
              {udhaarSummary && (udhaarSummary.total_loans > 0 || udhaarSummary.active_loans > 0) && (
                <Card bg={cardBg} boxShadow='sm'>
                  <CardHeader>
                    <Text fontWeight='bold' color={textColor} fontSize='lg'>
                      Loan Breakdown
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack align='stretch' spacing={3}>
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Total Loans
                        </Text>
                        <Text fontSize='lg' fontWeight='bold' color={textColor}>
                          {udhaarSummary.total_loans || 0}
                        </Text>
                      </Box>
                      <Divider />
                      <Box>
                        <Text fontSize='xs' color='gray.500' mb={1}>
                          Fully Paid Loans
                        </Text>
                        <Text fontSize='lg' fontWeight='medium' color='green.500'>
                          {udhaarSummary.fully_paid_loans || 0}
                        </Text>
                      </Box>
                      {udhaarSummary.cancelled_loans > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Text fontSize='xs' color='gray.500' mb={1}>
                              Cancelled Loans
                            </Text>
                            <Text fontSize='lg' fontWeight='medium' color='gray.500'>
                              {udhaarSummary.cancelled_loans || 0}
                            </Text>
                          </Box>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>

            {/* Individual Loans Table */}
            {individualLoans.length > 0 && (
              <Card bg={cardBg} boxShadow='sm' mt={6}>
                <CardHeader>
                  <Text fontWeight='bold' color={textColor} fontSize='lg'>
                    Individual Loans
                  </Text>
                </CardHeader>
                <CardBody>
                  <Box overflowX='auto'>
                    <Table variant='simple' size='sm'>
                      <Thead>
                        <Tr>
                          <Th>Loan Date</Th>
                          <Th>Amount Loaned</Th>
                          <Th>Amount Paid</Th>
                          <Th>Remaining</Th>
                          <Th>Status</Th>
                          <Th>Last Payment</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {individualLoans.map((loan) => (
                          <Tr key={loan.id}>
                            <Td>{formatDate(loan.loan_date || loan.created_at)}</Td>
                            <Td>
                              <Text fontWeight='bold' color='blue.500'>
                                PKR {formatCurrency(loan.amount || 0)}
                              </Text>
                            </Td>
                            <Td>
                              <Text color='green.500'>
                                PKR {formatCurrency(loan.total_paid || 0)}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight='medium' color={toNumber(loan.remaining_amount || 0) > 0 ? 'orange.500' : 'green.500'}>
                                PKR {formatCurrency(loan.remaining_amount || 0)}
                              </Text>
                            </Td>
                            <Td>
                              <Badge 
                                colorScheme={
                                  loan.status === 'active' ? 'orange' :
                                  loan.status === 'fully_paid' ? 'green' :
                                  'gray'
                                }
                              >
                                {loan.status === 'fully_paid' ? 'Paid' : loan.status || 'N/A'}
                              </Badge>
                            </Td>
                            <Td>
                              {loan.last_payment_date ? formatDate(loan.last_payment_date) : '-'}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </CardBody>
              </Card>
            )}
            
            {/* Show message if no loans but summary exists */}
            {udhaarSummary && individualLoans.length === 0 && (
              <Card bg={cardBg} boxShadow='sm' mt={6}>
                <CardBody>
                  <Text color='gray.500' fontSize='sm' textAlign='center' py={4}>
                    No individual loan records found
                  </Text>
                </CardBody>
              </Card>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

