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
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import InvoicesRow from "components/Tables/InvoicesRow";
import React from "react";
import { FiSearch } from "react-icons/fi";

const Invoices = ({ title, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
  const [newInvoice, setNewInvoice] = React.useState({
    date: "",
    code: "",
    price: "",
    format: "PDF"
  });

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  const sortedData = React.useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [data]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    return sortedData.filter(
      (row) =>
        row.date.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        (row.price || "").toLowerCase().includes(q)
    );
  }, [sortedData, query]);

  const handleAddInvoice = () => {
    if (!newInvoice.date || !newInvoice.code || !newInvoice.price) return;
    
    const newInvoiceData = {
      date: newInvoice.date,
      code: newInvoice.code,
      price: newInvoice.price,
      logo: "https://demos.creative-tim.com/vision-ui-dashboard-chakra/static/media/atlassian.0e9c0b4b.svg",
      format: newInvoice.format
    };
    
    data.push(newInvoiceData);
    setNewInvoice({
      date: "",
      code: "",
      price: "",
      format: "PDF"
    });
    onAddClose();
  };

  return (
    <Card
      p='22px'
      my={{ sm: "24px", lg: "0px" }}
      ms={{ sm: "0px", lg: "24px" }}>
      <CardHeader>
        <Flex justify='space-between' align='center' mb='1rem' w='100%'>
          <Text fontSize='lg' color={textColor} fontWeight='bold'>
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
              VIEW ALL
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction='column' w='100%'>
          {data.map((row) => {
            return (
              <InvoicesRow
                date={row.date}
                code={row.code}
                price={row.price}
                logo={row.logo}
                format={row.format}
              />
            );
          })}
        </Flex>
      </CardBody>
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
                placeholder='Search invoices by date, code or amount'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
            <Flex direction='column' w='100%'>
              {filtered.map((row) => (
                <InvoicesRow
                  key={`${row.code}-${row.date}`}
                  date={row.date}
                  code={row.code}
                  price={row.price}
                  logo={row.logo}
                  format={row.format}
                />
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add New Invoice Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size='lg' motionPreset='slideInBottom'>
        <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
        <ModalContent
          bg={navbarGlassBg}
          border={navbarGlassBorder}
          boxShadow={useColorModeValue("0px 7px 23px rgba(0, 0, 0, 0.05)", "none")}
          backdropFilter='blur(21px)'
        >
          <ModalHeader color={textColor}>Add New Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb='24px'>
            <VStack spacing='16px'>
              <FormControl>
                <FormLabel color={textColor}>Date</FormLabel>
                <Input
                  type='date'
                  value={newInvoice.date}
                  onChange={(e) => setNewInvoice({...newInvoice, date: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Invoice Code</FormLabel>
                <Input
                  placeholder='Enter invoice code'
                  value={newInvoice.code}
                  onChange={(e) => setNewInvoice({...newInvoice, code: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Amount</FormLabel>
                <Input
                  placeholder='Enter amount'
                  value={newInvoice.price}
                  onChange={(e) => setNewInvoice({...newInvoice, price: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor}>Format</FormLabel>
                <Select
                  value={newInvoice.format}
                  onChange={(e) => setNewInvoice({...newInvoice, format: e.target.value})}
                  placeholder='Select format'>
                  <option value='PDF'>PDF</option>
                  <option value='DOC'>DOC</option>
                  <option value='XLS'>XLS</option>
                </Select>
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddInvoice}>
                ADD INVOICE
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default Invoices;
