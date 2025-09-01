// Chakra imports
import {
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Box,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TransactionRow from "components/Tables/TransactionRow";
import React from "react";
import { FaRegCalendarAlt, FaPlus } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const Transactions = ({
  title,
  date,
  newestTransactions,
  olderTransactions,
}) => {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [newTransaction, setNewTransaction] = React.useState({
    name: "",
    date: "",
    price: "",
    type: "INCOME"
  });

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  // Combine all transactions for filtering
  const allTransactions = React.useMemo(() => [
    ...newestTransactions,
    ...olderTransactions
  ], [newestTransactions, olderTransactions]);

  // Filter transactions by date range and search query
  const filteredTransactions = React.useMemo(() => {
    let filtered = allTransactions;
    
    if (startDate && endDate) {
      filtered = filtered.filter(row => {
        const rowDate = new Date(row.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return rowDate >= start && rowDate <= end;
      });
    }
    
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(row =>
        row.name.toLowerCase().includes(q) ||
        row.date.toLowerCase().includes(q) ||
        (row.price || "").toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [allTransactions, startDate, endDate, query]);

  const handleAddTransaction = () => {
    if (!newTransaction.name || !newTransaction.date || !newTransaction.price) return;
    
    const newTransactionData = {
      name: newTransaction.name,
      date: newTransaction.date,
      price: newTransaction.price,
      logo: ""
    };
    
    // Add to newest transactions (you might want to add to a proper data source)
    newestTransactions.push(newTransactionData);
    setNewTransaction({
      name: "",
      date: "",
      price: "",
      type: "INCOME"
    });
    onAddClose();
  };

  return (
    <Card my='24px' ms={{ lg: "24px" }}>
      <CardHeader mb='12px'>
        <Flex direction='column' w='100%'>
          <Flex
            direction={{ sm: "column", lg: "row" }}
            justify={{ sm: "center", lg: "space-between" }}
            align={{ sm: "center" }}
            w='100%'
            my={{ md: "12px" }}>
            <Text
              color={textColor}
              fontSize={{ sm: "lg", md: "xl", lg: "lg" }}
              fontWeight='bold'>
              {title}
            </Text>
            <HStack spacing='12px'>
              <Popover placement="bottom-start">
                <PopoverTrigger>
                  <Button
                    leftIcon={<FaRegCalendarAlt />}
                    variant='outline'
                    size='sm'
                    colorScheme='teal'
                    borderColor='#FF8D28'
                    color='#FF8D28'>
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent p='16px'>
                  <PopoverArrow />
                  <PopoverBody>
                    <VStack spacing='12px'>
                      <FormControl>
                        <FormLabel fontSize='sm'>Start Date</FormLabel>
                        <Input
                          type='date'
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          size='sm'
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize='sm'>End Date</FormLabel>
                        <Input
                          type='date'
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          size='sm'
                        />
                      </FormControl>
                      <Button
                        size='sm'
                        colorScheme='teal'
                        bg='#FF8D28'
                        color='white'
                        _hover={{ bg: '#E67E22' }}
                        onClick={() => setStartDate("") || setEndDate("")}>
                        Clear Filter
                      </Button>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Button
                colorScheme='teal'
                borderColor='#FF8D28'
                color='#FF8D28'
                variant='outline'
                fontSize='xs'
                p='8px 24px'
                leftIcon={<FaPlus />}
                onClick={onAddOpen}>
                ADD NEW
              </Button>
              <Button
                colorScheme='teal'
                borderColor='#FF8D28'
                color='#FF8D28'
                variant='outline'
                fontSize='xs'
                p='8px 24px'
                onClick={onOpen}>
                VIEW ALL
              </Button>
            </HStack>
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction='column' w='100%'>
          {/* Show filtered transactions if date range is set, otherwise show original grouped view */}
          {(startDate && endDate) ? (
            <>
              <Text
                color='gray.400'
                fontSize={{ sm: "sm", md: "md" }}
                fontWeight='semibold'
                my='12px'>
                FILTERED TRANSACTIONS ({filteredTransactions.length})
              </Text>
              {filteredTransactions.map((row, index) => (
                <TransactionRow
                  key={`filtered-${index}`}
                  name={row.name}
                  logo={row.logo}
                  date={row.date}
                  price={row.price}
                />
              ))}
            </>
          ) : (
            <>
              <Text
                color='gray.400'
                fontSize={{ sm: "sm", md: "md" }}
                fontWeight='semibold'
                my='12px'>
                NEWEST
              </Text>
              {newestTransactions.map((row, index) => (
                <TransactionRow
                  key={`newest-${index}`}
                  name={row.name}
                  logo={row.logo}
                  date={row.date}
                  price={row.price}
                />
              ))}
              <Text
                color='gray.400'
                fontSize={{ sm: "sm", md: "md" }}
                fontWeight='semibold'
                my='12px'>
                OLDER
              </Text>
              {olderTransactions.map((row, index) => (
                <TransactionRow
                  key={`older-${index}`}
                  name={row.name}
                  logo={row.logo}
                  date={row.date}
                  price={row.price}
                />
              ))}
            </>
          )}
        </Flex>
      </CardBody>

      {/* Glassy Modal for View All */}
      <Modal isOpen={isOpen} onClose={onClose} size='4xl' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb='16px'>
              <InputLeftElement pointerEvents='none'>
                <FiSearch color={useColorModeValue("#718096", "#A0AEC0")} />
              </InputLeftElement>
              <Input
                placeholder='Search transactions by name, date or amount'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filteredTransactions.map((row, index) => (
                <TransactionRow
                  key={`modal-${index}`}
                  name={row.name}
                  logo={row.logo}
                  date={row.date}
                  price={row.price}
                />
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add New Transaction Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Add New Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl>
                <FormLabel color={textColor}>Transaction Name</FormLabel>
                <Input
                  placeholder='Enter transaction name'
                  value={newTransaction.name}
                  onChange={(e) => setNewTransaction({...newTransaction, name: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Date</FormLabel>
                <Input
                  type='date'
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Amount</FormLabel>
                <Input
                  placeholder='Enter amount'
                  value={newTransaction.price}
                  onChange={(e) => setNewTransaction({...newTransaction, price: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Type</FormLabel>
                <Select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                  placeholder='Select type'>
                  <option value='INCOME'>Income</option>
                  <option value='EXPENSE'>Expense</option>
                  <option value='TRANSFER'>Transfer</option>
                </Select>
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddTransaction}>
                ADD TRANSACTION
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default Transactions;
