// Chakra imports
import {
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import StockTableRow from "components/Tables/StockTableRow";
import React from "react";
import logo from "assets/img/avatars/placeholder.png";

const Authors = ({ title, captions, data }) => {
  const textColor = useColorModeValue("gray.700", "white");
  
  // Stock management data based on the image
  const stockData = [
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Construction Material",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "Out of Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Electrical Accessories",
      status: "Low Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Construction Material",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Construction Material",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "200 Kilograms",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    },
    {
      logo: logo,
      name: "Tools & Hardware",
      quantity: "800 Units",
      category: "Electrical Accessories",
      status: "In Stock",
      stockValue: "PKR.15,000"
    }
  ];

  // Stock management captions
  const stockCaptions = ["Products", "QUANTITY PER UNIT", "CATEGORY", "STATUS", "Stock Value", ""];

  return (
    <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Text fontSize='xl' color={textColor} fontWeight='bold'>
          Stock Management
        </Text>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead>
            <Tr my='.8rem' pl='0px' color='gray.400'>
              {stockCaptions.map((caption, idx) => {
                return (
                  <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>
                    {caption}
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {stockData.map((row, index) => {
              return (
                <StockTableRow
                  key={`${row.name}-${index}`}
                  logo={row.logo}
                  name={row.name}
                  quantity={row.quantity}
                  category={row.category}
                  status={row.status}
                  stockValue={row.stockValue}
                />
              );
            })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default Authors;
