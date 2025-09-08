// This is a wrapper component that uses the existing Invoices component
// but with factory-specific data and styling
import Invoices from "views/Dashboard/Billing/components/Invoices";

const FactoryInvoices = ({ title, data }) => {
  // Use the exact same component with factory data
  return <Invoices title={title} data={data} />;
};

export default FactoryInvoices;
