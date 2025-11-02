// Chakra imports
import {
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import React from "react";
// react icons
import { BsArrowLeft } from "react-icons/bs";
import { useHistory } from "react-router-dom";

export default function FactoryDashboardComingSoon() {
  const history = useHistory();
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const brandColor = useColorModeValue("brand.500", "brand.400");

  return (
    <Flex 
      flexDirection='column' 
      pt={{ base: "120px", md: "75px" }}
      align="center"
      justify="center"
      minH="calc(100vh - 120px)"
      px={4}
      py={8}
    >
      <Card 
        maxW="700px" 
        w="100%" 
        bg={cardBg} 
        border='1px solid' 
        borderColor={borderColor}
        boxShadow="0 25px 70px rgba(0, 0, 0, 0.15)"
        borderRadius="24px"
        overflow="hidden"
      >
        <CardBody p={{ base: "48px 32px", md: "64px 48px" }}>
          <VStack spacing="40px" textAlign="center" align="center" justify="center" w="100%" mx="auto">
            {/* Main Content */}
            <VStack spacing="24px" maxW="500px">
              <Text 
                fontSize={{ base: '2xl', md: '4xl' }} 
                fontWeight='bold' 
                color={textColor}
                lineHeight="1.2"
                letterSpacing="-0.5px"
              >
                Factory Dashboard is Being Uploaded
              </Text>
              
              <VStack spacing="16px">
                <Text 
                  fontSize={{ base: 'md', md: 'lg' }} 
                  color='gray.500' 
                  lineHeight="1.7"
                  maxW="450px"
                >
                  We're currently deploying the Factory Dashboard to production. 
                  It will be live shortly!
                </Text>
                
                <Box
                  display="inline-flex"
                  alignItems="center"
                  gap="12px"
                  px="20px"
                  py="12px"
                  bg={useColorModeValue("brand.50", "brand.900")}
                  borderRadius="12px"
                  border="1px solid"
                  borderColor={useColorModeValue("brand.200", "brand.700")}
                >
                  <Spinner 
                    size="md" 
                    color={brandColor}
                    thickness="3px"
                  />
                  <Text 
                    fontSize="sm" 
                    color={useColorModeValue("brand.700", "brand.300")}
                    fontWeight="500"
                  >
                    Uploading to Production...
                  </Text>
                </Box>
              </VStack>
            </VStack>

            {/* Action Buttons */}
            <VStack spacing="16px" w="100%" pt="8px">
              <Button
                bg={brandColor}
                color='white'
                _hover={{ 
                  bg: 'brand.600',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(255, 141, 40, 0.4)'
                }}
                _active={{ bg: 'brand.700', transform: 'translateY(0px)' }}
                px='40px'
                py='20px'
                borderRadius='16px'
                fontWeight='bold'
                fontSize="md"
                transition="all 0.3s ease"
                onClick={() => history.push('/admin/dashboard')}
                leftIcon={<BsArrowLeft />}
                size="lg"
                w={{ base: "100%", md: "auto" }}
              >
                Back to Store Dashboard
              </Button>
              
              <Text 
                fontSize="xs" 
                color='gray.400'
                mt="4px"
              >
                Check back in a few moments
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );
}

