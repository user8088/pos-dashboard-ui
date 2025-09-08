// This is a wrapper component that uses the existing BillingInformation component
// but with factory-specific data and styling
import BillingInformation from "views/Dashboard/Billing/components/BillingInformation";

const FactoryBillingInformation = ({ title, data }) => {
  // Use the exact same component with factory data
  return <BillingInformation title={title} data={data} />;
};

export default FactoryBillingInformation;
