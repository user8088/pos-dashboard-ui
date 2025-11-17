// Chakra imports
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Collapse,
  IconButton,
  Badge,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { ChevronDownIcon, ChevronRightIcon, ViewIcon } from "@chakra-ui/icons";
import { accountService } from "services/accountService";
import { useToast } from "@chakra-ui/react";

const AccountHierarchy = ({ accounts, onAccountClick }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const mutedColor = useColorModeValue("gray.400", "gray.500");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  // Account type colors
  const typeColors = {
    cash: { bg: "green.50", border: "green.200", text: "green.700" },
    bank: { bg: "blue.50", border: "blue.200", text: "blue.700" },
    receivable: { bg: "orange.50", border: "orange.200", text: "orange.700" },
    advance: { bg: "purple.50", border: "purple.200", text: "purple.700" },
    revenue: { bg: "teal.50", border: "teal.200", text: "teal.700" },
    udhaar: { bg: "yellow.50", border: "yellow.200", text: "yellow.700" },
    expense: { bg: "red.50", border: "red.200", text: "red.700" },
    loss: { bg: "gray.50", border: "gray.200", text: "gray.700" },
    equity: { bg: "cyan.50", border: "cyan.200", text: "cyan.700" },
    custom: { bg: "gray.50", border: "gray.200", text: "gray.700" },
  };

  // Organize accounts by category
  const organizedAccounts = React.useMemo(() => {
    const categories = {
      assets: {
        title: "Assets",
        description: "Cash, Bank, and Receivables",
        accounts: [],
        icon: "💰",
      },
      revenue: {
        title: "Revenue",
        description: "Income from sales",
        accounts: [],
        icon: "📈",
      },
      liabilities: {
        title: "Liabilities",
        description: "Customer advances and staff loans",
        accounts: [],
        icon: "📋",
      },
      expenses: {
        title: "Expenses",
        description: "Operational costs and purchases",
        accounts: [],
        icon: "💸",
      },
      equity: {
        title: "Equity & Losses",
        description: "Owner investment and write-offs",
        accounts: [],
        icon: "⚖️",
      },
      custom: {
        title: "Custom Accounts",
        description: "User-created accounts",
        accounts: [],
        icon: "🔧",
      },
    };

    accounts.forEach((account) => {
      const type = (account.type || "custom").toLowerCase();
      if (type === "cash" || type === "bank" || type === "receivable") {
        categories.assets.accounts.push(account);
      } else if (type === "revenue") {
        categories.revenue.accounts.push(account);
      } else if (type === "advance" || type === "udhaar") {
        categories.liabilities.accounts.push(account);
      } else if (type === "expense") {
        categories.expenses.accounts.push(account);
      } else if (type === "equity" || type === "loss") {
        categories.equity.accounts.push(account);
      } else {
        categories.custom.accounts.push(account);
      }
    });

    // Sort accounts within each category by code or name
    Object.keys(categories).forEach((key) => {
      categories[key].accounts.sort((a, b) => {
        const codeA = (a.code || "").toUpperCase();
        const codeB = (b.code || "").toUpperCase();
        if (codeA && codeB) return codeA.localeCompare(codeB);
        return (a.name || "").localeCompare(b.name || "");
      });
    });

    return categories;
  }, [accounts]);

  const formatBalance = (balance) => {
    const num = typeof balance === "string" ? parseFloat(balance.replace(/,/g, "")) : Number(balance);
    const safe = isNaN(num) ? 0 : num;
    return safe.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseBalance = (balance) => {
    if (balance === null || balance === undefined || balance === "") return 0;
    const num = typeof balance === "string" ? parseFloat(balance.replace(/,/g, "")) : Number(balance);
    return isNaN(num) ? 0 : num;
  };

  const AccountCategory = ({ category, accounts: categoryAccounts }) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const [transactions, setTransactions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedAccount, setSelectedAccount] = React.useState(null);

    const handleViewTransactions = async (account) => {
      setSelectedAccount(account);
      setLoading(true);
      onModalOpen();
      try {
        const resp = await accountService.getAccountTransactions(account.id);
        let txns = [];
        if (Array.isArray(resp)) {
          txns = resp;
        } else if (resp?.data) {
          if (Array.isArray(resp.data)) {
            txns = resp.data;
          } else if (Array.isArray(resp.data.data)) {
            txns = resp.data.data;
          } else if (Array.isArray(resp.data.transactions)) {
            txns = resp.data.transactions;
          }
        } else if (resp?.transactions && Array.isArray(resp.transactions)) {
          txns = resp.transactions;
        }
        setTransactions(txns.slice(0, 50)); // Limit to 50 most recent
      } catch (error) {
        console.error("Failed to load transactions:", error);
        toast({
          title: "Error loading transactions",
          description: error.message || "Failed to load transactions",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryAccounts.length === 0) return null;

    // Calculate total balance - sum all balances (including negatives)
    // For Assets: Cash + Bank + Receivables (negative AR reduces total)
    // For other categories: sum all balances
    const totalBalance = categoryAccounts.reduce((sum, acc) => {
      const balance = parseBalance(acc.balance);
      return sum + balance;
    }, 0);
    const typeColor = typeColors[categoryAccounts[0]?.type?.toLowerCase()] || typeColors.custom;

    return (
      <Box mb="20px" w="100%">
        <Flex
          align="center"
          justify="space-between"
          p="12px"
          w="100%"
          bg={typeColor.bg}
          border="1px solid"
          borderColor={typeColor.border}
          borderRadius="8px"
          cursor="pointer"
          onClick={onToggle}
          _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}>
          <HStack spacing="12px" flex="1" minW="0">
            <IconButton
              icon={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
              size="sm"
              variant="ghost"
              aria-label="Toggle"
              flexShrink={0}
            />
            <Text fontSize="lg" fontWeight="bold" color={typeColor.text} noOfLines={1}>
              {category.icon} {category.title}
            </Text>
            <Badge 
              colorScheme={categoryAccounts[0]?.type === "expense" ? "red" : "green"} 
              variant="subtle"
              flexShrink={0}>
              {categoryAccounts.length} {categoryAccounts.length === 1 ? "account" : "accounts"}
            </Badge>
          </HStack>
          <VStack align="end" spacing="2px" flexShrink={0}>
            <Text fontSize="sm" color={labelColor} fontWeight="semibold" whiteSpace="nowrap">
              Total: PKR {formatBalance(totalBalance)}
            </Text>
            {categoryAccounts.some(acc => parseBalance(acc.balance) < 0) && (
              <Text fontSize="xs" color={mutedColor} whiteSpace="nowrap">
                (includes negative balances)
              </Text>
            )}
          </VStack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <Box mt="8px" pl="24px" w="100%">
            <VStack spacing="8px" align="stretch" w="100%">
              {categoryAccounts.map((account) => {
                const accTypeColor = typeColors[account.type?.toLowerCase()] || typeColors.custom;
                const balance = parseBalance(account.balance);
                const isNegative = balance < 0;

                return (
                  <Flex
                    key={account.id}
                    align="center"
                    justify="space-between"
                    p="12px"
                    w="100%"
                    bg={cardBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="6px"
                    _hover={{ shadow: "sm", borderColor: accTypeColor.border }}
                    cursor="pointer"
                    onClick={() => onAccountClick && onAccountClick(account)}>
                    <VStack align="start" spacing="4px" flex="1" minW="0" pr="12px">
                      <HStack spacing="8px" flexWrap="wrap">
                        <Text fontSize="sm" fontWeight="bold" color={textColor} noOfLines={1}>
                          {account.name}
                        </Text>
                        {account.code && (
                          <Badge fontSize="xs" colorScheme="gray" variant="outline" flexShrink={0}>
                            {account.code}
                          </Badge>
                        )}
                        {account.is_active === false && (
                          <Badge fontSize="xs" colorScheme="red" variant="subtle" flexShrink={0}>
                            Inactive
                          </Badge>
                        )}
                      </HStack>
                      {account.description && (
                        <Text fontSize="xs" color={mutedColor} noOfLines={1} w="100%">
                          {account.description}
                        </Text>
                      )}
                    </VStack>
                    <HStack spacing="12px" flexShrink={0}>
                      <VStack align="end" spacing="2px">
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color={isNegative ? "red.500" : accTypeColor.text}
                          whiteSpace="nowrap">
                          PKR {formatBalance(account.balance)}
                        </Text>
                        <Text fontSize="xs" color={mutedColor} textTransform="capitalize" whiteSpace="nowrap">
                          {account.type || "custom"}
                        </Text>
                      </VStack>
                      <IconButton
                        icon={<ViewIcon />}
                        size="sm"
                        variant="ghost"
                        aria-label="View transactions"
                        flexShrink={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTransactions(account);
                        }}
                      />
                    </HStack>
                  </Flex>
                );
              })}
            </VStack>
          </Box>
        </Collapse>

        {/* Transactions Modal */}
        <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
          <ModalOverlay />
          <ModalContent bg={cardBg}>
            <ModalHeader color={textColor}>
              Transactions - {selectedAccount?.name} ({selectedAccount?.code})
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb="24px">
              {loading ? (
                <Flex justify="center" py="40px">
                  <Text color={mutedColor}>Loading transactions...</Text>
                </Flex>
              ) : transactions.length === 0 ? (
                <Text color={mutedColor} py="20px" textAlign="center">
                  No transactions found
                </Text>
              ) : (
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Date</Th>
                        <Th>Type</Th>
                        <Th>Description</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Balance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transactions.map((txn) => {
                        const isCredit = txn.type === "credit";
                        const amount = parseFloat(txn.amount || 0);
                        return (
                          <Tr key={txn.id}>
                            <Td fontSize="xs">
                              {txn.transaction_date
                                ? new Date(txn.transaction_date).toLocaleDateString()
                                : "-"}
                            </Td>
                            <Td>
                              <Badge colorScheme={isCredit ? "green" : "red"} variant="subtle">
                                {isCredit ? "Credit" : "Debit"}
                              </Badge>
                            </Td>
                            <Td fontSize="xs" maxW="200px" isTruncated>
                              {txn.description || "-"}
                            </Td>
                            <Td isNumeric fontSize="sm" fontWeight="semibold" color={isCredit ? "green.500" : "red.500"}>
                              {isCredit ? "+" : "-"}PKR {formatBalance(amount)}
                            </Td>
                            <Td isNumeric fontSize="xs" color={mutedColor}>
                              PKR {formatBalance(txn.balance_after || 0)}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  };

  return (
    <Card>
      <CardHeader>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Account Hierarchy
        </Text>
        <Text fontSize="sm" color={labelColor} mt="4px">
          All accounts organized by category
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing="0" align="stretch" w="100%">
          <AccountCategory category={organizedAccounts.assets} accounts={organizedAccounts.assets.accounts} />
          <AccountCategory category={organizedAccounts.revenue} accounts={organizedAccounts.revenue.accounts} />
          <AccountCategory category={organizedAccounts.liabilities} accounts={organizedAccounts.liabilities.accounts} />
          <AccountCategory category={organizedAccounts.expenses} accounts={organizedAccounts.expenses.accounts} />
          <AccountCategory category={organizedAccounts.equity} accounts={organizedAccounts.equity.accounts} />
          {organizedAccounts.custom.accounts.length > 0 && (
            <AccountCategory category={organizedAccounts.custom} accounts={organizedAccounts.custom.accounts} />
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default AccountHierarchy;

