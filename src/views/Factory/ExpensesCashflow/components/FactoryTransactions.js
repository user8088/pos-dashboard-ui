// This is a wrapper component that uses the existing Transactions component 
// but with factory-specific data and styling
import Transactions from "views/Dashboard/Billing/components/Transactions";

const FactoryTransactions = ({ title, date, newestTransactions, olderTransactions }) => {
  // Use the exact same component with factory data
  return (
    <Transactions
      title={title}
      date={date}
      newestTransactions={newestTransactions}
      olderTransactions={olderTransactions}
    />
  );
};

export default FactoryTransactions;
