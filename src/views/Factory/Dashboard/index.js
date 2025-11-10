// Chakra imports
import {
  Flex,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import FactoryComingSoonModal from "components/FactoryComingSoonModal";

export default function FactoryDashboard() {
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  React.useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Flex flexDirection='column' pt={{ base: "120px", md: "75px" }}>
      <FactoryComingSoonModal isOpen={isOpen} onClose={onClose} />
      <Flex
        minH='60vh'
        align='center'
        justify='center'
        direction='column'
        gap='12px'
      >
        <Text fontSize='xl' fontWeight='bold' color={textColor}>
          Factory Dashboard uploading soon
        </Text>
        <Text color='gray.500' maxW='420px' textAlign='center'>
          We're setting things up for factory operations. Once the deployment finishes,
          you'll get access to production metrics, manufacturing insights, and supplier workflows here.
        </Text>
      </Flex>
    </Flex>
  );
}
