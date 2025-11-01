// Chakra imports
import { Flex } from "@chakra-ui/react";
import React from "react";
import FactoryStockTable from "./components/FactoryStockTable";

function StockManagement() {
  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <FactoryStockTable
        title={"Stock Management"}
        captions={["Products", "Sell Unit", "Inventory Unit", "Category", "Status", "Manufacturing Cost", "Selling Price", ""]}
      />
    </Flex>
  );
}

export default StockManagement;

