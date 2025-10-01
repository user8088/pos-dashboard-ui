// import
import Dashboard from "views/Dashboard/Dashboard";
import Tables from "views/Dashboard/Tables";
import Billing from "views/Dashboard/Billing";
import RTLPage from "views/Dashboard/RTL";
import Profile from "views/Dashboard/Profile";
import InProgress from "views/Dashboard/InProgress";
import SalesAnalytics from "views/Dashboard/SalesAnalytics";
import CustomerManagement from "views/Dashboard/CustomerManagement";
import UserManagement from "views/Dashboard/UserManagement";
import SignIn from "views/Auth/SignIn.js";
import SignUp from "views/Auth/SignUp.js";
import RentalManagement from "views/Dashboard/RentalManagement";

import {
  HomeIcon,
  StatsIcon,
  CreditIcon,
  PersonIcon,
  DocumentIcon,
  RocketIcon,
  SupportIcon,
} from "components/Icons/Icons";
import { SettingsIcon } from "@chakra-ui/icons";

var dashRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    rtlName: "لوحة القيادة",
    icon: <HomeIcon color="inherit" />,
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/sales-analytics",
    name: "Sales & Analytics",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color="inherit" />,
    component: SalesAnalytics,
    layout: "/admin",
  },
  {
    path: "/stock-management",
    name: "Stock Management",
    rtlName: "لوحة القيادة",
    icon: <SettingsIcon color="inherit" />,
    component: Tables,
    layout: "/admin",
  },
  {
    path: "/rental-management",
    name: "Rental Management",
    rtlName: "لوحة القيادة",
    icon: <SupportIcon color="inherit" />,
    component: RentalManagement,
    layout: "/admin",
  },
  {
    path: "/customer-management",
    name: "Customer Management",
    rtlName: "لوحة القيادة",
    icon: <PersonIcon color="inherit" />,
    component: CustomerManagement,
    layout: "/admin",
  },
  {
    path: "/expenses-cashflow",
    name: "Expenses & Cashflow",
    rtlName: "لوحة القيادة",
    icon: <CreditIcon color="inherit" />,
    component: Billing,
    layout: "/admin",
    adminOnly: true,
  },
  {
    path: "/user-management",
    name: "User Management",
    rtlName: "إدارة المستخدمين",
    icon: <PersonIcon color="inherit" />,
    component: UserManagement,
    layout: "/admin",
    adminOnly: true,
  },

  // Hidden routes (not shown in sidebar but still accessible via URL)
  {
    path: "/signin",
    name: "Sign In",
    component: SignIn,
    layout: "/auth",
    hidden: true,
  },
  {
    path: "/signup",
    name: "Sign Up",
    component: SignUp,
    layout: "/admin",
    adminOnly: true,
    hidden: true,
  },
];
export default dashRoutes;
