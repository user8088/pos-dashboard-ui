// Chakra imports
import { 
  Box, 
  Flex, 
  Text, 
  useColorModeValue, 
  Select,
  Wrap,
  WrapItem,
  Button
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import React from "react";
import { FaChevronDown } from "react-icons/fa";

const SalesOverview = ({ title, percentage, chart }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  
  const [timePeriod, setTimePeriod] = React.useState("today");
  const timePeriods = ["today", "week", "month", "year"];
  
  const getDisplayTimePeriod = (period) => {
    const displayMap = {
      "today": "Today",
      "week": "Week", 
      "month": "Month",
      "year": "Year"
    };
    return displayMap[period] || period;
  };
  
  const getPeriodLabel = () => {
    switch(timePeriod) {
      case "today": return "yesterday";
      case "week": return "last week";
      case "month": return "last month";
      case "year": return "last year";
      default: return "previous period";
    }
  };
  
  return (
    <Card p='28px 10px 16px 0px' mb={{ sm: "26px", lg: "0px" }}>
      <CardHeader mb='20px' pl='22px' pr='22px'>
        <Flex direction='column' w='100%' gap='16px'>
          <Flex justify='space-between' align='start' w='100%'>
            <Flex direction='column'>
              <Text fontSize='lg' color={textColor} fontWeight='bold' mb='6px'>
                {title}
              </Text>
              <Text fontSize='md' fontWeight='medium' color='gray.400'>
                <Text
                  as='span'
                  color={percentage > 0 ? "#FF8D28" : "red.400"}
                  fontWeight='bold'>
                  {percentage > 0 ? `+${percentage}%` : `${percentage}%`}
                </Text>{" "}
                from {getPeriodLabel()}
              </Text>
            </Flex>
          </Flex>
          
          {/* Desktop: Period Buttons */}
          <Wrap spacing='6px' display={{ base: "none", md: "flex" }}>
            {timePeriods.map((period) => (
              <WrapItem key={period}>
                <Button
                  size='xs'
                  variant={timePeriod === period ? 'solid' : 'outline'}
                  colorScheme='teal'
                  bg={timePeriod === period ? '#FF8D28' : 'transparent'}
                  color={timePeriod === period ? 'white' : '#FF8D28'}
                  borderColor='#FF8D28'
                  fontWeight='semibold'
                  px='12px'
                  _hover={{
                    bg: timePeriod === period ? '#E67E22' : 'rgba(255, 141, 40, 0.1)'
                  }}
                  onClick={() => setTimePeriod(period)}>
                  {getDisplayTimePeriod(period)}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
          
          {/* Mobile: Dropdown */}
          <Box display={{ base: "block", md: "none" }}>
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              size="sm"
              bg={cardBg}
              borderColor='#FF8D28'
              color='#FF8D28'
              fontWeight='semibold'
              icon={<FaChevronDown />}
            >
              {timePeriods.map((period) => (
                <option key={period} value={period}>
                  {getDisplayTimePeriod(period)}
                </option>
              ))}
            </Select>
          </Box>
        </Flex>
      </CardHeader>
      <Box w='100%' h={{ sm: "300px" }} ps='8px'>
        {chart}
      </Box>
    </Card>
  );
};

export default SalesOverview;
