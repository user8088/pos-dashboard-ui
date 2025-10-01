/*eslint-disable*/
import React from "react";
import { Flex, Link, List, ListItem, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

export default function Footer(props) {
  return (
    <Flex
      flexDirection={{
        base: "column",
        xl: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent="space-between"
      px="30px"
      pb="20px"
      pt="10px"
    >
      <Text
        color="gray.400"
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", xl: "0px" }}
      >
        &copy; {new Date().getFullYear()}{" "}
        <Link
          color="#FF8D28"
          href="https://tekhatch.com"
          target="_blank"
          fontWeight="semibold"
          _hover={{ color: "#E67E22", textDecoration: "underline" }}
        >
          Tekhatch
        </Link>
        {". All rights reserved."}
      </Text>
      <List display="flex">
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}
        >
          <Link 
            color="gray.400" 
            href="https://tekhatch.com"
            _hover={{ color: "#FF8D28" }}
          >
            About
          </Link>
        </ListItem>
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}
        >
          <Link 
            color="gray.400" 
            href="https://tekhatch.com/privacy"
            _hover={{ color: "#FF8D28" }}
          >
            Privacy
          </Link>
        </ListItem>
        <ListItem>
          <Link
            color="gray.400"
            href="https://tekhatch.com/terms"
            _hover={{ color: "#FF8D28" }}
          >
            Terms
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
