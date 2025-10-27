// Factory dashboard routes
import FactoryDashboard from "views/Factory/Dashboard";
import ManufacturingReports from "views/Factory/ManufacturingReports";
import RawMaterialManagement from "views/Factory/RawMaterialManagement";
import Billing from "views/Factory/Billing";
import SupplierManagement from "views/Factory/SupplierManagement";
import Profile from "views/Dashboard/Profile";
import SignIn from "views/Auth/SignIn.js";
import SignUp from "views/Auth/SignUp.js";
import FactoryStockManagement from "views/Factory/StockManagement";
import FactoryCustomerManagement from "views/Factory/CustomerManagement";
import FactoryCustomerProfile from "views/Factory/CustomerProfile";
import FactorySalesAnalytics from "views/Factory/SalesAnalytics";
import FactoryTransportManagement from "views/Factory/TransportManagement";
import FactoryUnitConversionManagement from "views/Factory/UnitConversionManagement";

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
    path: "/stock-management",
    name: "Stock Management",
    rtlName: "إدارة المخزون",
    icon: <SettingsIcon color="inherit" />,
    component: FactoryStockManagement,
    layout: "/factory",
  },
  {
    path: "/customer-management",
    name: "Customer Management",
    rtlName: "إدارة العملاء",
    icon: <PersonIcon color="inherit" />,
    component: FactoryCustomerManagement,
    layout: "/factory",
  },
  {
    path: "/sales-analytics",
    name: "Sales & Analytics",
    rtlName: "المبيعات والتحليلات",
    icon: <StatsIcon color="inherit" />,
    component: FactorySalesAnalytics,
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
    path: "/manufacturing-reports",
    name: "Manufacturing Reports",
    rtlName: "تقارير التصنيع",
    icon: <DocumentIcon color="inherit" />,
    component: ManufacturingReports,
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
    path: "/transport-management",
    name: "Transport Management",
    rtlName: "إدارة النقل",
    icon: <RocketIcon color="inherit" />,
    component: FactoryTransportManagement,
    layout: "/factory",
  },
  {
    path: "/expenses-cashflow",
    name: "Expenses & Cashflow",
    rtlName: "المصروفات والتدفق النقدي",
    icon: <CreditIcon color="inherit" />,
    component: Billing,
    layout: "/factory",
    adminOnly: true,
  },
  {
    path: "/unit-conversion-management",
    name: "Unit Conversion Management",
    rtlName: "إدارة تحويل الوحدات",
    icon: <DocumentIcon color="inherit" />,
    component: FactoryUnitConversionManagement,
    layout: "/factory",
    adminOnly: true,
  },
  // Profile route (visible in sidebar)
  {
    path: "/profile",
    name: "Profile",
    rtlName: "لوحة القيادة",
    icon: <PersonIcon color="inherit" />,
    component: Profile,
    layout: "/factory",
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
    layout: "/auth",
    hidden: true,
  },
];
export default factoryRoutes;
