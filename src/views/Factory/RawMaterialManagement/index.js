// Chakra imports
import { Flex } from "@chakra-ui/react";
import React from "react";
import RawMaterialTable from "./components/RawMaterialTable";

function RawMaterialManagement() {
  return (
    <Flex 
      direction='column' 
      pt={{ base: "120px", md: "75px" }}
      w="100%"
      maxW="100%"
    >
      <RawMaterialTable
        title={"Raw Material Management"}
        captions={["Raw Materials", "QUANTITY", "COST PER UNIT", "TOTAL PURCHASE COST", "BILL NUMBER", "PAYMENT METHOD", "SUPPLIER", "STATUS", "WASTE QTY", "LOSS COST", "AMOUNT PENDING", ""]}
      />
    </Flex>
  );
}

export default RawMaterialManagement;
