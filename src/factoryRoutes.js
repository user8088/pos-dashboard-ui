// Factory dashboard routes
import FactoryDashboard from "views/Factory/Dashboard";
import ManufacturingReports from "views/Factory/ManufacturingReports";
import RawMaterialManagement from "views/Factory/RawMaterialManagement";
import Billing from "views/Dashboard/Billing";
import SupplierManagement from "views/Factory/SupplierManagement";
import Profile from "views/Dashboard/Profile";
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

var factoryRoutes = [
  {
    path: "/dashboard",
    name: "Factory Dashboard",
    rtlName: "لوحة القيادة",
    icon: <HomeIcon color="inherit" />,
    component: FactoryDashboard,
    layout: "/factory",
  },
  {
    path: "/manufacturing-reports",
    name: "Manufacturing Reports",
    rtlName: "تقارير التصنيع",
    icon: <DocumentIcon color="inherit" />,
    component: ManufacturingReports,
    layout: "/factory",
  },
  {
    path: "/raw-material-management",
    name: "Raw Material Management",
    rtlName: "إدارة المواد الخام",
    icon: <SettingsIcon color="inherit" />,
    component: RawMaterialManagement,
    layout: "/factory",
  },
  {
    path: "/supplier-management",
    name: "Supplier Management",
    rtlName: "إدارة الموردين",
    icon: <SettingsIcon color="inherit" />,
    component: SupplierManagement,
    layout: "/factory",
  },
  {
    path: "/expenses-cashflow",
    name: "Expenses & Cashflow",
    rtlName: "المصروفات والتدفق النقدي",
    icon: <CreditIcon color="inherit" />,
    component: Billing,
    layout: "/factory",
  },
  {
    name: "ACCOUNT PAGES",
    category: "account",
    rtlName: "صفحات",
    state: "pageCollapse",
    views: [
      {
        path: "/profile",
        name: "Profile",
        rtlName: "لوحة القيادة",
        icon: <PersonIcon color="inherit" />,
        component: Profile,
        layout: "/factory",
      },
      {
        path: "/signin",
        name: "Sign In",
        rtlName: "لوحة القيادة",
        icon: <DocumentIcon color="inherit" />,
        component: SignIn,
        layout: "/auth",
      },
      {
        path: "/signup",
        name: "Sign Up",
        rtlName: "لوحة القيادة",
        icon: <RocketIcon color="inherit" />,
        secondaryNavbar: true,
        component: SignUp,
        layout: "/auth",
      },
    ],
  },
];
export default factoryRoutes;
