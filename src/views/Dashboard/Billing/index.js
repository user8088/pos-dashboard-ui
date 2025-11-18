// Chakra imports
import {
  Box,
  Flex,
  Grid,
  Icon,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  useColorModeValue,
  Select,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormLabel,
} from "@chakra-ui/react";
// Assets
import BackgroundCard1 from "assets/img/BackgroundCard1.png";
import { MastercardIcon, VisaIcon } from "components/Icons/Icons";
import React from "react";
import { FaPaypal, FaWallet, FaExchangeAlt, FaChartBar, FaMoneyBillWave, FaHandHoldingUsd, FaBalanceScale } from "react-icons/fa";
import { RiMastercardFill } from "react-icons/ri";
import {
  billingData,
} from "variables/general";
import BillingInformation from "./components/BillingInformation";
import CreditCard from "./components/CreditCard";
import PaymentStatistics from "./components/PaymentStatistics";
import Transactions from "./components/Transactions";
import UdhaarList from "./components/UdhaarList";
import AccountHierarchy from "./components/AccountHierarchy";
import { accountService } from "services/accountService";
import { billingService } from "services/billingService";

function Billing() {
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const headingColor = useColorModeValue("gray.700", "white");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.500");
  const [accountsSummary, setAccountsSummary] = React.useState(null);
  const [accounts, setAccounts] = React.useState([]);
  const [totalRevenue, setTotalRevenue] = React.useState("0.00");
  const [loading, setLoading] = React.useState(true);
  const [accountName, setAccountName] = React.useState("");
  const [accountDetails, setAccountDetails] = React.useState("");
  const [accountCode, setAccountCode] = React.useState("");
  const [accountType, setAccountType] = React.useState("custom");
  
  // Transfer modal states
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();
  
  // Reload accounts when transfer modal opens
  React.useEffect(() => {
    if (isTransferOpen) {
      loadAccounts();
    }
  }, [isTransferOpen, loadAccounts]);
  const [transferFrom, setTransferFrom] = React.useState("");
  const [transferTo, setTransferTo] = React.useState("");
  const [transferAmount, setTransferAmount] = React.useState("");
  const [transferDescription, setTransferDescription] = React.useState("");
  const [bills, setBills] = React.useState([]);
  
  const toast = useToast();

  const loadAccounts = React.useCallback(async () => {
    try {
      setLoading(true);
      // Try accounts/summary first, fallback to listAccounts if it fails
      let resp;
      let data = {};
      try {
        resp = await accountService.getAccountsSummary();
        data = resp?.data || resp || {};
      } catch (summaryError) {
        // If summary endpoint fails, try listing accounts directly
        console.warn('Summary endpoint failed, trying listAccounts:', summaryError);
        resp = await accountService.listAccounts();
        const accountsList = Array.isArray(resp) ? resp : (resp?.data || resp?.accounts || []);
        data = {
          accounts: accountsList,
          total_revenue: "0.00",
        };
      }
      
      setAccountsSummary(data);
      
      // Set revenue
      const revenueStr = data.total_revenue || "0.00";
      const revenueClean = typeof revenueStr === 'string' 
        ? revenueStr.replace(/,/g, '') 
        : String(revenueStr);
      setTotalRevenue(revenueClean);
      
      // Get all accounts - ensure it's always an array
      let allAccounts = [];
      if (Array.isArray(data.accounts)) {
        allAccounts = data.accounts;
      } else if (data.accounts && typeof data.accounts === 'object') {
        // If accounts is an object, try to extract array from it
        allAccounts = Array.isArray(data.accounts.data) ? data.accounts.data : [];
      }
      setAccounts(allAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast({
        title: 'Error loading accounts',
        description: error.message || 'Failed to load accounts. Please check if accounts are set up.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setTotalRevenue("0.00");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Listen for account updates from supplier transactions
  React.useEffect(() => {
    const handleAccountUpdate = () => {
      loadAccounts();
    };
    
    window.addEventListener('supplier-transaction-created', handleAccountUpdate);
    window.addEventListener('accounts-updated', handleAccountUpdate);
    
    return () => {
      window.removeEventListener('supplier-transaction-created', handleAccountUpdate);
      window.removeEventListener('accounts-updated', handleAccountUpdate);
    };
  }, [loadAccounts]);

  // Load bills list for the Bills & Rents card
  React.useEffect(() => {
    (async () => {
      try {
        const resp = await billingService.listBills({ per_page: 20 });
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[Bills] API response', resp);
        }
        let list = [];
        if (Array.isArray(resp)) {
          list = resp;
        } else if (Array.isArray(resp?.data)) {
          list = resp.data;
        } else if (Array.isArray(resp?.data?.data)) {
          list = resp.data.data;
        } else if (resp && resp.success && Array.isArray(resp.data)) {
          list = resp.data;
        }
        setBills(list);
      } catch (e) {
        console.error('Failed to load bills:', e);
        toast({ title: 'Error loading bills', description: e.message || 'Server error', status: 'error', duration: 3000, isClosable: true });
        setBills([]);
      }
    })();
  }, []);

  const formatCurrency = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
    const safe = isNaN(num) ? 0 : num;
    return `PKR. ${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (_) {
      return String(dateString || '');
    }
  };

  const billsViewData = React.useMemo(() => {
    return (bills || []).map((b) => ({
      name: `${String(b.tag || 'bill').toUpperCase()} — ${formatDate(b.bill_date)}`,
      company: b.note ? b.note : '—',
      email: `Date: ${formatDate(b.bill_date)}`,
      number: formatCurrency(b.amount),
    }));
  }, [bills]);

  const handleAddAccount = async () => {
    if (!accountName) {
      toast({
        title: 'Validation error',
        description: 'Account name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await accountService.createAccount({
        name: accountName,
        description: accountDetails,
        code: accountCode,
        type: accountType,
        is_active: true,
      });
      toast({
        title: 'Success',
        description: 'Account created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setAccountName("");
      setAccountDetails("");
      setAccountCode("");
      setAccountType("custom");
      await loadAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
      toast({
        title: 'Error creating account',
        description: error.message || 'Failed to create account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTransfer = async () => {
    if (!transferFrom || !transferTo || !transferAmount) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all transfer fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (transferFrom === transferTo) {
      toast({
        title: 'Validation error',
        description: 'Cannot transfer to the same account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Check if source and destination have the same account type
    const fromAccount = accounts.find(acc => acc.id === Number(transferFrom));
    const toAccount = accounts.find(acc => acc.id === Number(transferTo));
    if (fromAccount && toAccount && fromAccount.type === toAccount.type) {
      toast({
        title: 'Validation error',
        description: 'Cannot transfer between accounts of the same type',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const amount = Number(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Validation error',
        description: 'Please enter a valid amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await accountService.transferFunds({
        from_account_id: Number(transferFrom),
        to_account_id: Number(transferTo),
        amount: amount,
        description: transferDescription || undefined,
      });
      toast({
        title: 'Success',
        description: 'Transfer completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTransferFrom("");
      setTransferTo("");
      setTransferAmount("");
      setTransferDescription("");
      onTransferClose();
      await loadAccounts();
    } catch (error) {
      console.error('Failed to transfer funds:', error);
      toast({
        title: 'Error transferring funds',
        description: error.message || 'Failed to transfer funds',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Helper function to safely parse balance
  const parseBalance = (balance) => {
    if (balance === null || balance === undefined || balance === '') return 0;
    const num = typeof balance === 'string' ? parseFloat(balance.replace(/,/g, '')) : Number(balance);
    return isNaN(num) ? 0 : num;
  };

  const formatBalance = (balance) => {
    const parsed = parseBalance(balance);
    return parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const revenueAccount = accountsSummary?.revenue_account;
  const cashAccount = accountsSummary?.cash_account;
  const bankAccount = accountsSummary?.bank_account;

  const [accountToView, setAccountToView] = React.useState(null);

  // Calculate overall account statistics
  const accountStats = React.useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return {
        totalAssets: 0,
        totalLiabilities: 0,
        totalExpenses: 0,
        totalRevenue: 0,
        netWorth: 0,
        totalAccounts: 0,
      };
    }

    let totalAssets = 0; // Cash + Bank + Receivables
    let totalLiabilities = 0; // Advances + Udhaar
    let totalExpenses = 0; // All expense accounts
    let totalRevenue = 0; // Revenue accounts
    let totalEquity = 0; // Equity accounts
    let totalLosses = 0; // Loss accounts

    accounts.forEach((account) => {
      const balance = parseBalance(account.balance);
      const type = (account.type || "custom").toLowerCase();

      if (type === "cash" || type === "bank" || type === "receivable") {
        totalAssets += balance;
      } else if (type === "advance" || type === "udhaar") {
        totalLiabilities += Math.abs(balance); // Liabilities are typically positive in accounting
      } else if (type === "expense") {
        totalExpenses += Math.abs(balance);
      } else if (type === "revenue") {
        totalRevenue += balance;
      } else if (type === "equity") {
        totalEquity += balance;
      } else if (type === "loss") {
        totalLosses += Math.abs(balance);
      }
    });

    // Net Worth = Assets - Liabilities + Equity - Losses
    const netWorth = totalAssets - totalLiabilities + totalEquity - totalLosses;

    return {
      totalAssets,
      totalLiabilities,
      totalExpenses,
      totalRevenue,
      totalEquity,
      totalLosses,
      netWorth,
      totalAccounts: accounts.length,
    };
  }, [accounts]);

  const handleAccountClick = (account) => {
    // This will be handled by AccountHierarchy component
    console.log("Account clicked:", account);
  };

  // Handler for PaymentStatistics cards
  const handlePaymentStatClick = (account) => {
    if (account && account.id) {
      setAccountToView(account);
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Header Actions */}
      <Flex justify='space-between' align='center' mb='20px' flexWrap='wrap' gap='12px'>
        <Text fontSize='2xl' fontWeight='bold' color={headingColor}>
          Accounting & Billing
        </Text>
        <Button
          leftIcon={<Icon as={FaExchangeAlt} />}
          bg='#FF8D28'
          color='white'
          _hover={{ bg: '#E67E22' }}
          onClick={onTransferOpen}>
          Transfer Funds
        </Button>
      </Flex>

      {/* Overall Account Statistics */}
      <Grid templateColumns={{ sm: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }} gap='26px' mb='26px'>
        <PaymentStatistics
          icon={<Icon h={"24px"} w={"24px"} color='white' as={FaChartBar} />}
          title="Total Assets"
          description="Cash + Bank + Receivables"
          amount={`PKR ${formatBalance(accountStats.totalAssets)}`}
        />
        <PaymentStatistics
          icon={<Icon h={"24px"} w={"24px"} color='white' as={FaHandHoldingUsd} />}
          title="Total Liabilities"
          description="Advances + Staff Loans"
          amount={`PKR ${formatBalance(accountStats.totalLiabilities)}`}
        />
        <PaymentStatistics
          icon={<Icon h={"24px"} w={"24px"} color='white' as={FaMoneyBillWave} />}
          title="Total Expenses"
          description="All Expense Accounts"
          amount={`PKR ${formatBalance(accountStats.totalExpenses)}`}
        />
        <PaymentStatistics
          icon={<Icon h={"24px"} w={"24px"} color='white' as={FaBalanceScale} />}
          title="Net Worth"
          description="Assets - Liabilities"
          amount={`PKR ${formatBalance(accountStats.netWorth)}`}
        />
      </Grid>

      {/* Key Metrics Cards */}
      <Grid templateColumns={{ sm: "1fr", lg: "1fr 1fr" , xl: "1fr 1fr 1fr 1fr" }} gap='26px' mb='26px'>
        <CreditCard
          backgroundImage={BackgroundCard1}
          title={"Total Revenue"}
          number={`PKR ${isNaN(Number(totalRevenue)) ? '0.00' : Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          validity={{
            name: "Your Total Business Revenue",
            data: "05/24",
          }}
          cvv={{
            name: "Updated:",
            code: "Today",
          }}
          icon={
            <Icon
              as={RiMastercardFill}
              w='48px'
              h='auto'
              color='gray.400'
            />
          }
        />
        <Grid templateColumns={{ sm: "1fr", md: "1fr 1fr" }} gap='26px' mb='26px'>
          {cashAccount && (
            <PaymentStatistics
              icon={<Icon h={"24px"} w={"24px"} color='white' as={FaWallet} />}
              title={cashAccount.name || "Cash"}
              description={cashAccount.code || "Cash Account"}
              amount={`PKR ${formatBalance(cashAccount.balance)}`}
              account={cashAccount}
              onClick={() => handlePaymentStatClick(cashAccount)}
            />
          )}
          {bankAccount && (
            <PaymentStatistics
              icon={<Icon h={"24px"} w={"24px"} color='white' as={FaPaypal} />}
              title={bankAccount.name || "Bank"}
              description={bankAccount.code || "Bank Account"}
              amount={`PKR ${formatBalance(bankAccount.balance)}`}
              account={bankAccount}
              onClick={() => handlePaymentStatClick(bankAccount)}
            />
          )}
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ sm: "1fr", lg: "2fr 1fr" }} gap='26px' mb='26px'>
        {/* Account Hierarchy - Takes 2/3 width */}
        <Box>
          {loading ? (
            <Flex justify='center' align='center' minH='400px'>
              <Spinner size='xl' />
            </Flex>
          ) : (
            <AccountHierarchy 
              accounts={accounts} 
              onAccountClick={handleAccountClick}
              accountToView={accountToView}
              onAccountViewed={() => setAccountToView(null)}
            />
          )}
        </Box>

        {/* Quick Actions - Takes 1/3 width */}
        <VStack spacing='26px' align='stretch'>
          {/* Add New Account */}
          <Box bg={cardBg} borderRadius='15px' p='24px' boxShadow={cardShadow}>
            <Text fontSize='lg' fontWeight='bold' color={headingColor} mb='18px'>
              Add a New Account
            </Text>
            <VStack spacing='16px' align='stretch'>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Account Name *</Text>
                <Input placeholder='Enter account name' value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </VStack>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Account Code</Text>
                <Input placeholder='Enter code' value={accountCode} onChange={(e) => setAccountCode(e.target.value)} />
              </VStack>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Account Type</Text>
                <Select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                  <option value='custom'>Custom</option>
                </Select>
              </VStack>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Description</Text>
                <Input placeholder='Enter description' value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} />
              </VStack>
              <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} w='100%' onClick={handleAddAccount} isLoading={loading}>
                ADD ACCOUNT
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Grid>

      {/* Bottom Section - Bills, Transactions, Udhaar */}
      <Grid templateColumns={{ sm: "1fr", lg: "1fr 1fr 1fr" }} gap='26px'>
        <BillingInformation title={"Bills & Rents"} data={billsViewData} accounts={accounts} />
        <Transactions />
        <UdhaarList />
      </Grid>

      {/* Transfer Funds Modal */}
      <Modal isOpen={isTransferOpen} onClose={onTransferClose} size='md'>
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader color={headingColor}>
            <Flex align='center' gap='8px'>
              <Icon as={FaExchangeAlt} />
              <Text>Transfer Funds Between Accounts</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing='20px' align='stretch'>
              <Box>
                <FormLabel fontSize='sm' color={labelColor}>From Account *</FormLabel>
                {loading ? (
                  <Select placeholder='Loading accounts...' isDisabled>
                    <option>Loading...</option>
                  </Select>
                ) : accounts.length === 0 ? (
                  <Select placeholder='No accounts available' isDisabled>
                    <option>No accounts available</option>
                  </Select>
                ) : (
                  <Select
                    value={transferFrom}
                    onChange={(e) => {
                      setTransferFrom(e.target.value);
                      setTransferTo(""); // Reset destination when source changes
                    }}
                    placeholder='Select source account'>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} {acc.code ? `(${acc.code})` : ''} - PKR {formatBalance(acc.balance)}
                      </option>
                    ))}
                  </Select>
                )}
              </Box>
              <Box>
                <FormLabel fontSize='sm' color={labelColor}>To Account *</FormLabel>
                {loading ? (
                  <Select placeholder='Loading accounts...' isDisabled>
                    <option>Loading...</option>
                  </Select>
                ) : !transferFrom ? (
                  <Select placeholder='Select source account first' isDisabled>
                    <option>Select source account first</option>
                  </Select>
                ) : (() => {
                  const fromAccount = accounts.find(acc => acc.id === Number(transferFrom));
                  const availableAccounts = accounts.filter(acc => 
                    acc.id !== Number(transferFrom) && 
                    acc.type !== fromAccount?.type
                  );
                  return availableAccounts.length === 0 ? (
                    <Select placeholder='No accounts available with different type' isDisabled>
                      <option>No accounts available with different type</option>
                    </Select>
                  ) : (
                    <Select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      placeholder='Select destination account'>
                      {availableAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} {acc.code ? `(${acc.code})` : ''} - PKR {formatBalance(acc.balance)}
                        </option>
                      ))}
                    </Select>
                  );
                })()}
              </Box>
              <Box>
                <FormLabel fontSize='sm' color={labelColor}>Amount *</FormLabel>
                <Input
                  type='number'
                  step='0.01'
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder='Enter transfer amount'
                />
                {transferFrom && accounts.find(a => a.id === Number(transferFrom)) && (
                  <Text fontSize='xs' color={mutedColor} mt='4px'>
                    Available: PKR {formatBalance(accounts.find(a => a.id === Number(transferFrom))?.balance)}
                  </Text>
                )}
              </Box>
              <Box>
                <FormLabel fontSize='sm' color={labelColor}>Description (Optional)</FormLabel>
                <Input
                  value={transferDescription}
                  onChange={(e) => setTransferDescription(e.target.value)}
                  placeholder='e.g., Daily deposit to bank'
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onTransferClose}>
              Cancel
            </Button>
            <Button bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }} onClick={handleTransfer}>
              Transfer Funds
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default Billing;
