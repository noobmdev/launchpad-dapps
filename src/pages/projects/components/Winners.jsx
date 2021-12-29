import {
  Box,
  HStack,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useState } from "react";

const Winners = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(4);
  const [perPage, setPerPage] = useState(4);

  return (
    <VStack spacing="4" align="stretch">
      <Input placeholder="Search address" bg="gray.100" />

      <Box border="1px solid #E2E8F0" borderRadius="md" p="3">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ADDRESS</Th>
              <Th>TIER</Th>
              <Th w="50%" isNumeric>
                ALLOCATION
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {new Array(perPage).fill("").map((_, idx) => (
              <Tr key={idx}>
                <Td>0x51D2...2d8eEb7B38 </Td>
                <Td>Tier 1</Td>
                <Td isNumeric>529.411764</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <HStack>
        {new Array(totalItems).fill("").map((_, idx) => (
          <Box
            key={idx}
            px="0.75em"
            py="0.375em"
            border="1px solid #E2E8F0"
            borderRadius="md"
            cursor="pointer"
            bg={currentPage === idx ? "blackAlpha.900" : "white"}
            color={currentPage === idx ? "white" : "blackAlpha.900"}
            onClick={() => setCurrentPage(idx)}
          >
            {idx + 1}
          </Box>
        ))}
      </HStack>
    </VStack>
  );
};

export default Winners;
