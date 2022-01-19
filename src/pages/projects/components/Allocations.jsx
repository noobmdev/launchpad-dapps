import { Box, Button, HStack, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { formatEther } from "ethers/lib/utils";
import { ONE_HUNDRED_PERCENT, POOL_STATUSES } from "configs";
import { Link } from "react-router-dom";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import { getClaimStatistics } from "utils/callContract";
import { useMemo } from "react";
import { BigNumber } from "ethers";
import { formatTime } from "utils";

const Allocations = ({ pool }) => {
  const poolId = pool.pid;
  const { account, library } = useActiveWeb3React();

  const [claimStatistics, setClaimStatistics] = useState();

  useEffect(() => {
    (() => {
      if (!account || !library || isNaN(poolId)) return;
      getClaimStatistics(library, poolId, account)
        .then(setClaimStatistics)
        .catch(console.error);
    })();
  }, [account, library]);

  const currentBatchStatus = useMemo(() => {
    if (!pool || !claimStatistics) return;
    const currentBatch = pool.claimBatches[claimStatistics.currentBatch];
    if (!currentBatch?.timestamp || !currentBatch?.percent) return;
    const date = +pool.startTimeClaim + currentBatch.timestamp;
    const claimableInBatch = claimStatistics.claimable
      .mul(BigNumber.from(currentBatch.percent))
      .div(BigNumber.from(ONE_HUNDRED_PERCENT));
    return { date, claimableInBatch };
  }, [pool, claimStatistics]);

  const renderButtonTxt = (status) => {
    const value = status.value;
    switch (value) {
      case POOL_STATUSES.register.value:
        return "Go to Register";
      case POOL_STATUSES.deposit.value:
        return "Go to Deposit";
      case POOL_STATUSES.claim.value:
        return "Go to Claim";
      default:
        return "Not available";
    }
  };

  return (
    <VStack
      align="stretch"
      px="8"
      py="6"
      border="1px solid #E2E8F0"
      borderRadius="md"
      spacing="4"
    >
      <Box>
        <Box color="gray.600">{pool?.tokenA?.symbol}</Box>
        <Box fontSize="1.875em" fontWeight="semibold">
          {pool?.tokenA?.name}
        </Box>
      </Box>
      <HStack>
        <Button bg="black" size="xs" color="white">
          APPROVED
        </Button>
        <Button size="xs" variant="outline">
          BSC
        </Button>
      </HStack>
      <HStack justify="space-between">
        <Box>Available Now</Box>
        <Box color="gray,500">
          {claimStatistics?.claimable?.toString()
            ? formatEther(claimStatistics.claimable.toString())
            : "0.0"}{" "}
          {pool?.tokenA?.symbol}
        </Box>
      </HStack>
      <HStack justify="space-between">
        <Box>Claimed</Box>
        <Box color="gray,500">
          {claimStatistics?.claimed?.toString()
            ? formatEther(claimStatistics.claimed.toString())
            : "0.0"}{" "}
          {pool?.tokenA?.symbol}
        </Box>
      </HStack>
      <HStack justify="space-between">
        <Box>Claimable in Batch</Box>
        <Box color="gray,500">
          {" "}
          {currentBatchStatus?.claimableInBatch?.toString()
            ? formatEther(currentBatchStatus.claimableInBatch.toString())
            : "0.0"}{" "}
          {pool?.tokenA?.symbol}
        </Box>
      </HStack>

      <HStack justify="space-between">
        <Box>Date</Box>
        <Box color="gray.500" fontSize="sm">
          {!!pool.status &&
          pool.status.value === POOL_STATUSES.claim.value &&
          currentBatchStatus?.date
            ? formatTime(currentBatchStatus.date)
            : "N/A"}
        </Box>
      </HStack>

      <Link to={`/projects/${pool.slug}`}>
        <Button
          w="100%"
          color="white"
          borderRadius="md"
          bg="green.300"
          _hover={{
            bg: "green.200",
          }}
        >
          {renderButtonTxt(pool.status)}
        </Button>
      </Link>
    </VStack>
  );
};

export default Allocations;
