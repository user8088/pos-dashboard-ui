// Chakra imports
import { Box, Flex, Grid, Icon, Text, VStack, Input, Button, useColorModeValue, Spinner } from "@chakra-ui/react";
// Assets
import BackgroundCard1 from "assets/img/BackgroundCard1.png";
import { MastercardIcon, VisaIcon } from "components/Icons/Icons";
import React from "react";
import { FaPaypal, FaWallet } from "react-icons/fa";
import { RiMastercardFill } from "react-icons/ri";
import CreditCard from "views/Dashboard/Billing/components/CreditCard";
import PaymentStatistics from "views/Dashboard/Billing/components/PaymentStatistics";
import FactoryInvoices from "./components/FactoryInvoices";
import FactoryBillingInformation from "./components/FactoryBillingInformation";
import FactoryTransactions from "./components/FactoryTransactions";

// Factory-specific data
const factoryInvoicesData = [
  {
    date: "March, 01, 2020",
    code: "#MS-415646",
    price: "$180",
    logo: "https://demos.creative-tim.com/vision-ui-dashboard-chakra/static/media/atlassian.0e9c0b4b.svg",
    format: "PDF"
  },
  {
    date: "February, 10, 2021",
    code: "#RV-126749",
    price: "$250",
    logo: "https://demos.creative-tim.com/vision-ui-dashboard-chakra/static/media/atlassian.0e9c0b4b.svg",
    format: "PDF"
  },
  {
    date: "April, 05, 2020",
    code: "#FB-212562",
    price: "$560",
    logo: "https://demos.creative-tim.com/vision-ui-dashboard-chakra/static/media/atlassian.0e9c0b4b.svg",
    format: "PDF"
  },
  {
    date: "June, 25, 2019",
    code: "#QW-103578",
    price: "$120",
    logo: "https://demos.creative-tim.com/vision-ui-dashboard-chakra/static/media/atlassian.0e9c0b4b.svg",
    format: "PDF"
  },
  {
    date: "March, 01, 2019",
    code: "#AR-803681",
    price: "$300",
    logo: "https://demos.creative-tim.com/vision-ui-dashboard-chakra/static/media/atlassian.0e9c0b4b.svg",
    format: "PDF"
  }
];

const factoryBillingData = [
  {
    name: "BILL # 123243",
    company: "Viking Burrito",
    email: "oliver@burrito.com",
    number: "PKR. 50,000",
  },
  {
    name: "BILL # 123243",
    company: "Viking Burrito",
    email: "oliver@burrito.com",
    number: "PKR. 50,000",
  },
  {
    name: "RENT # 123243",
    company: "Viking Burrito",
    email: "oliver@burrito.com",
    number: "PKR. 50,000",
  }
];

const factoryNewestTransactions = [
  {
    name: "Advance Payment to Supplier",
    date: "27 March 2020, at 12:30 PM",
    price: "-PKR. 2500",
    logo: ""
  },
  {
    name: "Product Investment",
    date: "27 March 2020, at 12:30 PM",
    price: "+PKR. 2500",
    logo: ""
  }
];

const factoryOlderTransactions = [
  {
    name: "Shareholder Investment",
    date: "26 March 2020, at 13:45 PM",
    price: "+PKR. 2500",
    logo: ""
  },
  {
    name: "Monthly Investment",
    date: "26 March 2020, at 12:30 PM",
    price: "+PKR. 2500",
    logo: ""
  },
  {
    name: "Repairs",
    date: "26 March 2020, at 05:00 AM",
    price: "Pending",
    logo: ""
  },
  {
    name: "Raw Material Costs",
    date: "25 March 2020, at 16:30 PM",
    price: "-PKR. 2500",
    logo: ""
  }
];

function FactoryExpensesCashflow() {
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  const headingColor = useColorModeValue("gray.700", "white");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.500");
  const [accounts, setAccounts] = React.useState([]);
  const [accountName, setAccountName] = React.useState("");
  const [accountDetails, setAccountDetails] = React.useState("");
  const [accountBalance, setAccountBalance] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const allocatedTotal = React.useMemo(() => {
    try {
      return accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
    } catch {
      return 0;
    }
  }, [accounts]);

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
      {isLoading ? (
        <Flex justify="center" align="center" h="300px" w="100%">
          <VStack spacing="16px" textAlign="center">
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#FF8D28" size="xl" />
            <Text color={headingColor}>Loading expenses & cashflow...</Text>
          </VStack>
        </Flex>
      ) : (
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
              title={"Total Production Budget"}
              number={"PKR. 120,000,000"}
              validity={{
                name: "Your Factory Investment",
                date: "05/24",
              }}
              cvv={{
                name: "Updated:",
                code: "Today",
              }}
              allocatedTotal={allocatedTotal}
              icon={
                <Icon
                  as={RiMastercardFill}
                  w='48px'
                  h='auto'
                  color='gray.400'
                />
              }
            />
            <PaymentStatistics
              icon={<Icon h={"24px"} w={"24px"} color='white' as={FaWallet} />}
              title={"Factory Savings"}
              description={"Account Details Here"}
              amount={"PKR. 880,000"}
            />
            <PaymentStatistics
              icon={<Icon h={"24px"} w={"24px"} color='white' as={FaPaypal} />}
              title={"Raw Material Funds"}
              description={"Account Details Here"}
              amount={"PKR. 240,000"}
            />
            {accounts.length > 0 && accounts.map((acc, idx) => (
              <PaymentStatistics
                key={`${acc.name}-${idx}`}
                icon={<Icon h={"24px"} w={"24px"} color='white' as={FaWallet} />}
                title={acc.name}
                description={acc.details || "Account"}
                amount={`PKR. ${acc.balance}`}
              />
            ))}
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
              <Button 
                bg='#FF8D28' 
                color='white' 
                _hover={{ bg: '#E67E22' }} 
                px='24px' 
                onClick={handleAddAccount}>
                ADD NEW ACCOUNT
              </Button>
            </Grid>
          </Box>
        </Box>
        <FactoryInvoices title={"Salaries & Invoices"} data={factoryInvoicesData} />
      </Grid>
      )}
      {isLoading ? (
        <Flex justify="center" align="center" h="300px" w="100%" mt="24px">
          <VStack spacing="16px" textAlign="center">
            <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="#FF8D28" size="xl" />
            <Text color={headingColor}>Loading billing & transactions...</Text>
          </VStack>
        </Flex>
      ) : (
      <Grid templateColumns={{ sm: "1fr", lg: "1.6fr 1.2fr" }}>
        <FactoryBillingInformation title={"Bills & Rents"} data={factoryBillingData} />
        <FactoryTransactions
          title={"Your Factory Transactions"}
          date={"23 - 30 March 2020"}
          newestTransactions={factoryNewestTransactions}
          olderTransactions={factoryOlderTransactions}
        />
      </Grid>
      )}
    </Flex>
  );
}

export default FactoryExpensesCashflow;
