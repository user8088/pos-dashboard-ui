// import
import Dashboard from "views/Dashboard/Dashboard";
import Tables from "views/Dashboard/Tables";
import Billing from "views/Dashboard/Billing";
import RTLPage from "views/Dashboard/RTL";
import Profile from "views/Dashboard/Profile";
import InProgress from "views/Dashboard/InProgress";
import SalesAnalytics from "views/Dashboard/SalesAnalytics";
import CustomerManagement from "views/Dashboard/CustomerManagement";
import StaffManagement from "views/Dashboard/StaffManagement";
import AttendanceReports from "views/Dashboard/AttendanceReports";
import SalaryTracker from "views/Dashboard/SalaryTracker";
import POS from "views/Dashboard/POS";
import Invoices from "views/Dashboard/Invoices";
import CustomerProfile from "views/Dashboard/CustomerProfile";
import StaffProfile from "views/Dashboard/StaffProfile";
import StockItemDetail from "views/Dashboard/StockItemDetail";
import RentalManagement from "views/Dashboard/RentalManagement";
import SupplierManagement from "views/Dashboard/SupplierManagement";
import SupplierProfile from "views/Dashboard/SupplierProfile";
import SignIn from "views/Auth/SignIn.js";
import SignUp from "views/Auth/SignUp.js";

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
    path: "/pos",
    name: "POS",
    rtlName: "لوحة القيادة",
    icon: <CreditIcon color="inherit" />,
    component: POS,
    layout: "/admin",
  },
  {
    path: "/invoices",
    name: "Invoices",
    rtlName: "لوحة القيادة",
    icon: <DocumentIcon color="inherit" />,
    component: Invoices,
    layout: "/admin",
  },
  {
    path: "/customers/:id",
    name: "Customer Profile",
    rtlName: "لوحة القيادة",
    component: CustomerProfile,
    layout: "/admin",
    hidden: true,
  },
  {
    path: "/staff-management/:id",
    name: "Staff Profile",
    rtlName: "لوحة القيادة",
    component: StaffProfile,
    layout: "/admin",
    hidden: true,
  },
  // Detail route placed BEFORE list route so it matches first
  {
    path: "/stock-management/:id",
    name: "Stock Item Detail",
    rtlName: "لوحة القيادة",
    component: StockItemDetail,
    layout: "/admin",
    hidden: true,
  },
  {
    path: "/supplier-management/:id",
    name: "Supplier Profile",
    rtlName: "لوحة القيادة",
    component: SupplierProfile,
    layout: "/admin",
    hidden: true,
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
  },
  {
    path: "/rental-management",
    name: "Rental Management",
    rtlName: "لوحة القيادة",
    icon: <SettingsIcon color="inherit" />,
    component: RentalManagement,
    layout: "/admin",
  },
  {
    path: "/supplier-management",
    name: "Supplier Management",
    rtlName: "لوحة القيادة",
    icon: <SettingsIcon color="inherit" />,
    component: SupplierManagement,
    layout: "/admin",
  },
  {
    path: "/staff-management",
    name: "Staff Management",
    rtlName: "لوحة القيادة",
    icon: <PersonIcon color="inherit" />,
    component: StaffManagement,
    layout: "/admin",
  },
  {
    path: "/attendance-reports",
    name: "Attendance Reports",
    rtlName: "لوحة القيادة",
    icon: <StatsIcon color="inherit" />,
    component: AttendanceReports,
    layout: "/admin",
  },
  {
    path: "/salary-tracker",
    name: "Salary Tracker",
    rtlName: "لوحة القيادة",
    icon: <CreditIcon color="inherit" />,
    component: SalaryTracker,
    layout: "/admin",
  },

  {
    name: "ACCOUNT PAGES",
    category: "account",
    rtlName: "صفحات",
    state: "pageCollapse",
    views: [
      // {
      //   path: "/profile",
      //   name: "Profile",
      //   rtlName: "لوحة القيادة",
      //   icon: <PersonIcon color="inherit" />,
      //   secondaryNavbar: true,
      //   component: InProgress,
      //   layout: "/admin",
      // },
      {
        path: "/signin",
        name: "Sign In",
        rtlName: "لوحة القيادة",
        icon: <DocumentIcon color="inherit" />,
        component: SignIn,
        layout: "/auth",
        hideInSidebar: true,
      },
      {
        path: "/signup",
        name: "Sign Up",
        rtlName: "لوحة القيادة",
        icon: <RocketIcon color="inherit" />,
        secondaryNavbar: true,
        component: SignUp,
        layout: "/auth",
        hideInSidebar: true,
      },
    ],
  },
];
export default dashRoutes;
