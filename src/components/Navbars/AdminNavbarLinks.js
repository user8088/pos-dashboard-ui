// Chakra Icons
import { BellIcon, SearchIcon } from "@chakra-ui/icons";
// Chakra Imports
import {
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  Avatar,
  useToast,
  Box,
  HStack,
  VStack,
  Badge,
  Spinner,
  Divider,
  Icon,
} from "@chakra-ui/react";
// Assets
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
// Custom Icons
import { ProfileIcon, SettingsIcon, WalletIcon, ClockIcon, CartIcon, CreditIcon } from "components/Icons/Icons";
// React Icons
import { FaArrowUp, FaArrowDown, FaShoppingCart, FaClock, FaExclamationTriangle } from "react-icons/fa";
// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import SidebarResponsive from "components/Sidebar/SidebarResponsive";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import routes from "routes.js";
import authService from "services/authService";
import { useSearch } from "contexts/SearchContext";
import notificationService from "services/notificationService";

export default function HeaderLinks(props) {
  const { variant, children, fixed, secondary, onOpen, ...rest } = props;
  const history = useHistory();
  const toast = useToast();
  const { updateSearch, clearSearch, searchTerm } = useSearch();
  
  // Get user from localStorage and memoize it
  const [user, setUser] = useState(() => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  });

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Chakra Color Mode
  let mainTeal = useColorModeValue("#FF8D28", "#FF8D28");
  let inputBg = useColorModeValue("white", "gray.800");
  let mainText = useColorModeValue("gray.700", "gray.200");
  let navbarIcon = useColorModeValue("gray.500", "gray.200");
  let searchIcon = useColorModeValue("gray.700", "gray.200");
  const textColor = useColorModeValue("gray.700", "white");

  if (secondary) {
    navbarIcon = "white";
    mainText = "white";
  }

  // Fetch notifications and count on mount and set up auto-refresh
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once on mount

  const fetchNotifications = React.useCallback(async () => {
    if (isLoadingNotifications) return; // Prevent duplicate calls
    
    setIsLoadingNotifications(true);
    try {
      const result = await notificationService.getUnreadNotifications(10);
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [isLoadingNotifications]);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setUnreadCount(0);
    }
  }, []);

  const handleMarkAsRead = React.useCallback(async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        // Update state locally without refetching
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  const handleMarkAllAsRead = React.useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        toast({
          title: "Marked All as Read",
          description: `${result.updated_count} notification(s) marked as read`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [toast]);

  const getNotificationIcon = (type, data) => {
    const iconSize = "20px";
    const iconProps = { w: iconSize, h: iconSize };
    
    switch (type) {
      case 'transaction_created':
        // Check if it's inflow or outflow from data
        if (data?.type === 'inflow') {
          return <Icon as={FaArrowUp} {...iconProps} color="green.500" />;
        } else {
          return <Icon as={FaArrowDown} {...iconProps} color="red.500" />;
        }
      case 'rental_due_soon':
        return <Icon as={FaClock} {...iconProps} color="orange.500" />;
      case 'rental_overdue':
        return <Icon as={FaExclamationTriangle} {...iconProps} color="red.500" />;
      case 'customer_payment_due':
        return <CreditIcon {...iconProps} color="purple.500" />;
      default:
        return <BellIcon {...iconProps} color="gray.500" />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'PKR 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `PKR ${numAmount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNotificationMessage = (notification) => {
    let message = notification.message;
    
    // Replace dollar signs with PKR formatting
    if (notification.data?.amount) {
      const amount = formatCurrency(notification.data.amount);
      message = message.replace(/\$[\d,]+\.?\d*/g, amount);
    }
    
    if (notification.data?.bill_due) {
      const billDue = formatCurrency(notification.data.bill_due);
      message = message.replace(/\$[\d,]+\.?\d*/g, billDue);
    }
    
    return message;
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      history.push("/auth/signin");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const settingsRef = React.useRef();
  return (
    <Flex
      w={{ base: "100%", md: "auto" }}
      alignItems="center"
      justifyContent={{ base: "space-between", md: "flex-end" }}
      flexDirection={{ base: "row", md: "row" }}
      gap={{ base: "8px", md: "12px" }}
    >
      {/* Search Bar - Hidden on mobile, visible on tablet+ */}
      <InputGroup
        cursor="pointer"
        bg={inputBg}
        borderRadius="15px"
        w={{
          base: "0px",
          sm: "0px", 
          md: "200px",
        }}
        me={{ base: "0px", md: "20px" }}
        size="sm"
        display={{ base: "none", md: "flex" }}
        _focus={{
          borderColor: { mainTeal },
        }}
        _active={{
          borderColor: { mainTeal },
        }}
      >
        <InputLeftElement
          children={
            <IconButton
              bg="inherit"
              borderRadius="inherit"
              _hover="none"
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
              icon={<SearchIcon color={searchIcon} w="15px" h="15px" />}
            ></IconButton>
          }
        />
        <Input
          fontSize="xs"
          py="11px"
          color={mainText}
          placeholder="Search tables..."
          borderRadius="inherit"
          value={searchTerm}
          onChange={(e) => updateSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              clearSearch();
            }
          }}
        />
      </InputGroup>
      
      {/* User Menu */}
      {user ? (
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            px={{ base: "4px", md: "8px" }}
            color={navbarIcon}
            size="sm"
            rightIcon={
              document.documentElement.dir ? (
                ""
              ) : (
                <Avatar size="xs" name={user.name} src={avatar1} />
              )
            }
            leftIcon={
              document.documentElement.dir ? (
                <Avatar size="xs" name={user.name} src={avatar1} />
              ) : (
                ""
              )
            }
          >
            <Text display={{ base: "none", lg: "flex" }} fontSize="xs">{user.name}</Text>
          </MenuButton>
          <MenuList>
            <MenuItem>
              <Flex direction="column" align="start">
                <Text fontWeight="bold">{user.name}</Text>
                <Text fontSize="sm" color="gray.500">{user.email}</Text>
                <Text fontSize="xs" color="gray.400" textTransform="capitalize">
                  Role: {user.user_role}
                </Text>
              </Flex>
            </MenuItem>
            {/* <MenuItem onClick={() => history.push("/admin/profile")}>
              <ProfileIcon color={navbarIcon} w="18px" h="18px" me="8px" />
              Profile
            </MenuItem> */}
            <MenuItem onClick={handleLogout}>
              <Text color="red.500">Logout</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      ) : (
        <NavLink to="/auth/signin">
          <Button
            ms="0px"
            px="0px"
            me={{ sm: "2px", md: "16px" }}
            color={navbarIcon}
            variant="transparent-with-icon"
            rightIcon={
              document.documentElement.dir ? (
                ""
              ) : (
                <ProfileIcon color={navbarIcon} w="22px" h="22px" me="0px" />
              )
            }
            leftIcon={
              document.documentElement.dir ? (
                <ProfileIcon color={navbarIcon} w="22px" h="22px" me="0px" />
              ) : (
                ""
              )
            }
          >
            <Text display={{ base: "none", sm: "flex" }}>Sign In</Text>
          </Button>
        </NavLink>
      )}

      {/* Mobile Menu - Show hamburger on mobile, hide on larger screens */}
      <Box display={{ base: "block", md: "none" }}>
        <SidebarResponsive
          logoText={props.logoText}
          secondary={props.secondary}
          routes={routes}
          {...rest}
        />
      </Box>

      {/* Desktop Actions - Hide on mobile, show on tablet+ */}
      <HStack spacing="8px" display={{ base: "none", md: "flex" }}>
        <SettingsIcon
          cursor="pointer"
          ref={settingsRef}
          onClick={props.onOpen}
          color={navbarIcon}
          w="16px"
          h="16px"
        />
        <Menu>
          <MenuButton position="relative">
            <BellIcon color={navbarIcon} w="16px" h="16px" />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-6px"
                right="-6px"
                colorScheme="red"
                borderRadius="full"
                fontSize="10px"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </MenuButton>
          <MenuList p="16px 8px" maxH="500px" overflowY="auto" minW="350px">
            <Flex justifyContent="space-between" alignItems="center" px="8px" mb="12px">
              <Text fontWeight="bold" fontSize="md">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="blue"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </Flex>
            <Divider mb="8px" />
            
            {isLoadingNotifications ? (
              <Flex justify="center" align="center" py="40px">
                <Spinner color="#FF8D28" size="md" />
              </Flex>
            ) : notifications.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py="40px">
                <Text fontSize="2xl" mb="8px">🔔</Text>
                <Text color="gray.500" fontSize="sm">No new notifications</Text>
              </Flex>
            ) : (
              <Flex flexDirection="column">
                {notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    borderRadius="8px"
                    mb="8px"
                    p="12px"
                    bg={notification.is_read ? "transparent" : "blue.50"}
                    _hover={{ bg: "gray.100" }}
                    onClick={() => handleMarkAsRead(notification.id)}
                    transition="all 0.2s"
                  >
                    <Flex align="start" w="100%" gap="12px">
                      <Box
                        minW="40px"
                        h="40px"
                        borderRadius="12px"
                        bg={useColorModeValue("white", "gray.700")}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        border="1px solid"
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                      >
                        {getNotificationIcon(notification.type, notification.data)}
                      </Box>
                      <Flex direction="column" flex="1" minW="0">
                        <Text fontWeight="bold" fontSize="sm" mb="4px" color={textColor}>
                          {notification.title}
                        </Text>
                        <Text 
                          fontSize="xs" 
                          color="gray.600" 
                          mb="6px"
                          noOfLines={2}
                        >
                          {formatNotificationMessage(notification)}
                        </Text>
                        <Text fontSize="xs" color="gray.400" fontWeight="500">
                          {notificationService.formatTime(notification.created_at)}
                        </Text>
                      </Flex>
                      {!notification.is_read && (
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg="blue.500"
                          mt="4px"
                        />
                      )}
                    </Flex>
                  </MenuItem>
                ))}
              </Flex>
            )}
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
