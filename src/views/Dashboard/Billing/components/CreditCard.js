// Chakra imports
import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import React from "react";

const CreditCard = ({
  backgroundImage,
  title,
  icon,
  number,
  validity,
  cvv,
  allocatedTotal, // legacy: sum of allocated balances (optional)
  totalRevenue,   // preferred: total revenue number (optional)
  accountsTotal,  // preferred: sum of all account balances (optional)
  showUnallocated, // when true, shows the Unallocated line
}) => {
  return (
    <Card
      backgroundImage={backgroundImage}
      backgroundRepeat='no-repeat'
      background='cover'
      bgPosition='10%'
      p='16px'
      h={{ sm: "220px", xl: "100%" }}
      gridArea={{ md: "1 / 1 / 2 / 3", xl: "1 / 1 / 2 / 3" }}>
      <CardBody h='100%' w='100%'>
        <Flex
          direction='column'
          color='white'
          h='100%'
          p='0px 10px 20px 10px'
          w='100%'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='md' fontWeight='bold'>
              {title}
            </Text>
            {icon}
          </Flex>
          <Spacer />
          <Flex direction='column'>
            <Box>
              <Text fontSize='xl' letterSpacing='2px' fontWeight='bold'>
                {number}
              </Text>
            </Box>
            {showUnallocated && ((totalRevenue !== undefined && accountsTotal !== undefined) || (allocatedTotal !== undefined)) ? (
              <Box mt='6px'>
                <Text fontSize='xs' opacity={0.9}>Unallocated</Text>
                <Text fontSize='sm' fontWeight='bold'>
                  {(() => {
                    // Preferred: unallocated = totalRevenue - accountsTotal
                    if (totalRevenue !== undefined && accountsTotal !== undefined) {
                      const tr = parseFloat(totalRevenue || 0);
                      const at = parseFloat(accountsTotal || 0);
                      const unalloc = Math.max(0, tr - at);
                      return `PKR. ${unalloc.toLocaleString()}`;
                    }
                    // Back-compat: derive from displayed number and allocatedTotal
                    const totalStr = String(number).replace(/[^0-9.]/g, '');
                    const total = parseFloat(totalStr || 0);
                    const allocated = parseFloat(allocatedTotal || 0);
                    const unalloc = Math.max(0, total - allocated);
                    return `PKR. ${unalloc.toLocaleString()}`;
                  })()}
                </Text>
              </Box>
            ) : null}
            <Flex mt='14px'>
              <Flex direction='column' me='34px'>
                <Text fontSize='xs'>{validity.name}</Text>
                <Text fontSize='xs' fontWeight='bold'>
                  {validity.date}
                </Text>
              </Flex>
              <Flex direction='column'>
                <Text fontSize='xs'>{cvv.name}</Text>
                <Text fontSize='xs' fontWeight='bold'>
                  {cvv.code}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default CreditCard;
