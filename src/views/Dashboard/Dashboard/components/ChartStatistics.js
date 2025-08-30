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
         <Flex direction='column' minH={{ base: '120px', sm: '140px', md: '160px', lg: '180px' }}>
       <Flex alignItems='center' mb={{ base: '8px', sm: '10px', md: '12px', lg: '14px' }}>
         <IconBox 
           as='box' 
           h={{ base: "24px", sm: "26px", md: "30px", lg: "32px" }} 
           w={{ base: "24px", sm: "26px", md: "30px", lg: "32px" }} 
           bg={iconTeal} 
           me={{ base: '4px', sm: '5px', md: '6px', lg: '8px' }}
         >
          {icon}
        </IconBox>
                 <Text 
           fontSize={{ base: 'xs', sm: 'sm', md: 'sm', lg: 'md' }} 
           color='gray.400' 
           fontWeight='semibold'
         >
           {title}
         </Text>
       </Flex>
       <Text 
         fontSize={{ base: 'md', sm: 'lg', md: 'lg', lg: 'xl' }} 
         color={textColor} 
         fontWeight='bold' 
         mb={{ base: '4px', sm: '5px', md: '6px', lg: '8px' }} 
         my={{ base: '4px', sm: '5px', md: '6px', lg: '8px' }}
         lineHeight='1.2'
       >
        {amount}
      </Text>
             {category && (
         <Text 
           fontSize={{ base: 'xs', sm: 'sm', md: 'sm', lg: 'md' }} 
           color='gray.400' 
           fontWeight='normal' 
           mb={{ base: '3px', sm: '4px', md: '4px', lg: '6px' }}
           lineHeight='1.3'
         >
           {category}
         </Text>
       )}
       {changeIndicator && (
         <Text 
           fontSize={{ base: 'xs', sm: 'sm', md: 'sm', lg: 'md' }} 
           color={changeColor} 
           fontWeight='normal' 
           mb={{ base: '3px', sm: '4px', md: '4px', lg: '6px' }}
           lineHeight='1.3'
         >
           {changeIndicator}
         </Text>
       )}
             <Progress
         colorScheme='brand'
         borderRadius='12px'
         h={{ base: '4px', sm: '5px', md: '5px', lg: '6px' }}
         value={percentage}
         mt='auto'
       />
    </Flex>
  );
};

export default ChartStatistics;
