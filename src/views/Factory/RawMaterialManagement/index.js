// Chakra imports
import { Flex } from "@chakra-ui/react";
import React from "react";
import RawMaterialTable from "./components/RawMaterialTable";

function RawMaterialManagement() {
  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <RawMaterialTable
        title={"Raw Material Management"}
        captions={["Raw Materials", "AMOUNT PER UNIT", "TOTAL PURCHASE COST", "STATUS", "AMOUNT PENDING", ""]}
      />
    </Flex>
  );
}

export default RawMaterialManagement;
