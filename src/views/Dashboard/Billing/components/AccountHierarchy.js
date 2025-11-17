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
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { ChevronDownIcon, ChevronRightIcon, ViewIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { accountService } from "services/accountService";
import { useToast } from "@chakra-ui/react";

const AccountHierarchy = ({ accounts, onAccountClick, accountToView, onAccountViewed }) => {
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

  // Shared state for external modal trigger
  const { isOpen: isModalOpenShared, onOpen: onModalOpenShared, onClose: onModalCloseShared } = useDisclosure();
  const [transactionsShared, setTransactionsShared] = React.useState([]);
  const [loadingShared, setLoadingShared] = React.useState(false);
  const [selectedAccountShared, setSelectedAccountShared] = React.useState(null);
  const [searchQueryShared, setSearchQueryShared] = React.useState("");
  const [activeTabShared, setActiveTabShared] = React.useState(0);

  const handleViewTransactionsShared = React.useCallback(async (account) => {
    setSelectedAccountShared(account);
    setLoadingShared(true);
    setSearchQueryShared("");
    setActiveTabShared(0);
    onModalOpenShared();
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
      // Sort by date descending (most recent first)
      txns.sort((a, b) => {
        const dateA = new Date(a.transaction_date || a.created_at || 0);
        const dateB = new Date(b.transaction_date || b.created_at || 0);
        return dateB - dateA;
      });
      setTransactionsShared(txns);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast({
        title: "Error loading transactions",
        description: error.message || "Failed to load transactions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setTransactionsShared([]);
    } finally {
      setLoadingShared(false);
    }
  }, [onModalOpenShared, toast]);

  // Handle external account view trigger
  React.useEffect(() => {
    if (accountToView && accountToView.id) {
      // Find the account in the accounts list
      const account = accounts.find(acc => acc.id === accountToView.id);
      if (account) {
        handleViewTransactionsShared(account);
        if (onAccountViewed) {
          onAccountViewed();
        }
      }
    }
  }, [accountToView, accounts, handleViewTransactionsShared, onAccountViewed]);


  const AccountCategory = ({ category, accounts: categoryAccounts }) => {
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const [transactions, setTransactions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedAccount, setSelectedAccount] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeTab, setActiveTab] = React.useState(0);
    const sectionBg = useColorModeValue("gray.50", "gray.700");
    const itemBg = useColorModeValue("white", "gray.800");
    const itemBorder = useColorModeValue("gray.200", "gray.600");
    
    // Get all accounts for hierarchical transaction display
    const allAccountsForCategory = React.useMemo(() => {
      return accounts;
    }, [accounts]);

    const handleViewTransactions = async (account) => {
      setSelectedAccount(account);
      setLoading(true);
      setSearchQuery("");
      setActiveTab(0);
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
        // Sort by date descending (most recent first)
        txns.sort((a, b) => {
          const dateA = new Date(a.transaction_date || a.created_at || 0);
          const dateB = new Date(b.transaction_date || b.created_at || 0);
          return dateB - dateA;
        });
        setTransactions(txns);
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

    // Group hierarchical transactions together
    const groupedTransactions = React.useMemo(() => {
      // Group transactions by description + date (hierarchical transactions share these)
      const groups = new Map();
      const processedIds = new Set();

      transactions.forEach((txn) => {
        if (processedIds.has(txn.id)) return;

        const txnDate = txn.transaction_date || txn.created_at;
        const dateKey = txnDate ? new Date(txnDate).toISOString().split('T')[0] : '';
        const groupKey = `${txn.description || ''}_${dateKey}`;

        // Check if this might be a hierarchical transaction
        // Look for other transactions with same description and date
        const relatedTxns = transactions.filter(t => {
          if (t.id === txn.id || processedIds.has(t.id)) return false;
          const tDate = t.transaction_date || t.created_at;
          const tDateKey = tDate ? new Date(tDate).toISOString().split('T')[0] : '';
          return (t.description || '') === (txn.description || '') && tDateKey === dateKey;
        });

        // If we found related transactions, it's hierarchical
        if (relatedTxns.length > 0) {
          const allTxns = [txn, ...relatedTxns];
          allTxns.forEach(t => processedIds.add(t.id));
          
          groups.set(txn.id, {
            id: txn.id,
            isHierarchical: true,
            transactions: allTxns,
            description: txn.description,
            transaction_date: txnDate,
            type: txn.type, // All should be same type (inflow/outflow)
            totalAmount: allTxns.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
            accountIds: allTxns.map(t => t.account_id).filter(Boolean),
          });
        } else {
          processedIds.add(txn.id);
          groups.set(txn.id, {
            id: txn.id,
            isHierarchical: false,
            transactions: [txn],
            transaction: txn,
          });
        }
      });

      return Array.from(groups.values());
    }, [transactions]);

    // Filter transactions based on search and tab
    const filteredTransactions = React.useMemo(() => {
      let filtered = groupedTransactions;

      // Filter by tab (All, Revenue, Expenses)
      if (activeTab === 1) {
        // Revenue - only credits
        filtered = filtered.filter(group => {
          if (group.isHierarchical) {
            return group.transactions.some(t => t.type === "credit");
          }
          return group.transaction?.type === "credit";
        });
      } else if (activeTab === 2) {
        // Expenses - only debits
        filtered = filtered.filter(group => {
          if (group.isHierarchical) {
            return group.transactions.some(t => t.type === "debit");
          }
          return group.transaction?.type === "debit";
        });
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(group => {
          if (group.isHierarchical) {
            const description = (group.description || "").toLowerCase();
            const totalAmount = String(group.totalAmount || "");
            const date = group.transaction_date 
              ? new Date(group.transaction_date).toLocaleDateString().toLowerCase()
              : "";
            return description.includes(query) || totalAmount.includes(query) || date.includes(query);
          } else {
            const txn = group.transaction;
            const description = (txn.description || "").toLowerCase();
            const amount = String(txn.amount || "");
            const date = txn.transaction_date 
              ? new Date(txn.transaction_date).toLocaleDateString().toLowerCase()
              : "";
            return description.includes(query) || amount.includes(query) || date.includes(query);
          }
        });
      }

      return filtered;
    }, [groupedTransactions, searchQuery, activeTab]);

    // Calculate summary stats
    const summaryStats = React.useMemo(() => {
      let totalRevenue = 0;
      let totalExpenses = 0;

      filteredTransactions.forEach(group => {
        if (group.isHierarchical) {
          group.transactions.forEach(txn => {
            if (txn.type === "credit") {
              totalRevenue += parseFloat(txn.amount || 0);
            } else if (txn.type === "debit") {
              totalExpenses += parseFloat(txn.amount || 0);
            }
          });
        } else {
          const txn = group.transaction;
          if (txn?.type === "credit") {
            totalRevenue += parseFloat(txn.amount || 0);
          } else if (txn?.type === "debit") {
            totalExpenses += parseFloat(txn.amount || 0);
          }
        }
      });

      return {
        totalRevenue,
        totalExpenses,
        netAmount: totalRevenue - totalExpenses,
        transactionCount: filteredTransactions.length,
      };
    }, [filteredTransactions]);

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
                    onClick={() => handleViewTransactions(account)}>
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

        {/* Enhanced Transactions Modal */}
        <Modal isOpen={isModalOpen} onClose={onModalClose} size="6xl" scrollBehavior="inside">
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <ModalContent bg={cardBg} maxH="90vh">
            <ModalHeader color={textColor} pb="16px">
              <VStack align="start" spacing="8px">
                <Text fontSize="xl" fontWeight="bold">
                  {selectedAccount?.name}
                </Text>
                <HStack spacing="12px" fontSize="sm" color={labelColor}>
                  {selectedAccount?.code && (
                    <Badge colorScheme="blue" variant="outline">
                      {selectedAccount.code}
                    </Badge>
                  )}
                  <Text>Balance: PKR {formatBalance(selectedAccount?.balance || 0)}</Text>
                </HStack>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb="24px" px="24px">
              {loading ? (
                <Flex justify="center" align="center" py="60px">
                  <VStack spacing="16px">
                    <Spinner size="xl" color="#FF8D28" thickness="4px" />
                    <Text color={mutedColor}>Loading transactions...</Text>
                  </VStack>
                </Flex>
              ) : (
                <VStack align="stretch" spacing="20px">
                  {/* Summary Stats */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing="16px">
                    <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="green.400">
                      <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                        Total Revenue
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.500">
                        PKR {formatBalance(summaryStats.totalRevenue)}
                      </Text>
                    </Box>
                    <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="red.400">
                      <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                        Total Expenses
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.500">
                        PKR {formatBalance(summaryStats.totalExpenses)}
                      </Text>
                    </Box>
                    <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="blue.400">
                      <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                        Net Amount
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={summaryStats.netAmount >= 0 ? "green.500" : "red.500"}>
                        PKR {formatBalance(summaryStats.netAmount)}
                      </Text>
                    </Box>
                    <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="purple.400">
                      <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                        Transactions
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color={textColor}>
                        {summaryStats.transactionCount}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {/* Search and Filters */}
                  <Box>
                    <InputGroup mb="16px">
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="Search transactions by description, amount, or date..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        bg={itemBg}
                        borderColor={itemBorder}
                      />
                    </InputGroup>
                    <Tabs index={activeTab} onChange={setActiveTab} colorScheme="orange">
                      <TabList>
                        <Tab>All</Tab>
                        <Tab>Revenue</Tab>
                        <Tab>Expenses</Tab>
                      </TabList>
                    </Tabs>
                  </Box>

                  {/* Transaction List */}
                  {filteredTransactions.length === 0 ? (
                    <Box py="60px" textAlign="center">
                      <Text color={mutedColor} fontSize="md">
                        {searchQuery ? "No transactions match your search" : "No transactions found"}
                      </Text>
                    </Box>
                  ) : (
                    <VStack align="stretch" spacing="12px" maxH="500px" overflowY="auto" pr="8px">
                      {filteredTransactions.map((group) => {
                        // Handle hierarchical transactions
                        if (group.isHierarchical) {
                          const isCredit = group.type === "credit";
                          const txnDate = group.transaction_date;
                          const formattedDate = txnDate
                            ? new Date(txnDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-";
                          const formattedTime = txnDate
                            ? new Date(txnDate).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "";

                          return (
                            <Box
                              key={group.id}
                              p="20px"
                              bg={itemBg}
                              borderRadius="12px"
                              border="1px solid"
                              borderColor={itemBorder}
                              borderLeftWidth="4px"
                              borderLeftColor={isCredit ? "green.400" : "red.400"}
                              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                              transition="all 0.2s">
                              <VStack align="stretch" spacing="12px">
                                {/* Header */}
                                <Flex justify="space-between" align="start" flexWrap="wrap" gap="12px">
                                  <VStack align="start" spacing="4px" flex="1" minW="200px">
                                    <HStack spacing="8px">
                                      <Badge
                                        colorScheme={isCredit ? "green" : "red"}
                                        fontSize="xs"
                                        px="8px"
                                        py="2px"
                                        borderRadius="full">
                                        {isCredit ? "Credit" : "Debit"}
                                      </Badge>
                                      <Badge
                                        colorScheme="blue"
                                        fontSize="xs"
                                        px="8px"
                                        py="2px"
                                        borderRadius="full">
                                        Hierarchical
                                      </Badge>
                                      {isCredit ? (
                                        <ArrowUpIcon color="green.500" boxSize="14px" />
                                      ) : (
                                        <ArrowDownIcon color="red.500" boxSize="14px" />
                                      )}
                                    </HStack>
                                    <Text fontSize="sm" fontWeight="semibold" color={textColor} noOfLines={2}>
                                      {group.description || "Transaction"}
                                    </Text>
                                    <HStack spacing="8px" fontSize="xs" color={mutedColor}>
                                      <Text>{formattedDate}</Text>
                                      {formattedTime && (
                                        <>
                                          <Text>•</Text>
                                          <Text>{formattedTime}</Text>
                                        </>
                                      )}
                                      <Text>•</Text>
                                      <Text>{group.transactions.length} account{group.transactions.length > 1 ? 's' : ''}</Text>
                                    </HStack>
                                  </VStack>
                                  <VStack align="end" spacing="4px" flexShrink={0}>
                                    <Text
                                      fontSize="xl"
                                      fontWeight="bold"
                                      color={isCredit ? "green.500" : "red.500"}>
                                      {isCredit ? "+" : "-"}PKR {formatBalance(group.totalAmount)}
                                    </Text>
                                    <Text fontSize="xs" color={mutedColor}>
                                      Total Amount
                                    </Text>
                                  </VStack>
                                </Flex>

                                {/* Hierarchical Transaction Breakdown */}
                                <Box pt="12px" borderTopWidth="1px" borderColor={itemBorder}>
                                  <Text fontSize="xs" color={labelColor} mb="8px" fontWeight="medium">
                                    Account Distribution
                                  </Text>
                                  <VStack align="stretch" spacing="6px">
                                    {group.transactions.map((txn, idx) => {
                                      const txnAmount = parseFloat(txn.amount || 0);
                                      // Try to find account name from accounts list
                                      const accountName = allAccountsForCategory.find(acc => acc.id === txn.account_id)?.name || `Account #${txn.account_id}`;
                                      const accountCode = allAccountsForCategory.find(acc => acc.id === txn.account_id)?.code || '';
                                      return (
                                        <HStack
                                          key={txn.id || idx}
                                          justify="space-between"
                                          p="8px"
                                          bg={sectionBg}
                                          borderRadius="6px"
                                          fontSize="sm">
                                          <VStack align="start" spacing="2px">
                                            <Text color={textColor} fontWeight="medium">
                                              {accountName}
                                            </Text>
                                            {accountCode && (
                                              <Text color={mutedColor} fontSize="xs">
                                                {accountCode}
                                              </Text>
                                            )}
                                          </VStack>
                                          <VStack align="end" spacing="2px">
                                            <Text color={textColor} fontWeight="semibold">
                                              PKR {formatBalance(txnAmount)}
                                            </Text>
                                            <Text color={mutedColor} fontSize="xs">
                                              Balance: PKR {formatBalance(txn.balance_after || 0)}
                                            </Text>
                                          </VStack>
                                        </HStack>
                                      );
                                    })}
                                  </VStack>
                                </Box>
                              </VStack>
                            </Box>
                          );
                        }

                        // Handle regular (non-hierarchical) transactions
                        const txn = group.transaction;
                        const isCredit = txn.type === "credit";
                        const amount = parseFloat(txn.amount || 0);
                        const txnDate = txn.transaction_date || txn.created_at;
                        const formattedDate = txnDate
                          ? new Date(txnDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "-";
                        const formattedTime = txnDate
                          ? new Date(txnDate).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";

                        // Parse payment breakdown if available
                        let paymentBreakdown = [];
                        if (txn.payment_breakdown && Array.isArray(txn.payment_breakdown)) {
                          paymentBreakdown = txn.payment_breakdown;
                        } else if (txn.payment_method) {
                          paymentBreakdown = [{ payment_method: txn.payment_method, amount: amount }];
                        }

                        return (
                          <Box
                            key={txn.id}
                            p="20px"
                            bg={itemBg}
                            borderRadius="12px"
                            border="1px solid"
                            borderColor={itemBorder}
                            borderLeftWidth="4px"
                            borderLeftColor={isCredit ? "green.400" : "red.400"}
                            _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                            transition="all 0.2s">
                            <VStack align="stretch" spacing="12px">
                              {/* Header */}
                              <Flex justify="space-between" align="start" flexWrap="wrap" gap="12px">
                                <VStack align="start" spacing="4px" flex="1" minW="200px">
                                  <HStack spacing="8px">
                                    <Badge
                                      colorScheme={isCredit ? "green" : "red"}
                                      fontSize="xs"
                                      px="8px"
                                      py="2px"
                                      borderRadius="full">
                                      {isCredit ? "Credit" : "Debit"}
                                    </Badge>
                                    {isCredit ? (
                                      <ArrowUpIcon color="green.500" boxSize="14px" />
                                    ) : (
                                      <ArrowDownIcon color="red.500" boxSize="14px" />
                                    )}
                                  </HStack>
                                  <Text fontSize="sm" fontWeight="semibold" color={textColor} noOfLines={2}>
                                    {txn.description || "Transaction"}
                                  </Text>
                                  <HStack spacing="8px" fontSize="xs" color={mutedColor}>
                                    <Text>{formattedDate}</Text>
                                    {formattedTime && (
                                      <>
                                        <Text>•</Text>
                                        <Text>{formattedTime}</Text>
                                      </>
                                    )}
                                  </HStack>
                                </VStack>
                                <VStack align="end" spacing="4px" flexShrink={0}>
                                  <Text
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color={isCredit ? "green.500" : "red.500"}>
                                    {isCredit ? "+" : "-"}PKR {formatBalance(amount)}
                                  </Text>
                                  <Text fontSize="xs" color={mutedColor}>
                                    Balance: PKR {formatBalance(txn.balance_after || 0)}
                                  </Text>
                                </VStack>
                              </Flex>

                              {/* Payment Breakdown */}
                              {paymentBreakdown.length > 0 && (
                                <Box pt="12px" borderTopWidth="1px" borderColor={itemBorder}>
                                  <Text fontSize="xs" color={labelColor} mb="8px" fontWeight="medium">
                                    Payment Breakdown
                                  </Text>
                                  <VStack align="stretch" spacing="6px">
                                    {paymentBreakdown.map((payment, idx) => {
                                      const paymentMethod = payment.payment_method || payment.method || "N/A";
                                      const paymentAmount = parseFloat(payment.amount || 0);
                                      return (
                                        <HStack
                                          key={idx}
                                          justify="space-between"
                                          p="8px"
                                          bg={sectionBg}
                                          borderRadius="6px"
                                          fontSize="sm">
                                          <Text color={textColor} fontWeight="medium" textTransform="capitalize">
                                            {String(paymentMethod).replace(/_/g, " ")}
                                          </Text>
                                          <Text color={textColor} fontWeight="semibold">
                                            PKR {formatBalance(paymentAmount)}
                                          </Text>
                                        </HStack>
                                      );
                                    })}
                                  </VStack>
                                </Box>
                              )}

                              {/* Additional Details */}
                              {(txn.reference_number || txn.invoice_id || txn.related_account) && (
                                <Box pt="8px" borderTopWidth="1px" borderColor={itemBorder}>
                                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing="8px" fontSize="xs">
                                    {txn.reference_number && (
                                      <HStack>
                                        <Text color={labelColor} fontWeight="medium">Reference:</Text>
                                        <Text color={textColor}>{txn.reference_number}</Text>
                                      </HStack>
                                    )}
                                    {txn.invoice_id && (
                                      <HStack>
                                        <Text color={labelColor} fontWeight="medium">Invoice:</Text>
                                        <Text color={textColor}>#{txn.invoice_id}</Text>
                                      </HStack>
                                    )}
                                    {txn.related_account && (
                                      <HStack>
                                        <Text color={labelColor} fontWeight="medium">Related Account:</Text>
                                        <Text color={textColor}>{txn.related_account}</Text>
                                      </HStack>
                                    )}
                                  </SimpleGrid>
                                </Box>
                              )}
                            </VStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  };

  // Filter transactions for shared modal
  const filteredTransactionsShared = React.useMemo(() => {
    let filtered = transactionsShared;

    // Filter by tab (All, Revenue, Expenses)
    if (activeTabShared === 1) {
      filtered = filtered.filter(txn => txn.type === "credit");
    } else if (activeTabShared === 2) {
      filtered = filtered.filter(txn => txn.type === "debit");
    }

    // Filter by search query
    if (searchQueryShared.trim()) {
      const query = searchQueryShared.toLowerCase();
      filtered = filtered.filter(txn => {
        const description = (txn.description || "").toLowerCase();
        const amount = String(txn.amount || "");
        const date = txn.transaction_date 
          ? new Date(txn.transaction_date).toLocaleDateString().toLowerCase()
          : "";
        return description.includes(query) || amount.includes(query) || date.includes(query);
      });
    }

    return filtered;
  }, [transactionsShared, searchQueryShared, activeTabShared]);

  // Calculate summary stats for shared modal
  const summaryStatsShared = React.useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;

    filteredTransactionsShared.forEach(group => {
      if (group.isHierarchical) {
        group.transactions.forEach(txn => {
          if (txn.type === "credit") {
            totalRevenue += parseFloat(txn.amount || 0);
          } else if (txn.type === "debit") {
            totalExpenses += parseFloat(txn.amount || 0);
          }
        });
      } else {
        const txn = group.transaction;
        if (txn?.type === "credit") {
          totalRevenue += parseFloat(txn.amount || 0);
        } else if (txn?.type === "debit") {
          totalExpenses += parseFloat(txn.amount || 0);
        }
      }
    });

    return {
      totalRevenue,
      totalExpenses,
      netAmount: totalRevenue - totalExpenses,
      transactionCount: filteredTransactionsShared.length,
    };
  }, [filteredTransactionsShared]);

  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const itemBg = useColorModeValue("white", "gray.800");
  const itemBorder = useColorModeValue("gray.200", "gray.600");

  // Reusable Transaction Modal Component
  const TransactionModalContent = ({ 
    account, 
    transactions, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab,
    filteredTransactions,
    summaryStats,
    accountsList = []
  }) => {
    return (
      <>
        {loading ? (
          <Flex justify="center" align="center" py="60px">
            <VStack spacing="16px">
              <Spinner size="xl" color="#FF8D28" thickness="4px" />
              <Text color={mutedColor}>Loading transactions...</Text>
            </VStack>
          </Flex>
        ) : (
          <VStack align="stretch" spacing="20px">
            {/* Summary Stats */}
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing="16px">
              <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="green.400">
                <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                  Total Revenue
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  PKR {formatBalance(summaryStats.totalRevenue)}
                </Text>
              </Box>
              <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="red.400">
                <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                  Total Expenses
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="red.500">
                  PKR {formatBalance(summaryStats.totalExpenses)}
                </Text>
              </Box>
              <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="blue.400">
                <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                  Net Amount
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={summaryStats.netAmount >= 0 ? "green.500" : "red.500"}>
                  PKR {formatBalance(summaryStats.netAmount)}
                </Text>
              </Box>
              <Box p="16px" bg={sectionBg} borderRadius="8px" borderLeftWidth="4px" borderLeftColor="purple.400">
                <Text fontSize="xs" color={labelColor} mb="4px" fontWeight="medium">
                  Transactions
                </Text>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  {summaryStats.transactionCount}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Search and Filters */}
            <Box>
              <InputGroup mb="16px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search transactions by description, amount, or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={itemBg}
                  borderColor={itemBorder}
                />
              </InputGroup>
              <Tabs index={activeTab} onChange={setActiveTab} colorScheme="orange">
                <TabList>
                  <Tab>All</Tab>
                  <Tab>Revenue</Tab>
                  <Tab>Expenses</Tab>
                </TabList>
              </Tabs>
            </Box>

            {/* Transaction List */}
            {filteredTransactions.length === 0 ? (
              <Box py="60px" textAlign="center">
                <Text color={mutedColor} fontSize="md">
                  {searchQuery ? "No transactions match your search" : "No transactions found"}
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" spacing="12px" maxH="500px" overflowY="auto" pr="8px">
                {filteredTransactions.map((group) => {
                  // Handle hierarchical transactions
                  if (group.isHierarchical) {
                    const isCredit = group.type === "credit";
                    const txnDate = group.transaction_date;
                    const formattedDate = txnDate
                      ? new Date(txnDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "-";
                    const formattedTime = txnDate
                      ? new Date(txnDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                    return (
                      <Box
                        key={group.id}
                        p="20px"
                        bg={itemBg}
                        borderRadius="12px"
                        border="1px solid"
                        borderColor={itemBorder}
                        borderLeftWidth="4px"
                        borderLeftColor={isCredit ? "green.400" : "red.400"}
                        _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                        transition="all 0.2s">
                        <VStack align="stretch" spacing="12px">
                          {/* Header */}
                          <Flex justify="space-between" align="start" flexWrap="wrap" gap="12px">
                            <VStack align="start" spacing="4px" flex="1" minW="200px">
                              <HStack spacing="8px">
                                <Badge
                                  colorScheme={isCredit ? "green" : "red"}
                                  fontSize="xs"
                                  px="8px"
                                  py="2px"
                                  borderRadius="full">
                                  {isCredit ? "Credit" : "Debit"}
                                </Badge>
                                <Badge
                                  colorScheme="blue"
                                  fontSize="xs"
                                  px="8px"
                                  py="2px"
                                  borderRadius="full">
                                  Hierarchical
                                </Badge>
                                {isCredit ? (
                                  <ArrowUpIcon color="green.500" boxSize="14px" />
                                ) : (
                                  <ArrowDownIcon color="red.500" boxSize="14px" />
                                )}
                              </HStack>
                              <Text fontSize="sm" fontWeight="semibold" color={textColor} noOfLines={2}>
                                {group.description || "Transaction"}
                              </Text>
                              <HStack spacing="8px" fontSize="xs" color={mutedColor}>
                                <Text>{formattedDate}</Text>
                                {formattedTime && (
                                  <>
                                    <Text>•</Text>
                                    <Text>{formattedTime}</Text>
                                  </>
                                )}
                                <Text>•</Text>
                                <Text>{group.transactions.length} account{group.transactions.length > 1 ? 's' : ''}</Text>
                              </HStack>
                            </VStack>
                            <VStack align="end" spacing="4px" flexShrink={0}>
                              <Text
                                fontSize="xl"
                                fontWeight="bold"
                                color={isCredit ? "green.500" : "red.500"}>
                                {isCredit ? "+" : "-"}PKR {formatBalance(group.totalAmount)}
                              </Text>
                              <Text fontSize="xs" color={mutedColor}>
                                Total Amount
                              </Text>
                            </VStack>
                          </Flex>

                          {/* Hierarchical Transaction Breakdown */}
                          <Box pt="12px" borderTopWidth="1px" borderColor={itemBorder}>
                            <Text fontSize="xs" color={labelColor} mb="8px" fontWeight="medium">
                              Account Distribution
                            </Text>
                            <VStack align="stretch" spacing="6px">
                              {group.transactions.map((txn, idx) => {
                                const txnAmount = parseFloat(txn.amount || 0);
                                // Try to find account name from accounts list
                                const accountName = accountsList.find(acc => acc.id === txn.account_id)?.name || `Account #${txn.account_id}`;
                                const accountCode = accountsList.find(acc => acc.id === txn.account_id)?.code || '';
                                return (
                                  <HStack
                                    key={txn.id || idx}
                                    justify="space-between"
                                    p="8px"
                                    bg={sectionBg}
                                    borderRadius="6px"
                                    fontSize="sm">
                                    <VStack align="start" spacing="2px">
                                      <Text color={textColor} fontWeight="medium">
                                        {accountName}
                                      </Text>
                                      {accountCode && (
                                        <Text color={mutedColor} fontSize="xs">
                                          {accountCode}
                                        </Text>
                                      )}
                                    </VStack>
                                    <VStack align="end" spacing="2px">
                                      <Text color={textColor} fontWeight="semibold">
                                        PKR {formatBalance(txnAmount)}
                                      </Text>
                                      <Text color={mutedColor} fontSize="xs">
                                        Balance: PKR {formatBalance(txn.balance_after || 0)}
                                      </Text>
                                    </VStack>
                                  </HStack>
                                );
                              })}
                            </VStack>
                          </Box>
                        </VStack>
                      </Box>
                    );
                  }

                  // Handle regular (non-hierarchical) transactions
                  const txn = group.transaction;
                  const isCredit = txn.type === "credit";
                  const amount = parseFloat(txn.amount || 0);
                  const txnDate = txn.transaction_date || txn.created_at;
                  const formattedDate = txnDate
                    ? new Date(txnDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-";
                  const formattedTime = txnDate
                    ? new Date(txnDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  // Parse payment breakdown if available
                  let paymentBreakdown = [];
                  if (txn.payment_breakdown && Array.isArray(txn.payment_breakdown)) {
                    paymentBreakdown = txn.payment_breakdown;
                  } else if (txn.payment_method) {
                    paymentBreakdown = [{ payment_method: txn.payment_method, amount: amount }];
                  }

                  return (
                    <Box
                      key={txn.id}
                      p="20px"
                      bg={itemBg}
                      borderRadius="12px"
                      border="1px solid"
                      borderColor={itemBorder}
                      borderLeftWidth="4px"
                      borderLeftColor={isCredit ? "green.400" : "red.400"}
                      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                      transition="all 0.2s">
                      <VStack align="stretch" spacing="12px">
                        {/* Header */}
                        <Flex justify="space-between" align="start" flexWrap="wrap" gap="12px">
                          <VStack align="start" spacing="4px" flex="1" minW="200px">
                            <HStack spacing="8px">
                              <Badge
                                colorScheme={isCredit ? "green" : "red"}
                                fontSize="xs"
                                px="8px"
                                py="2px"
                                borderRadius="full">
                                {isCredit ? "Credit" : "Debit"}
                              </Badge>
                              {isCredit ? (
                                <ArrowUpIcon color="green.500" boxSize="14px" />
                              ) : (
                                <ArrowDownIcon color="red.500" boxSize="14px" />
                              )}
                            </HStack>
                            <Text fontSize="sm" fontWeight="semibold" color={textColor} noOfLines={2}>
                              {txn.description || "Transaction"}
                            </Text>
                            <HStack spacing="8px" fontSize="xs" color={mutedColor}>
                              <Text>{formattedDate}</Text>
                              {formattedTime && (
                                <>
                                  <Text>•</Text>
                                  <Text>{formattedTime}</Text>
                                </>
                              )}
                            </HStack>
                          </VStack>
                          <VStack align="end" spacing="4px" flexShrink={0}>
                            <Text
                              fontSize="xl"
                              fontWeight="bold"
                              color={isCredit ? "green.500" : "red.500"}>
                              {isCredit ? "+" : "-"}PKR {formatBalance(amount)}
                            </Text>
                            <Text fontSize="xs" color={mutedColor}>
                              Balance: PKR {formatBalance(txn.balance_after || 0)}
                            </Text>
                          </VStack>
                        </Flex>

                        {/* Payment Breakdown */}
                        {paymentBreakdown.length > 0 && (
                          <Box pt="12px" borderTopWidth="1px" borderColor={itemBorder}>
                            <Text fontSize="xs" color={labelColor} mb="8px" fontWeight="medium">
                              Payment Breakdown
                            </Text>
                            <VStack align="stretch" spacing="6px">
                              {paymentBreakdown.map((payment, idx) => {
                                const paymentMethod = payment.payment_method || payment.method || "N/A";
                                const paymentAmount = parseFloat(payment.amount || 0);
                                return (
                                  <HStack
                                    key={idx}
                                    justify="space-between"
                                    p="8px"
                                    bg={sectionBg}
                                    borderRadius="6px"
                                    fontSize="sm">
                                    <Text color={textColor} fontWeight="medium" textTransform="capitalize">
                                      {String(paymentMethod).replace(/_/g, " ")}
                                    </Text>
                                    <Text color={textColor} fontWeight="semibold">
                                      PKR {formatBalance(paymentAmount)}
                                    </Text>
                                  </HStack>
                                );
                              })}
                            </VStack>
                          </Box>
                        )}

                        {/* Additional Details */}
                        {(txn.reference_number || txn.invoice_id || txn.related_account) && (
                          <Box pt="8px" borderTopWidth="1px" borderColor={itemBorder}>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="8px" fontSize="xs">
                              {txn.reference_number && (
                                <HStack>
                                  <Text color={labelColor} fontWeight="medium">Reference:</Text>
                                  <Text color={textColor}>{txn.reference_number}</Text>
                                </HStack>
                              )}
                              {txn.invoice_id && (
                                <HStack>
                                  <Text color={labelColor} fontWeight="medium">Invoice:</Text>
                                  <Text color={textColor}>#{txn.invoice_id}</Text>
                                </HStack>
                              )}
                              {txn.related_account && (
                                <HStack>
                                  <Text color={labelColor} fontWeight="medium">Related Account:</Text>
                                  <Text color={textColor}>{txn.related_account}</Text>
                                </HStack>
                              )}
                            </SimpleGrid>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </VStack>
        )}
      </>
    );
  };

  return (
    <>
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

      {/* Shared Modal for External Account Views */}
      <Modal isOpen={isModalOpenShared} onClose={onModalCloseShared} size="6xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent bg={cardBg} maxH="90vh">
          <ModalHeader color={textColor} pb="16px">
            <VStack align="start" spacing="8px">
              <Text fontSize="xl" fontWeight="bold">
                {selectedAccountShared?.name}
              </Text>
              <HStack spacing="12px" fontSize="sm" color={labelColor}>
                {selectedAccountShared?.code && (
                  <Badge colorScheme="blue" variant="outline">
                    {selectedAccountShared.code}
                  </Badge>
                )}
                <Text>Balance: PKR {formatBalance(selectedAccountShared?.balance || 0)}</Text>
              </HStack>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb="24px" px="24px">
            <TransactionModalContent
              account={selectedAccountShared}
              transactions={transactionsShared}
              loading={loadingShared}
              searchQuery={searchQueryShared}
              setSearchQuery={setSearchQueryShared}
              activeTab={activeTabShared}
              setActiveTab={setActiveTabShared}
              filteredTransactions={filteredTransactionsShared}
              summaryStats={summaryStatsShared}
              accountsList={accounts}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccountHierarchy;

