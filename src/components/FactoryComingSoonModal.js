// Chakra imports
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
// react icons
import { BsArrowLeft } from "react-icons/bs";

export default function FactoryComingSoonModal({ isOpen, onClose }) {
  const textColor = useColorModeValue("gray.700", "white");
  const cardBg = useColorModeValue("white", "gray.700");
  const brandColor = useColorModeValue("brand.500", "brand.400");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom">
      <ModalOverlay bg='rgba(0,0,0,0.4)' backdropFilter='blur(6px)' />
      <ModalContent bg={cardBg} borderRadius="24px" maxW="600px">
        <ModalHeader color={textColor} fontSize={{ base: 'xl', md: '2xl' }}>
          Factory Dashboard is Being Uploaded
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing="24px" textAlign="center" align="center" justify="center" w="100%">
            <VStack spacing="16px" maxW="500px">
              <Text 
                fontSize={{ base: 'md', md: 'lg' }} 
                color='gray.500' 
                lineHeight="1.7"
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
        </ModalBody>
        <ModalFooter justifyContent="center" pt={0} pb={6}>
          <VStack spacing="12px" w="100%">
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
              onClick={onClose}
              leftIcon={<BsArrowLeft />}
              size="lg"
              w={{ base: "100%", md: "auto" }}
            >
              Close
            </Button>
            
            <Text 
              fontSize="xs" 
              color='gray.400'
            >
              Check back in a few moments
            </Text>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

