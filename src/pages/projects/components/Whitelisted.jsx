import { Box, VStack } from "@chakra-ui/react";
import React, { useState } from "react";

const Whitelisted = ({ isWhitelisted }) => {
  return isWhitelisted ? (
    <VStack align="center" py="8" bg="green.50">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="24" fill="#C6F6D5" />
        <path
          d="M21.9997 27.172L31.1917 17.979L32.6067 19.393L21.9997 30L15.6357 23.636L17.0497 22.222L21.9997 27.172Z"
          fill="#25855A"
        />
      </svg>
      <Box fontSize="1.875em" fontWeight="semibold">
        Whitelisted
      </Box>
      <Box color="gray.500">
        Your wallet is whitelisted and you can join token sale.
      </Box>
    </VStack>
  ) : null;
};

export default Whitelisted;
