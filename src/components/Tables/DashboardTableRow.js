import {
  Avatar,
  AvatarGroup,
  Flex,
  Icon,
  Image,
  Progress,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import React from "react";

function DashboardTableRow(props) {
  const { logo, name, members, budget, progression } = props;
  const textColor = useColorModeValue("gray.700", "white");
  
  const fontSize = useBreakpointValue({ base: "xs", sm: "sm", md: "md" });
  const iconSize = useBreakpointValue({ base: "16px", sm: "20px", md: "24px" });
  
  // Check if logo is a string (image path) or component (icon)
  const isImagePath = typeof logo === 'string';
  
  return (
    <Tr>
      <Td w="250px" pl="0px">
        <Flex align="center" py={{ base: ".4rem", md: ".8rem" }} minWidth="100%" flexWrap="nowrap">
          {isImagePath ? (
            <Image 
              src={logo} 
              h={iconSize} 
              w={iconSize} 
              alt={name} 
              borderRadius="md"
            />
          ) : (
            <Icon 
              as={logo} 
              h={iconSize} 
              w={iconSize} 
              pe="5px" 
              color={useColorModeValue("gray.600", "gray.400")}
            />
          )}
          <Text
            ps={{ base: "6px", sm: "8px", md: "10px" }}
            fontSize={fontSize}
            color={textColor}
            fontWeight="bold"
            minWidth="100%"
          >
            {name}
          </Text>
        </Flex>
      </Td>

      <Td w="200px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold">
          {Array.isArray(members) ? members.join(', ') : members}
        </Text>
      </Td>
      <Td w="150px">
        <Text fontSize={fontSize} color={textColor} fontWeight="bold" textAlign="center" pb=".5rem">
          {budget}
        </Text>
      </Td>
      <Td w="180px">
        <Flex direction="column" align="center">
          <Text
            fontSize={fontSize}
            color="#FF8D28"
            fontWeight="bold"
            pb=".2rem"
            textAlign="center"
          >{`${progression}%`}</Text>
          <Progress
            colorScheme={progression <= 15 ? "red" :  "brand" }
            size="xs"
            value={progression}
            borderRadius="15px"
            w="100%"
          />
        </Flex>
      </Td>
    </Tr>
  );
}

export default DashboardTableRow;
