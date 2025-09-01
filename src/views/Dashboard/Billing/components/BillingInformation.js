// Chakra imports
import {
  Button,
  Flex,
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
  Grid,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import BillingRow from "components/Tables/BillingRow";
import React from "react";
import { FiSearch } from "react-icons/fi";

const BillingInformation = ({ title, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
  const [newBill, setNewBill] = React.useState({
    name: "",
    company: "",
    email: "",
    number: "",
    type: "BILL"
  });

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  // Extended data with more bills and rents
  const allData = React.useMemo(() => [
    ...data,
    {
      name: "BILL #123243",
      company: "Viking Burrito",
      email: "oliver@burrito.com",
      number: "PKR. 50,000",
    },
    {
      name: "BILL #123244",
      company: "Stone Tech Zone",
      email: "lucas@stone-tech.com",
      number: "PKR. 35,000",
    },
    {
      name: "RENT #123245",
      company: "Fiber Notion",
      email: "ethan@fiber.com",
      number: "PKR. 80,000",
    },
    {
      name: "BILL #123246",
      company: "Creative Design Co",
      email: "sarah@creative.com",
      number: "PKR. 25,000",
    },
    {
      name: "RENT #123247",
      company: "Tech Solutions Ltd",
      email: "mike@tech.com",
      number: "PKR. 90,000",
    },
  ], [data]);

  const filteredData = React.useMemo(() => {
    const q = query.toLowerCase();
    return allData.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.company.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.number.toLowerCase().includes(q)
    );
  }, [allData, query]);

  const handleAddBill = () => {
    if (!newBill.name || !newBill.company || !newBill.email || !newBill.number) return;
    
    const billNumber = newBill.type === "BILL" ? 
      `BILL #${Math.floor(Math.random() * 900000) + 100000}` : 
      `RENT #${Math.floor(Math.random() * 900000) + 100000}`;
    
    const newBillData = {
      name: billNumber,
      company: newBill.company,
      email: newBill.email,
      number: `PKR. ${newBill.number}`,
    };
    
    allData.push(newBillData);
    setNewBill({
      name: "",
      company: "",
      email: "",
      number: "",
      type: "BILL"
    });
    onAddClose();
  };

  return (
    <Card my={{ lg: "24px" }} me={{ lg: "24px" }}>
      <Flex direction='column'>
        <CardHeader py='12px'>
          <Flex justify='space-between' align='center' w='100%'>
            <Text color={textColor} fontSize='lg' fontWeight='bold'>
              {title}
            </Text>
            <HStack spacing='12px'>
              <Button
                colorScheme='teal'
                borderColor='#FF8D28'
                color='#FF8D28'
                variant='outline'
                fontSize='xs'
                p='8px 24px'
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
                VIEW MORE
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            {data.slice(0, 3).map((row, index) => {
              return (
                <BillingRow
                  key={index}
                  name={row.name}
                  company={row.company}
                  email={row.email}
                  number={row.number}
                />
              );
            })}
          </Flex>
        </CardBody>
      </Flex>

      {/* Glassy Modal */}
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
                placeholder='Search bills and rents by name, company, email or amount'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filteredData.map((row, index) => (
                <BillingRow
                  key={`${row.name}-${index}`}
                  name={row.name}
                  company={row.company}
                  email={row.email}
                  number={row.number}
                />
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add New Bill Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Add New Bill/Rent</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl>
                <FormLabel color={textColor}>Type</FormLabel>
                <Select
                  value={newBill.type}
                  onChange={(e) => setNewBill({...newBill, type: e.target.value})}
                  placeholder='Select type'>
                  <option value='BILL'>Bill</option>
                  <option value='RENT'>Rent</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Company Name</FormLabel>
                <Input
                  placeholder='Enter company name'
                  value={newBill.company}
                  onChange={(e) => setNewBill({...newBill, company: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Email Address</FormLabel>
                <Input
                  placeholder='Enter email address'
                  value={newBill.email}
                  onChange={(e) => setNewBill({...newBill, email: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Amount</FormLabel>
                <Input
                  placeholder='Enter amount'
                  value={newBill.number}
                  onChange={(e) => setNewBill({...newBill, number: e.target.value})}
                />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddBill}>
                ADD BILL/RENT
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default BillingInformation;
