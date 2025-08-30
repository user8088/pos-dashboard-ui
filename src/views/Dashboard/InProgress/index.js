// Chakra imports
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  VStack,
  keyframes,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
// Custom icons
import { RocketIcon } from "components/Icons/Icons.js";
import React from "react";
// react icons
import { BsArrowLeft } from "react-icons/bs";
import { useHistory } from "react-router-dom";

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

export default function InProgress() {
  const history = useHistory();
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Flex 
      minH="100vh"
      align="center"
      justify="center"
      px={4}
      py={8}
      w="100vw"
      h="100vh"
      position="fixed"
      top="0"
      left="0"
    >
      <Card 
        maxW="600px" 
        w="100%" 
        bg={cardBg} 
        border='1px solid' 
        borderColor={borderColor}
        boxShadow="0 20px 60px rgba(0, 0, 0, 0.1)"
        borderRadius="20px"
        overflow="hidden"
      >
        <CardBody p={{ base: "40px 24px", md: "60px 40px" }}>
          <VStack spacing="32px" textAlign="center" align="center" justify="center" w="100%" mx="auto">
            {/* Animated Icon */}
            <Box
              bg='brand.500'
              borderRadius='50%'
              p='24px'
              boxShadow='0 8px 32px rgba(255, 141, 40, 0.3)'
              animation={`${float} 3s ease-in-out infinite`}
            >
              <Icon 
                as={RocketIcon} 
                w='48px' 
                h='48px' 
                color='white'
                animation={`${pulse} 2s ease-in-out infinite`}
              />
            </Box>

            {/* Main Content */}
            <VStack spacing="16px">
              <Text 
                fontSize={{ base: '2xl', md: '3xl' }} 
                fontWeight='bold' 
                color={textColor}
                lineHeight="1.2"
              >
                Page Under Development
              </Text>
              
              <Text 
                fontSize={{ base: 'md', md: 'lg' }} 
                color='gray.500' 
                lineHeight="1.6"
                maxW="400px"
              >
                This page is currently being built. We're working hard to bring you something amazing!
              </Text>
            </VStack>

            {/* Back Button */}
            <Button
              bg='brand.500'
              color='white'
              _hover={{ 
                bg: 'brand.600',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(255, 141, 40, 0.4)'
              }}
              _active={{ bg: 'brand.700' }}
              px='32px'
              py='16px'
              borderRadius='12px'
              fontWeight='bold'
              fontSize="md"
              transition="all 0.3s ease"
              onClick={() => history.push('/admin/dashboard')}
              leftIcon={<BsArrowLeft />}
            >
              Back to Dashboard
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
}
