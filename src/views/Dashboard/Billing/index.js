// Chakra imports
import { Box, Flex, Grid, Icon, Text, VStack, Input, Button, useColorModeValue } from "@chakra-ui/react";
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

function Billing() {
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const headingColor = useColorModeValue("gray.700", "white");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.500");
  const [accounts, setAccounts] = React.useState([]);
  const [accountName, setAccountName] = React.useState("");
  const [accountDetails, setAccountDetails] = React.useState("");
  const [accountBalance, setAccountBalance] = React.useState("");

  const handleAddAccount = () => {
    if (!accountName || !accountBalance) return;
    const newAccount = {
      name: accountName,
      details: accountDetails,
      balance: accountBalance,
    };
    setAccounts((prev) => [...prev, newAccount]);
    setAccountName("");
    setAccountDetails("");
    setAccountBalance("");
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
              number={"PKR. 1,000,000"}
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
            {accounts.length === 0 ? (
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
              accounts.map((acc, idx) => (
                <PaymentStatistics
                  key={`${acc.name}-${idx}`}
                  icon={<Icon h={"24px"} w={"24px"} color='white' as={FaWallet} />}
                  title={acc.name}
                  description={acc.details || "Account"}
                  amount={`PKR. ${acc.balance}`}
                />
              ))
            )}
          </Grid>
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
    </Flex>
  );
}

export default Billing;
