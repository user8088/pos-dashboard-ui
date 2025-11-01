// Chakra imports
import { Box, Flex, Grid, Icon, Text, VStack, Input, Button, useColorModeValue, Select, Spinner, useToast } from "@chakra-ui/react";
// Assets
import BackgroundCard1 from "assets/img/BackgroundCard1.png";
import { MastercardIcon, VisaIcon } from "components/Icons/Icons";
import React from "react";
import { FaPaypal, FaWallet } from "react-icons/fa";
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
import { accountService } from "services/accountService";

function Billing() {
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const headingColor = useColorModeValue("gray.700", "white");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.500");
  const [accounts, setAccounts] = React.useState([]);
  const [totalRevenue, setTotalRevenue] = React.useState("0.00");
  const [loading, setLoading] = React.useState(true);
  const [accountName, setAccountName] = React.useState("");
  const [accountDetails, setAccountDetails] = React.useState("");
  const [accountCode, setAccountCode] = React.useState("");
  const [accountType, setAccountType] = React.useState("custom");
  const toast = useToast();

  const loadAccounts = React.useCallback(async () => {
    try {
      setLoading(true);
      const resp = await accountService.listAccounts();
      const data = resp?.data || resp || {};
      const accountsList = data.accounts || [];
      setAccounts(accountsList);
      // Handle revenue as string (may have commas from backend) or number
      const revenueStr = data.total_revenue || "0.00";
      const revenueClean = typeof revenueStr === 'string' 
        ? revenueStr.replace(/,/g, '') 
        : String(revenueStr);
      setTotalRevenue(revenueClean);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast({
        title: 'Error loading accounts',
        description: error.message || 'Failed to load accounts',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setTotalRevenue("0.00");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

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
              title={"Total Revenue"}
              number={`PKR ${isNaN(Number(totalRevenue)) ? '0.00' : Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              validity={{
                name: "Your Total Business & Personal Income",
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
            {loading ? (
              <Box
                bg={cardBg}
                borderRadius='15px'
                p='24px'
                boxShadow={cardShadow}
                display='flex'
                alignItems='center'
                justifyContent='center'>
                <Spinner />
              </Box>
            ) : accounts.length === 0 ? (
              <Box
                bg={cardBg}
                borderRadius='15px'
                p='24px'
                boxShadow={cardShadow}
                display='flex'
                alignItems='center'
                justifyContent='center'>
                <Text color={mutedColor} fontWeight='semibold'>No account added</Text>
              </Box>
            ) : (
              accounts.slice(0, 3).map((acc, idx) => (
                <PaymentStatistics
                  key={acc.id || idx}
                  icon={<Icon h={"24px"} w={"24px"} color='white' as={FaWallet} />}
                  title={acc.name}
                  description={acc.code || acc.type || "Account"}
                  amount={`PKR ${Number(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              ))
            )}
          </Grid>
          {/* Add New Account */}
          <Box bg={cardBg} borderRadius='15px' p='24px' mt='26px' boxShadow={cardShadow}>
            <Text fontSize='lg' fontWeight='bold' color={headingColor} mb='18px'>
              Add a New Account
            </Text>
            <Grid templateColumns={{ sm: "1fr", md: "1fr 1fr 1fr 1fr auto" }} gap='16px' alignItems='end'>
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
                  <option value='revenue'>Revenue</option>
                  <option value='advance'>Advance</option>
                </Select>
              </VStack>
              <VStack align='start' spacing='8px'>
                <Text fontSize='sm' color={labelColor}>Description</Text>
                <Input placeholder='Enter description' value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)} />
              </VStack>
              <Button bg='blue.600' color='white' _hover={{ bg: 'blue.700' }} px='24px' onClick={handleAddAccount} isLoading={loading}>
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
    </Flex>
  );
}

export default Billing;
