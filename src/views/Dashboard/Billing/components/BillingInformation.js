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
import { useToast, Textarea } from "@chakra-ui/react";
import { billingService } from "services/billingService";
import { FiSearch } from "react-icons/fi";

const BillingInformation = ({ title, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [query, setQuery] = React.useState("");
  const [newBill, setNewBill] = React.useState({
    tag: "fuel",
    amount: "",
    bill_date: new Date().toISOString().slice(0,10),
    note: "",
    udhaar_id: "",
    type: "BILL"
  });
  const [submitting, setSubmitting] = React.useState(false);
  const toast = useToast();

  const navbarGlassBg = useColorModeValue(
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.8) 110.84%)",
    "linear-gradient(112.83deg, rgba(255, 255, 255, 0.21) 0%, rgba(255, 255, 255, 0) 110.84%)"
  );
  const navbarGlassBorder = useColorModeValue(
    "1.5px solid #FFFFFF",
    "1.5px solid rgba(255, 255, 255, 0.31)"
  );

  const filteredData = React.useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.company.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.number.toLowerCase().includes(q)
    );
  }, [data, query]);

  const handleAddBill = async () => {
    if (!newBill.tag || !newBill.amount || !newBill.bill_date) {
      toast({ title: 'Validation error', description: 'Tag, amount and date are required', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        tag: String(newBill.tag),
        amount: Number(newBill.amount),
        bill_date: newBill.bill_date,
        note: newBill.note || undefined,
        udhaar_id: newBill.udhaar_id ? Number(newBill.udhaar_id) : undefined,
      };
      const resp = await billingService.createBill(payload);
      toast({ title: resp?.message || 'Bill recorded successfully', status: 'success', duration: 3000, isClosable: true });
      setNewBill({ tag: 'fuel', amount: "", bill_date: new Date().toISOString().slice(0,10), note: "", udhaar_id: "", type: 'BILL' });
      onAddClose();
    } catch (e) {
      toast({ title: 'Failed to record bill', description: e.message || 'Please try again', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
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
            {data.length === 0 ? (
              <Text color='gray.500' fontSize='sm' p='12px'>No bills or rents yet. Use Add New to record your first bill.</Text>
            ) : (
              data.slice(0, 3).map((row, index) => (
                <BillingRow
                  key={index}
                  name={row.name}
                  company={row.company}
                  email={row.email}
                  number={row.number}
                />
              ))
            )}
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
              {filteredData.length === 0 ? (
                <Text color='gray.500' fontSize='sm' p='12px' textAlign='center'>No matching bills.</Text>
              ) : (
                filteredData.map((row, index) => (
                  <BillingRow
                    key={`${row.name}-${index}`}
                    name={row.name}
                    company={row.company}
                    email={row.email}
                    number={row.number}
                  />
                ))
              )}
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
                <FormLabel color={textColor}>Tag</FormLabel>
                <Select value={newBill.tag} onChange={(e) => setNewBill({ ...newBill, tag: e.target.value })}>
                  <option value='fuel'>Fuel</option>
                  <option value='rent'>Rent</option>
                  <option value='utilities'>Utilities</option>
                  <option value='maintenance'>Maintenance</option>
                  <option value='other'>Other</option>
                </Select>
              </FormControl>

              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap='12px' w='100%'>
                <FormControl>
                  <FormLabel color={textColor}>Amount</FormLabel>
                  <Input type='number' step='0.01' placeholder='Enter amount' value={newBill.amount} onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Bill Date</FormLabel>
                  <Input type='date' value={newBill.bill_date} onChange={(e) => setNewBill({ ...newBill, bill_date: e.target.value })} />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel color={textColor}>Note (Optional)</FormLabel>
                <Textarea placeholder='Add an optional note' value={newBill.note} onChange={(e) => setNewBill({ ...newBill, note: e.target.value })} />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Link to Staff Loan (Udhaar ID, optional)</FormLabel>
                <Input placeholder='Enter Udhaar ID (optional)' value={newBill.udhaar_id} onChange={(e) => setNewBill({ ...newBill, udhaar_id: e.target.value })} />
              </FormControl>
              
              <Button
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                w='100%'
                onClick={handleAddBill}
                isLoading={submitting}>
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
