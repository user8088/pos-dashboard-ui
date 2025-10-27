// Import the existing stock management component
import Authors from "views/Dashboard/Tables/components/Authors";

const FactoryStockManagement = ({ title, captions, data }) => {
  // Use the existing Authors component but with Factory dashboard context
  return <Authors title={title} captions={captions} data={data} />;
};

export default FactoryStockManagement;
