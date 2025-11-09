/*eslint-disable*/
// chakra imports
import {
    Box,
    Button, Flex,
    Link,
    Stack,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import IconBox from "components/Icons/IconBox";
import { CreativeTimLogo } from "components/Icons/Icons";
import { Separator } from "components/Separator/Separator";
import { SidebarHelp } from "components/Sidebar/SidebarHelp";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

// this function creates the links and collapses that appear in the sidebar (left menu)


const SidebarContent = ({ logoText, routes }) => {

    // to check for active links and opened collapses
  let location = useLocation();
  // this is for the rest of the collapses
  const [state, setState] = React.useState({});

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname === routeName ? "active" : "";
  };
  const createLinks = (routes) => {
    // Chakra Color Mode
    const activeBg = useColorModeValue("white", "gray.700");
    const inactiveBg = useColorModeValue("white", "gray.700");
    const activeColor = useColorModeValue("gray.700", "white");
    const inactiveColor = useColorModeValue("gray.400", "gray.400");

    return routes.map((prop, key) => {
      if (prop.hidden || prop.hideInSidebar) {
        return null;
      }
      if (prop.redirect) {
        return null;
      }
      if (prop.category) {
        const visibleViews = Array.isArray(prop.views) ? prop.views.filter(v => !v.hidden && !v.hideInSidebar) : [];
        if (visibleViews.length === 0 || (prop.name && prop.name.toUpperCase() === 'ACCOUNT PAGES')) {
          return null;
        }
        const isOpen = !!state[prop.state];
        return (
          <Box key={prop.name}>
            <Button
              onClick={() => setState((s) => ({ ...s, [prop.state]: !s[prop.state] }))}
              variant="ghost"
              justifyContent="space-between"
              w="100%"
              px={{ sm: "10px", xl: "16px" }}
              py="12px"
              mb={{ xl: "6px" }}
            >
              <Text color={activeColor} fontWeight="bold">
                {document.documentElement.dir === "rtl" ? prop.rtlName : prop.name}
              </Text>
              <Box as="span" color={inactiveColor}>{isOpen ? "▾" : "▸"}</Box>
            </Button>
            <Box display={isOpen ? 'block' : 'none'} ps={{ sm: '18px', xl: '24px' }}>
              {createLinks(visibleViews)}
            </Box>
          </Box>
        );
      }
      // Removed temporary "Uploading" placeholder for Expenses & Cashflow to enable navigation
      return (
        <NavLink to={prop.layout + prop.path} key={prop.name}>
          {activeRoute(prop.layout + prop.path) === "active" ? (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              bg={activeBg}
              mb={{
                xl: "12px",
              }}
              mx={{
                xl: "auto",
              }}
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              py="12px"
              borderRadius="15px"
              _hover="none"
              w="100%"
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
            >
              <Flex>
                {typeof prop.icon === "string" ? (
                  <Icon>{prop.icon}</Icon>
                ) : (
                  <IconBox
                    bg="#FF8D28"
                    color="white"
                    h="30px"
                    w="30px"
                    me="12px"
                  >
                    {prop.icon}
                  </IconBox>
                )}
                <Text color={activeColor} my="auto" fontSize="sm">
                  {document.documentElement.dir === "rtl"
                    ? prop.rtlName
                    : prop.name}
                </Text>
              </Flex>
            </Button>
          ) : (
            <Button
              boxSize="initial"
              justifyContent="flex-start"
              alignItems="center"
              bg="transparent"
              mb={{
                xl: "12px",
              }}
              mx={{
                xl: "auto",
              }}
              py="12px"
              ps={{
                sm: "10px",
                xl: "16px",
              }}
              borderRadius="15px"
              _hover="none"
              w="100%"
              _active={{
                bg: "inherit",
                transform: "none",
                borderColor: "transparent",
              }}
              _focus={{
                boxShadow: "none",
              }}
            >
              <Flex>
                {typeof prop.icon === "string" ? (
                  <Icon>{prop.icon}</Icon>
                ) : (
                  <IconBox
                    bg={inactiveBg}
                    color="#FF8D28"
                    h="30px"
                    w="30px"
                    me="12px"
                  >
                    {prop.icon}
                  </IconBox>
                )}
                <Text color={inactiveColor} my="auto" fontSize="sm">
                  {document.documentElement.dir === "rtl"
                    ? prop.rtlName
                    : prop.name}
                </Text>
              </Flex>
            </Button>
          )}
        </NavLink>
      );
    });
  };

    // Build UI-only grouped sidebar structure while keeping underlying routes unchanged
    const posPaths = new Set(["/pos", "/customer-management", "/stock-management", "/invoices"]);
    const staffPaths = new Set(["/staff-management", "/attendance-reports", "/salary-tracker"]);

    const isRouteItem = (r) => !r.category && !r.hidden && !r.hideInSidebar && r.path;
    const posRoutes = routes.filter((r) => isRouteItem(r) && posPaths.has(r.path));
    const staffRoutes = routes.filter((r) => isRouteItem(r) && staffPaths.has(r.path));
    const used = new Set([...Array.from(posPaths), ...Array.from(staffPaths)]);
    const remaining = routes.filter((r) => !(isRouteItem(r) && used.has(r.path)));

    const grouped = [
      { name: "Point of sale", rtlName: "لوحة القيادة", category: true, state: "posCollapse", views: posRoutes },
      { name: "Staff Management", rtlName: "لوحة القيادة", category: true, state: "staffCollapse", views: staffRoutes },
      ...remaining,
    ];

    const links = <>{createLinks(grouped)}</>;

  return (
    <>
        <Box pt={"25px"} mb="12px">
      <Link
        href={`${process.env.PUBLIC_URL}/#/`}
        target="_blank"
        display="flex"
        lineHeight="100%"
        mb="30px"
        fontWeight="bold"
        justifyContent="center"
        alignItems="center"
        fontSize="11px"
      >
        <Text fontSize="sm" mt="3px">
          {logoText}
        </Text>
      </Link>
      <Separator></Separator>
    </Box>
          <Stack direction="column" mb="40px">
            <Box>{links}</Box>
          </Stack>
          <SidebarHelp />
    </>
  )
}

export default SidebarContent