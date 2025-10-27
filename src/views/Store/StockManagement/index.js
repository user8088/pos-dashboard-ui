// Import the existing stock management component
import Authors from "views/Dashboard/Tables/components/Authors";

const StoreStockManagement = ({ title, captions, data }) => {
  // Use the existing Authors component but with Store dashboard context
  return <Authors title={title} captions={captions} data={data} />;
};

export default StoreStockManagement;
