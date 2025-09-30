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
} from "@chakra-ui/react";
// Assets
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";
// Custom Icons
import { ProfileIcon, SettingsIcon } from "components/Icons/Icons";
// Custom Components
import { ItemContent } from "components/Menu/ItemContent";
import SidebarResponsive from "components/Sidebar/SidebarResponsive";
import PropTypes from "prop-types";
import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import routes from "routes.js";
import authService from "services/authService";

export default function HeaderLinks(props) {
  const { variant, children, fixed, secondary, onOpen, ...rest } = props;
  const history = useHistory();
  const toast = useToast();
  
  // Get user from localStorage directly
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  // Chakra Color Mode
  let mainTeal = useColorModeValue("#FF8D28", "#FF8D28");
  let inputBg = useColorModeValue("white", "gray.800");
  let mainText = useColorModeValue("gray.700", "gray.200");
  let navbarIcon = useColorModeValue("gray.500", "gray.200");
  let searchIcon = useColorModeValue("gray.700", "gray.200");

  if (secondary) {
    navbarIcon = "white";
    mainText = "white";
  }

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
          placeholder="Type here..."
          borderRadius="inherit"
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
            <MenuItem onClick={() => history.push("/admin/profile")}>
              <ProfileIcon color={navbarIcon} w="18px" h="18px" me="8px" />
              Profile
            </MenuItem>
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
          <MenuButton>
            <BellIcon color={navbarIcon} w="16px" h="16px" />
          </MenuButton>
          <MenuList p="16px 8px">
            <Flex flexDirection="column">
              <MenuItem borderRadius="8px" mb="10px">
                <ItemContent
                  time="13 minutes ago"
                  info="from Alicia"
                  boldInfo="New Message"
                  aName="Alicia"
                  aSrc={avatar1}
                />
              </MenuItem>
              <MenuItem borderRadius="8px" mb="10px">
                <ItemContent
                  time="2 days ago"
                  info="by Josh Henry"
                  boldInfo="New Album"
                  aName="Josh Henry"
                  aSrc={avatar2}
                />
              </MenuItem>
              <MenuItem borderRadius="8px">
                <ItemContent
                  time="3 days ago"
                  info="Payment succesfully completed!"
                  boldInfo=""
                  aName="Kara"
                  aSrc={avatar3}
                />
              </MenuItem>
            </Flex>
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
