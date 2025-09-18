// Chakra imports
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TimelineRow from "components/Tables/TimelineRow";
import React from "react";

const OrdersOverview = ({ title, amount, data, isLoading }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const [transactionData, setTransactionData] = React.useState([]);
  const [transactionLoading, setTransactionLoading] = React.useState(true);

  // Fetch recent transactions
  const fetchTransactions = async () => {
    try {
      setTransactionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://server.mughalsupplier.com/api'}/core/transactions?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const transactions = await response.json();
        // Transform transaction data to match the expected format
        const transformedData = transactions.slice(0, 5).map((transaction) => ({
          logo: "assets/img/avatars/placeholder.png",
          title: transaction.title,
          date: new Date(transaction.transacted_at).toLocaleDateString(),
          color: transaction.type === 'inflow' ? 'green.400' : 'red.400'
        }));
        setTransactionData(transformedData);
      } else {
        setTransactionData([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactionData([]);
    } finally {
      setTransactionLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Card maxH='100%'>
      <CardHeader p='22px 0px 35px 14px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
          {/* <Text fontSize='sm' color='gray.400' fontWeight='normal'>
            <Text fontWeight='bold' as='span' color='#FF8D28'>
              {`${amount}%`}
            </Text>{" "}
            this month.
          </Text> */}
        </Flex>
      </CardHeader>
      <CardBody ps='20px' pe='0px' mb='31px' position='relative'>
        <Flex direction='column'>
          {transactionLoading ? (
            <Text color="gray.500" fontSize="sm" textAlign="center" py="20px">
              Loading transactions...
            </Text>
          ) : transactionData.length > 0 ? (
            transactionData.map((row, index, arr) => {
              return (
                <TimelineRow
                  key={row.title}
                  logo={row.logo}
                  title={row.title}
                  date={row.date}
                  color={row.color}
                  index={index}
                  arrLength={arr.length}
                />
              );
            })
          ) : (
            <Text color="gray.500" fontSize="sm" textAlign="center" py="20px">
              No recent transactions
            </Text>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default OrdersOverview;
