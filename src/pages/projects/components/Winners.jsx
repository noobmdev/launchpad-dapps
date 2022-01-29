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
import React, { useEffect, useState } from "react";
import { formatAddress, _toString } from "utils";
import axiosInstance from "utils/axios";

const Winners = ({ slug }) => {
  const [winners, setWinners] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(4);

  useEffect(() => {
    (() => {
      axiosInstance
        .get(`/pools/${slug}/winners`)
        .then((res) => {
          const { data, total } = res.data;
          setWinners(data);
          setTotal(total);
        })
        .catch(console.error);
    })();
  }, []);

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
            {winners.map((winner, idx) => (
              <Tr key={idx}>
                <Td>{formatAddress(winner.account)}</Td>
                <Td>Tier {winner.tier}</Td>
                <Td isNumeric>{_toString(winner.allocation)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <HStack>
        {new Array(total).fill("").map((_, idx) => (
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
