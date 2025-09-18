// Chakra imports
import { 
  Box, 
  Flex, 
  Grid, 
  Icon, 
  Text, 
  VStack, 
  Input, 
  Button, 
  useColorModeValue, 
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  HStack,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
// Assets
import BackgroundCard1 from "assets/img/BackgroundCard1.png";
import { MastercardIcon, VisaIcon } from "components/Icons/Icons";
import React from "react";
import { FaPaypal, FaWallet, FaEdit, FaTrash, FaExchangeAlt, FaChartLine, FaPlus } from "react-icons/fa";
import { RiMastercardFill } from "react-icons/ri";
import {
  billingData,
  invoicesData,
  newestTransactions,
  olderTransactions,
} from "variables/general";
import BillingInformation from "./components/BillingInformation";
import CreditCard from "./components/CreditCard";
import Invoices from "./components/Invoices";
// import PaymentMethod from "./components/PaymentMethod";
import PaymentStatistics from "./components/PaymentStatistics";
import Transactions from "./components/Transactions";

function Billing() {
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const headingColor = useColorModeValue("gray.700", "white");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.500");
  const toast = useToast();

  // API Integration - Keep original UI but add API functionality
  const [accounts, setAccounts] = React.useState([]);
  const [mainAccount, setMainAccount] = React.useState(null);
  const [revenueData, setRevenueData] = React.useState(null);
  const [accountSummary, setAccountSummary] = React.useState(null);
  const [accountName, setAccountName] = React.useState("");
  const [accountDetails, setAccountDetails] = React.useState("");
  const [accountBalance, setAccountBalance] = React.useState("");

  // Modal states
  const { isOpen: isEditAccountOpen, onOpen: onEditAccountOpen, onClose: onEditAccountClose } = useDisclosure();
  const { isOpen: isAllocateOpen, onOpen: onAllocateOpen, onClose: onAllocateClose } = useDisclosure();
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();

  // Form states
  const [editingAccount, setEditingAccount] = React.useState(null);
  const [allocationForm, setAllocationForm] = React.useState({
    account_id: "",
    amount: "",
    description: ""
  });
  const [transferForm, setTransferForm] = React.useState({
    from_account_id: "",
    to_account_id: "",
    amount: "",
    description: ""
  });

  // Load data on component mount
  React.useEffect(() => {
    fetchAccounts();
    fetchRevenueData();
    fetchAccountSummary();
  }, []);

  // Listen to billing-refresh to re-fetch accounts and revenue after transactions
  React.useEffect(() => {
    const refresh = () => { fetchAccounts(); fetchRevenueData(); fetchAccountSummary(); };
    window.addEventListener('billing-refresh', refresh);
    return () => window.removeEventListener('billing-refresh', refresh);
  }, []);

  // Derived values
  const allocatedSum = React.useMemo(
    () => accounts.filter(a => !a.is_main_account).reduce((sum, a) => sum + (parseFloat(a.account_balance) || 0), 0),
    [accounts]
  );
  const currentTotalRevenue = React.useMemo(
    () => accounts.reduce((sum, a) => sum + (parseFloat(a.account_balance) || 0), 0),
    [accounts]
  );

  // API Functions
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/accounts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const accountsData = await response.json();
        setAccounts(accountsData);
        const mainAcc = accountsData.find(acc => acc.is_main_account);
        setMainAccount(mainAcc);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/revenue/total`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const revenue = await response.json();
        setRevenueData(revenue);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const fetchAccountSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/accounts/summary`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const summary = await response.json();
        setAccountSummary(summary);
      }
    } catch (error) {
      console.error('Error fetching account summary:', error);
    }
  };

  const handleAddAccount = async () => {
    if (!accountName || !accountBalance) return;
    const initialAllocation = parseFloat(accountBalance);
    if (isNaN(initialAllocation) || initialAllocation < 0) {
      toast({ title: "Invalid amount", description: "Enter a valid non-negative balance.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    const mainAccountBalance = mainAccount ? parseFloat(mainAccount.account_balance || 0) : 0;
    if (initialAllocation > mainAccountBalance) {
      toast({ title: "Insufficient total revenue", description: `You can allocate up to ${formatCurrency(mainAccountBalance)} from the main account.`, status: "error", duration: 5000, isClosable: true });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/account`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          account_name: accountName,
          account_details: accountDetails,
          account_balance: initialAllocation,
          account_type: "other"
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Account created", description: data.message, status: "success", duration: 3000, isClosable: true });
        setAccountName("");
        setAccountDetails("");
        setAccountBalance("");
        fetchAccounts();
        fetchAccountSummary();
      } else {
        toast({ title: "Failed to create account", description: data.message, status: "error", duration: 5000, isClosable: true });
      }
    } catch (error) {
      toast({ title: "Network error", description: 'Unable to create account', status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleEditAccount = async () => {
    if (!editingAccount) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/account/${editingAccount.account_id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          account_name: editingAccount.account_name,
          account_details: editingAccount.account_details,
          account_balance: editingAccount.account_balance,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Account updated", description: data.message, status: "success", duration: 3000, isClosable: true });
        fetchAccounts();
        fetchAccountSummary();
        setEditingAccount(null);
        onEditAccountClose();
      } else {
        toast({ title: "Failed to update account", description: data.message, status: "error", duration: 5000, isClosable: true });
      }
    } catch (error) {
      toast({ title: "Network error", description: 'Unable to update account', status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/account/${accountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Account deleted", description: data.message, status: "success", duration: 3000, isClosable: true });
        fetchAccounts();
        fetchAccountSummary();
      } else {
        toast({ title: "Failed to delete account", description: data.message, status: "error", duration: 5000, isClosable: true });
      }
    } catch (error) {
      toast({ title: "Network error", description: 'Unable to delete account', status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleAllocateRevenue = async () => {
    if (!allocationForm.account_id || !allocationForm.amount) return;
    const amount = parseFloat(allocationForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", description: "Enter a valid positive amount.", status: "warning", duration: 4000, isClosable: true });
      return;
    }
    const mainAccountBalance = mainAccount ? parseFloat(mainAccount.account_balance || 0) : 0;
    if (amount > mainAccountBalance) {
      toast({ title: "Insufficient total revenue", description: `You can allocate up to ${formatCurrency(mainAccountBalance)} from the main account.`, status: "error", duration: 5000, isClosable: true });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/account/${allocationForm.account_id}/allocate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          description: allocationForm.description,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Revenue allocated", description: data.message, status: "success", duration: 3000, isClosable: true });
        setAllocationForm({ account_id: "", amount: "", description: "" });
        fetchAccounts();
        fetchAccountSummary();
        onAllocateClose();
      } else {
        toast({ title: "Failed to allocate revenue", description: data.message, status: "error", duration: 5000, isClosable: true });
      }
    } catch (error) {
      toast({ title: "Network error", description: 'Unable to allocate revenue', status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.from_account_id || !transferForm.to_account_id || !transferForm.amount) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/account/transfer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          from_account_id: parseInt(transferForm.from_account_id),
          to_account_id: parseInt(transferForm.to_account_id),
          amount: parseFloat(transferForm.amount),
          description: transferForm.description,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Transfer completed", description: data.message, status: "success", duration: 3000, isClosable: true });
        setTransferForm({ from_account_id: "", to_account_id: "", amount: "", description: "" });
        fetchAccounts();
        fetchAccountSummary();
        onTransferClose();
      } else {
        toast({ title: "Failed to transfer", description: data.message, status: "error", duration: 5000, isClosable: true });
      }
    } catch (error) {
      toast({ title: "Network error", description: 'Unable to transfer funds', status: "error", duration: 5000, isClosable: true });
    }
  };

  const openEditAccount = (account) => {
    setEditingAccount(account);
    onEditAccountOpen();
  };

  const formatCurrency = (amount) => {
    return `PKR. ${parseFloat(amount || 0).toLocaleString()}`;
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Grid templateColumns={{ sm: "1fr", lg: "2fr 1.2fr" }} templateRows='1fr'>
        <Box>
          <Grid
            templateColumns={{
              sm: "1fr",
              md: "1fr 1fr",
              xl: "1fr 1fr 1fr 1fr",
            }}
            templateRows={{ sm: "auto auto auto", md: "1fr auto", xl: "1fr" }}
            gap='26px'>
            <CreditCard
              backgroundImage={BackgroundCard1}
              title={mainAccount ? mainAccount.account_name : "Total Revenue"}
              number={mainAccount ? formatCurrency(mainAccount.account_balance) : "PKR. 0"}
              validity={{
                name: mainAccount ? (mainAccount.account_details || "Main Revenue Account") : "-",
                date: "05/24",
              }}
              cvv={{
                name: "Updated:",
                code: "Today",
              }}
              allocatedTotal={accounts.filter(a => !a.is_main_account).reduce((sum, a) => sum + (parseFloat(a.account_balance) || 0), 0)}
              totalRevenue={revenueData ? parseFloat(revenueData.total_revenue || 0) : undefined}
              accountsTotal={accounts.filter(a => !a.is_main_account).reduce((sum, a) => sum + (parseFloat(a.account_balance) || 0), 0)}
              icon={
                <Icon
                  as={RiMastercardFill}
                  w='48px'
                  h='auto'
                  color='gray.400'
                />
              }
            />
            {accounts.filter(acc => !acc.is_main_account).length === 0 ? (
              <Box
                bg={cardBg}
                borderRadius='15px'
                p='24px'
                boxShadow={cardShadow}
                display='flex'
                alignItems='center'
                justifyContent='center'
                gridColumn="1 / -1">
                <VStack spacing="16px">
                  <Text color={mutedColor} fontWeight='semibold' fontSize="lg">No account created</Text>
                  <Text color={mutedColor} fontSize="sm" textAlign="center">
                    Create your first account to start managing your finances
                  </Text>
                </VStack>
              </Box>
            ) : (
              accounts.filter(acc => !acc.is_main_account).map((acc, idx) => (
                <Box key={`${acc.account_name}-${idx}`} position="relative">
                  <PaymentStatistics
                    icon={<Icon h={"24px"} w={"24px"} color='white' as={FaWallet} />}
                    title={acc.account_name}
                    description={acc.account_details || acc.account_type}
                    amount={formatCurrency(acc.account_balance)}
                  />
                  <HStack position="absolute" top="8px" right="8px" spacing="4px">
                    <Button 
                      size="xs" 
                      p="4px" 
                      minW="auto" 
                      h="24px" 
                      bg="transparent" 
                      color="#FF8D28" 
                      _hover={{ bg: "rgba(255, 141, 40, 0.1)" }}
                      onClick={() => openEditAccount(acc)}
                    >
                      <FaEdit size="12px" />
                    </Button>
                    <Button 
                      size="xs" 
                      p="4px" 
                      minW="auto" 
                      h="24px" 
                      bg="transparent" 
                      color="#FF8D28" 
                      _hover={{ bg: "rgba(255, 141, 40, 0.1)" }}
                      onClick={() => handleDeleteAccount(acc.account_id)}
                    >
                      <FaTrash size="12px" />
                    </Button>
                  </HStack>
                </Box>
              ))
            )}
          </Grid>
          {/* Revenue Management Section */}
          {revenueData && (
            <Box bg={cardBg} borderRadius='15px' p='24px' mt='26px' boxShadow={cardShadow}>
              <Text fontSize='lg' fontWeight='bold' color={headingColor} mb='18px'>
                Revenue Management
              </Text>
              <Grid templateColumns={{ sm: "1fr", md: "1fr 1fr" }} gap='24px'>
                <VStack align='stretch' spacing='16px'>
                  <Text fontSize='md' fontWeight='semibold' color={headingColor}>Revenue Breakdown</Text>
                  <Stat>
                    <StatLabel>Stock Sales Profit</StatLabel>
                    <StatNumber color="green.500">{formatCurrency(revenueData.breakdown.stock_sales_profit)}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Rental Profit</StatLabel>
                    <StatNumber color="blue.500">{formatCurrency(revenueData.breakdown.rental_profit)}</StatNumber>
                  </Stat>
                  <Divider />
                  <Stat>
                    <StatLabel>Total Unallocated Income</StatLabel>
                    <StatNumber color="purple.500">{mainAccount ? formatCurrency(mainAccount.account_balance) : "PKR. 0"}</StatNumber>
                  </Stat>
                </VStack>
                <VStack align='stretch' spacing='16px'>
                  <Text fontSize='md' fontWeight='semibold' color={headingColor}>Quick Actions</Text>
                  <Button leftIcon={<FaChartLine />} colorScheme="green" variant="outline" onClick={onAllocateOpen}>
                    Allocate Revenue
                  </Button>
                  <Button leftIcon={<FaExchangeAlt />} colorScheme="purple" variant="outline" onClick={onTransferOpen}>
                    Transfer Money
                  </Button>
                  {accountSummary && (
                    <VStack align='stretch' spacing='8px' pt='16px'>
                      <Text fontSize='sm' fontWeight='semibold' color={headingColor}>Account Summary</Text>
                      <Text fontSize='sm' color={labelColor}>Available: {mainAccount ? formatCurrency(mainAccount.account_balance) : "PKR. 0"}</Text>
                      <Text fontSize='sm' color={labelColor}>Allocated: {formatCurrency(allocatedSum)}</Text>
                    </VStack>
                  )}
                </VStack>
              </Grid>
            </Box>
          )}

          {/* Add New Account */}
          <Box bg={cardBg} borderRadius='15px' p='24px' mt='26px' boxShadow={cardShadow}>
            <Text fontSize='lg' fontWeight='bold' color={headingColor} mb='18px'>
              Add a New Account
            </Text>
            <Grid templateColumns={{ sm: "1fr", md: "1fr 1fr 1fr auto" }} gap='16px' alignItems='end'>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Account Name</Text>
                <Input placeholder='Enter account name' value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </VStack>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Account Details</Text>
                <Input placeholder='Enter details' value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} />
              </VStack>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Account Balance</Text>
                <Input placeholder='Enter amount' value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
              </VStack>
              <Button bg='blue.600' color='white' _hover={{ bg: 'blue.700' }} px='24px' onClick={handleAddAccount}>
                ADD NEW ACCOUNT
              </Button>
            </Grid>
          </Box>
        </Box>
        <Invoices title={"Invoices"} data={invoicesData} />
      </Grid>
      <Grid templateColumns={{ sm: "1fr", lg: "1.6fr 1.2fr" }}>
        <BillingInformation title={"Bills & Rents"} data={billingData} />
        <Transactions
          title={"Your Transactions"}
          date={"23 - 30 March"}
          newestTransactions={newestTransactions}
          olderTransactions={olderTransactions}
        />
      </Grid>

      {/* Edit Account Modal */}
      <Modal isOpen={isEditAccountOpen} onClose={onEditAccountClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            {editingAccount && (
              <VStack spacing='16px'>
                <FormControl isRequired>
                  <FormLabel>Account Name</FormLabel>
                  <Input 
                    value={editingAccount.account_name} 
                    onChange={(e) => setEditingAccount({ ...editingAccount, account_name: e.target.value })} 
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Account Details</FormLabel>
                  <Input 
                    value={editingAccount.account_details} 
                    onChange={(e) => setEditingAccount({ ...editingAccount, account_details: e.target.value })} 
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Account Balance</FormLabel>
                  <Input 
                    type="number" 
                    value={editingAccount.account_balance} 
                    onChange={(e) => setEditingAccount({ ...editingAccount, account_balance: e.target.value })} 
                  />
                </FormControl>
                <Button colorScheme='blue' w='100%' onClick={handleEditAccount}>
                  Update Account
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Allocate Revenue Modal */}
      <Modal isOpen={isAllocateOpen} onClose={onAllocateClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Allocate Revenue</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel>Select Account</FormLabel>
                <Select 
                  value={allocationForm.account_id} 
                  onChange={(e) => setAllocationForm({ ...allocationForm, account_id: e.target.value })}
                >
                  <option value="">Choose account...</option>
                  {accounts.filter(acc => !acc.is_main_account).map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} ({account.account_type})
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Amount to Allocate</FormLabel>
                <Input 
                  type="number" 
                  placeholder='Enter amount' 
                  value={allocationForm.amount} 
                  onChange={(e) => setAllocationForm({ ...allocationForm, amount: e.target.value })} 
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input 
                  placeholder='Enter description' 
                  value={allocationForm.description} 
                  onChange={(e) => setAllocationForm({ ...allocationForm, description: e.target.value })} 
                />
              </FormControl>
              <Button colorScheme='green' w='100%' onClick={handleAllocateRevenue}>
                Allocate Revenue
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Transfer Money Modal */}
      <Modal isOpen={isTransferOpen} onClose={onTransferClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer Money</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl isRequired>
                <FormLabel>From Account</FormLabel>
                <Select 
                  value={transferForm.from_account_id} 
                  onChange={(e) => setTransferForm({ ...transferForm, from_account_id: e.target.value })}
                >
                  <option value="">Choose source account...</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} - {formatCurrency(account.account_balance)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>To Account</FormLabel>
                <Select 
                  value={transferForm.to_account_id} 
                  onChange={(e) => setTransferForm({ ...transferForm, to_account_id: e.target.value })}
                >
                  <option value="">Choose destination account...</option>
                  {accounts.map(account => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.account_name} - {formatCurrency(account.account_balance)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Transfer Amount</FormLabel>
                <Input 
                  type="number" 
                  placeholder='Enter amount' 
                  value={transferForm.amount} 
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} 
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input 
                  placeholder='Enter description' 
                  value={transferForm.description} 
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} 
                />
              </FormControl>
              <Button colorScheme='purple' w='100%' onClick={handleTransfer}>
                Transfer Money
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default Billing;
