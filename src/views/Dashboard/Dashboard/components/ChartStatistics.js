import { Flex, Progress, Text, useColorModeValue } from "@chakra-ui/react";
import IconBox from "components/Icons/IconBox";
import React from "react";

const ChartStatistics = ({ title, amount, icon, percentage, category, changeIndicator, changeType }) => {
  const iconTeal = useColorModeValue("#FF8D28", "#FF8D28");
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const overlayRef = React.useRef();
  
  // Determine change indicator color based on changeType
  const changeColor = changeType === 'positive' ? 'green.400' : changeType === 'negative' ? 'red.400' : 'gray.400';
  
  return (
    <Flex direction='column'>
      <Flex alignItems='center'>
        <IconBox as='box' h={"30px"} w={"30px"} bg={iconTeal} me='6px'>
          {icon}
        </IconBox>
        <Text fontSize='sm' color='gray.400' fontWeight='semibold'>
          {title}
        </Text>
      </Flex>
      <Text fontSize='lg' color={textColor} fontWeight='bold' mb='6px' my='6px'>
        {amount}
      </Text>
      {category && (
        <Text fontSize='sm' color='gray.400' fontWeight='normal' mb='4px'>
          {category}
        </Text>
      )}
      {changeIndicator && (
        <Text fontSize='sm' color={changeColor} fontWeight='normal' mb='4px'>
          {changeIndicator}
        </Text>
      )}
      <Progress
        colorScheme='brand'
        borderRadius='12px'
        h='5px'
        value={percentage}
      />
    </Flex>
  );
};

export default ChartStatistics;
