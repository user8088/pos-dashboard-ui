// Chakra imports
import {
  Box,
  Flex,
  Grid,
  Text,
  useColorModeValue,
  Button,
  HStack,
  VStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Image,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import React, { useState, useEffect } from "react";
import { FaPlus, FaUserShield, FaUsers } from "react-icons/fa";
import { EditIcon, DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import ResponsiveTable from "components/Tables/ResponsiveTable";
import userService from "services/userService";
import logo from "assets/img/avatars/placeholder.png";

// User Table Row Component
const UserTableRow = ({ user, currentUserId, onEdit, onDelete }) => {
  const textColor = useColorModeValue("gray.700", "white");

  const getRoleBadgeColor = (role) => {
    return role === "admin" ? "purple" : "blue";
  };

  const isCurrentUser = user.id === currentUserId;

  return (
    <Tr>
      <Td minWidth={{ sm: "250px" }} pl="0px">
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Image src={logo} w="30px" h="30px" me="18px" objectFit="cover" borderRadius="full" />
          <Flex direction="column">
            <Text
              fontSize="md"
              color={textColor}
              fontWeight="bold"
              minWidth="100%"
            >
              {user.name} {isCurrentUser && "(You)"}
            </Text>
            <Text fontSize="sm" color="gray.400" fontWeight="medium">
              {user.email}
            </Text>
          </Flex>
        </Flex>
      </Td>

      <Td>
        <Badge
          colorScheme={getRoleBadgeColor(user.user_role)}
          fontSize="14px"
          p="3px 10px"
          borderRadius="20px"
          textTransform="capitalize"
        >
          {user.user_role}
        </Badge>
      </Td>

      <Td>
        <Text fontSize="sm" color="gray.400" fontWeight="medium">
          {new Date(user.created_at).toLocaleDateString()}
        </Text>
      </Td>

      <Td>
        <HStack spacing="12px">
          <Button p="0px" bg="transparent" variant="no-hover" onClick={() => onEdit(user)}>
            <Text
              fontSize="md"
              color="gray.400"
              fontWeight="bold"
              cursor="pointer"
              _hover={{ color: "brand.500" }}
            >
              Edit
            </Text>
          </Button>
          <Button 
            p="0px" 
            bg="transparent" 
            variant="no-hover" 
            onClick={() => onDelete(user)}
            isDisabled={isCurrentUser}
          >
            <DeleteIcon 
              color={isCurrentUser ? "gray.300" : "#FF8D28"} 
              style={{ cursor: isCurrentUser ? "not-allowed" : "pointer" }} 
            />
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

function UserManagement() {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardShadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.06)", "0 4px 20px rgba(0,0,0,0.3)");
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();
 
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
    }
  }, []);

  useEffect(() => {
    // Check if user is admin
    if (!userService.isAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access user management.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      window.location.href = "/#/admin/dashboard";
      return;
    }
    
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const result = await userService.getAllUsers();
      
      if (result.success) {
        setUsers(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await userService.getUserStats();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    user_role: "staff"
  });

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      password: "" // Don't populate password for security
    });
    onEditOpen();
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // Prepare update data (only include password if it's been changed)
    const updateData = {
      name: editingUser.name,
      email: editingUser.email,
      user_role: editingUser.user_role,
    };

    // Only include password if it's not empty
    if (editingUser.password && editingUser.password.trim() !== "") {
      updateData.password = editingUser.password;
    }

    try {
      const result = await userService.updateUser(editingUser.id, updateData);
      
      if (result.success) {
        toast({
          title: "User Updated",
          description: result.message || `Updated ${editingUser.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onEditClose();
        setEditingUser(null);
        fetchUsers();
        fetchStats();
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to update user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const result = await userService.createUser(newUser);
      
      if (result.success) {
        toast({
          title: "User Created",
          description: result.message || `Created user ${newUser.name}`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        setNewUser({
          name: "",
          email: "",
          password: "",
          user_role: "staff"
        });
        onAddClose();
        fetchUsers();
        fetchStats();
      } else {
        toast({
          title: "Create Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to create user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUserId) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!window.confirm(`Delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await userService.deleteUser(user.id);
      
      if (result.success) {
        toast({
          title: "User Deleted",
          description: result.message || `Deleted user ${user.name}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
        fetchStats();
      } else {
        toast({
          title: "Delete Failed",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to delete user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      {/* Statistics Cards */}
      {stats && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="24px" mb="24px">
          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Total Users
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.total_users}
                  </StatNumber>
                </Stat>
                <Icon as={FaUsers} w={8} h={8} color="#FF8D28" />
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Admin Users
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.admin_users}
                  </StatNumber>
                </Stat>
                <Icon as={FaUserShield} w={8} h={8} color="purple.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Staff Users
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.staff_users}
                  </StatNumber>
                </Stat>
                <Icon as={FaUsers} w={8} h={8} color="blue.500" />
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} boxShadow={cardShadow}>
            <CardBody>
              <Flex direction="row" align="center" justify="space-between" w="100%">
                <Stat>
                  <StatLabel fontSize="sm" color="gray.400" fontWeight="bold" mb="4px">
                    Recent (30 days)
                  </StatLabel>
                  <StatNumber fontSize="lg" color={textColor} fontWeight="bold">
                    {stats.recent_users_30_days}
                  </StatNumber>
                </Stat>
                <Icon as={FaPlus} w={8} h={8} color="green.500" />
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Header Section */}
      <Box mb='24px'>
        <Flex direction='column' w='100%'>
          <Text fontSize='2xl' color={textColor} fontWeight='bold' mb='8px'>
            User Management
          </Text>
          <Text fontSize='md' color='gray.400' mb='16px'>
            Manage system users and their access permissions (Admin Only)
          </Text>
          
          {/* Action Buttons */}
          <Flex
            direction={{ sm: "column", lg: "row" }}
            justify='space-between'
            align={{ sm: "start", lg: "center" }}
            w='100%'
            gap='16px'>
            
            <Flex direction={{ base: "column", sm: "row" }} gap="12px" w="100%">
              <Button
                leftIcon={<FaPlus />}
                colorScheme='teal'
                bg='#FF8D28'
                color='white'
                _hover={{ bg: '#E67E22' }}
                onClick={onAddOpen}
                size='md'
                display={{ base: "none", md: "flex" }}>
                Add New User
              </Button>

              {/* Mobile: Dropdown menu */}
              <Box display={{ base: "block", md: "none" }}>
                <Menu>
                  <MenuButton as={Button} rightIcon={<HamburgerIcon />} size="md" colorScheme="teal" bg='#FF8D28' color='white' _hover={{ bg: '#E67E22' }}>
                    Actions
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<FaPlus />} onClick={onAddOpen}>
                      Add New User
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      {/* Users Table */}
      <Card bg={cardBg} boxShadow={cardShadow}>
        <CardBody>
          {isLoading ? (
            <Flex 
              justify="center" 
              align="center" 
              h="200px" 
              w="100%"
            >
              <VStack spacing="16px" textAlign="center">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="#FF8D28"
                  size="xl"
                />
              </VStack>
            </Flex>
          ) : users.length === 0 ? (
            <Flex 
              direction="column" 
              justify="center" 
              align="center" 
              h="400px" 
              p="40px"
              w="100%"
            >
              <VStack spacing="24px" maxW="400px" textAlign="center">
                <Text fontSize="2xl" color={textColor} fontWeight="bold">
                  No Users Yet
                </Text>
                <Text color="gray.500" fontSize="md" lineHeight="1.6">
                  Add your first user to get started with user management.
                </Text>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme='teal'
                  bg='#FF8D28'
                  color='white'
                  _hover={{ bg: '#E67E22' }}
                  size="lg"
                  px="32px"
                  py="12px"
                  onClick={onAddOpen}>
                  ADD FIRST USER
                </Button>
              </VStack>
            </Flex>
          ) : (
            <ResponsiveTable
              captions={["User / Email", "Role", "Created", "Actions"]}
              data={users}
              isLoading={isLoading}
              actionButtons={[
                {
                  label: "Edit",
                  icon: <EditIcon />,
                  onClick: (user) => handleEditUser(user),
                },
                {
                  label: "Delete",
                  icon: <DeleteIcon />,
                  onClick: (user) => handleDeleteUser(user),
                  color: "red.500",
                  isDisabled: (user) => user.id === currentUserId,
                },
              ]}
            >
              {users.map((user) => (
                <UserTableRow 
                  key={user.id} 
                  user={user}
                  currentUserId={currentUserId}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))}
            </ResponsiveTable>
          )}
        </CardBody>
      </Card>

      {/* Add New User Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Add New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="16px" align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Name
                </FormLabel>
                <Input
                  value={newUser.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, name: value }));
                  }}
                  placeholder="Enter full name"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, email: value }));
                  }}
                  placeholder="Enter email address"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Password
                </FormLabel>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, password: value }));
                  }}
                  placeholder="Enter password (min 8 characters)"
                  size="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.500">
                  Role
                </FormLabel>
                <Select
                  value={newUser.user_role}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewUser(prev => ({ ...prev, user_role: value }));
                  }}
                  size="md"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
                <Text fontSize="xs" color="gray.400" mt="8px">
                  Admin: Full access. Staff: Limited access (no user management, expenses, or transactions)
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onAddClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleAddUser}
                isDisabled={!newUser.name || !newUser.email || !newUser.password}
              >
                Add User
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingUser && (
              <VStack spacing="16px" align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.500">
                    Name
                  </FormLabel>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, name: value }));
                    }}
                    size="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.500">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, email: value }));
                    }}
                    size="md"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.500">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={editingUser.password || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, password: value }));
                    }}
                    placeholder="Leave blank to keep current password"
                    size="md"
                  />
                  <Text fontSize="xs" color="gray.400" mt="4px">
                    Only enter a new password if you want to change it
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.500">
                    Role
                  </FormLabel>
                  <Select
                    value={editingUser.user_role}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingUser(prev => ({ ...prev, user_role: value }));
                    }}
                    size="md"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <Text fontSize="xs" color="gray.400" mt="8px">
                    Admin: Full access. Staff: Limited access
                  </Text>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing="12px">
              <Button variant="outline" onClick={onEditClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                bg="#FF8D28"
                color="white"
                _hover={{ bg: "#E67E22" }}
                onClick={handleUpdateUser}
              >
                Update User
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default UserManagement;

