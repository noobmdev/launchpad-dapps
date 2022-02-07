import {
  Box,
  Button,
  Grid,
  HStack,
  useToast,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { ONE_HUNDRED_PERCENT, POOL_STATUSES } from "configs";
import { GlobalContext } from "context/GlobalContext";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import { usePool } from "hooks/useFetch";
import React, { useContext } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getTimeRemaining, formatTime } from "utils";
import {
  claimPendingToken,
  getClaimStatistics,
  getWhitelisted,
} from "utils/callContract";
import Description from "./components/Description";
import TokenSale from "./components/TokenSale";
import Whitelisted from "./components/Whitelisted";
import Winners from "./components/Winners";

const ProjectInfo = {
  desc: "Description",
  winners: "Winners",
  tokenSale: "Token Sale",
};

const DetailProject = () => {
  const { account, library } = useActiveWeb3React();
  const { slug } = useParams();
  const toast = useToast();
  const { pool, isLoading } = usePool(slug);

  const poolId = pool?.pid;

  const [selectedInfo, setSelectedInfo] = useState(ProjectInfo.desc);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState();
  const [claimStatistics, setClaimStatistics] = useState();
  const [currentTimestamp, setCurrentTimestamp] = useState();
  const [claiming, setCLaiming] = useState(false);

  useEffect(() => {
    (async () => {
      if (!account || !library || isNaN(poolId)) return;
      try {
        const [isWhitelisted, _] = await Promise.all([
          getWhitelisted(library, poolId, account),
          handleGetClaimStatistics(),
        ]);
        setIsWhitelisted(isWhitelisted);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [account, library, poolId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = Math.floor(Date.now() / 1e3);
      setCurrentTimestamp(current);
      if (!pool?.status?.value) return;
      let timeRemaining;
      switch (pool.status.value) {
        case POOL_STATUSES.register.value:
          if (+pool.startTimeSwapFrom != 0)
            timeRemaining = getTimeRemaining(pool.startTimeSwapFrom);
          break;
        case POOL_STATUSES.deposit.value:
          timeRemaining = getTimeRemaining(
            +pool.startTimeSwapFrom + pool.startTimeSwapDuration
          );
          break;
        case POOL_STATUSES.claim.value:
          // console.log(pool);
          break;
        default:
          break;
      }
      timeRemaining === null
        ? setTimeRemaining(undefined)
        : timeRemaining && setTimeRemaining(timeRemaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [pool]);

  const currentBatchStatus = useMemo(() => {
    if (!pool || !claimStatistics) return;
    const currentBatch = pool.claimBatches[claimStatistics.currentBatch];
    if (!currentBatch?.timestamp || !currentBatch?.claimPercent) return;
    const date = pool.startTimeClaim + currentBatch.timestamp;
    const claimableInBatch = claimStatistics.claimable
      .mul(BigNumber.from(currentBatch.claimPercent))
      .div(BigNumber.from(ONE_HUNDRED_PERCENT));
    return { date, claimableInBatch };
  }, [pool, claimStatistics]);

  const handleGetClaimStatistics = async () => {
    if (!account || !library || isNaN(poolId)) return;
    try {
      const claimStatistics = await getClaimStatistics(
        library,
        poolId,
        account
      );
      setClaimStatistics(claimStatistics);
    } catch (error) {
      throw error;
    }
  };

  const renderProjectInfo = () => {
    switch (selectedInfo) {
      case ProjectInfo.desc:
        return <Description />;

      case ProjectInfo.winners:
        return <Winners slug={slug} />;

      case ProjectInfo.tokenSale:
        return <TokenSale />;

      default:
        return;
    }
  };

  const renderStartTime = (status) => {
    let time;
    if (!pool) return;
    switch (status) {
      case POOL_STATUSES.register.value:
        time = pool.startTime;
        break;
      case POOL_STATUSES.deposit.value:
        time = pool.startTimeSwapFrom;
        break;
      case POOL_STATUSES.claim.value:
        time = pool.startTimeClaim;
        break;
      default:
        return;
    }
    return formatTime(time); //10:00 AM UTC 25 Nov 2021
  };

  const canClaim = (claimTime) => {
    if (!claimTime || !currentTimestamp || !account) return false;
    return claimTime <= currentTimestamp;
  };

  const handleClaim = async (poolId) => {
    if (!account || !library || isNaN(poolId)) return;
    try {
      setCLaiming(true);
      await claimPendingToken(library, poolId, account);
      handleGetClaimStatistics();
      setCLaiming(false);
    } catch (error) {
      typeof error.data?.message === "string" &&
        toast({
          title: "Transaction Error",
          description: error.data.message.replace("execution reverted: ", ""),
          status: "warning",
          duration: 5000,
          isClosable: true,
        });

      setCLaiming(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <HStack spacing="6" align="flex-start">
      <VStack flex="1" align="stretch" spacing="6">
        <Box>
          <Whitelisted isWhitelisted={isWhitelisted} />
          <HStack justify="space-between">
            <Box
              fontSize="3em"
              fontWeight="semibold"
              textTransform="capitalize"
            >
              {pool.name}
            </Box>
            <HStack>
              <Box cursor="pointer">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.75 17.75H26.75L19.25 29V22.25H14L20.75 11V17.75ZM19.25 19.25V16.415L16.649 20.75H20.75V24.0455L23.9473 19.25H19.25Z"
                    fill="#2D3748"
                  />
                  <rect
                    x="0.5"
                    y="0.5"
                    width="39"
                    height="39"
                    rx="19.5"
                    stroke="#E2E8F0"
                  />
                </svg>
              </Box>

              <Box cursor="pointer">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.5 13.25H21.5C23.0913 13.25 24.6174 13.8821 25.7426 15.0074C26.8679 16.1326 27.5 17.6587 27.5 19.25C27.5 20.8413 26.8679 22.3674 25.7426 23.4926C24.6174 24.6179 23.0913 25.25 21.5 25.25V27.875C17.75 26.375 12.5 24.125 12.5 19.25C12.5 17.6587 13.1321 16.1326 14.2574 15.0074C15.3826 13.8821 16.9087 13.25 18.5 13.25ZM20 23.75H21.5C22.0909 23.75 22.6761 23.6336 23.2221 23.4075C23.768 23.1813 24.2641 22.8498 24.682 22.432C25.0998 22.0141 25.4313 21.518 25.6575 20.9721C25.8836 20.4261 26 19.8409 26 19.25C26 18.6591 25.8836 18.0739 25.6575 17.5279C25.4313 16.982 25.0998 16.4859 24.682 16.068C24.2641 15.6502 23.768 15.3187 23.2221 15.0925C22.6761 14.8664 22.0909 14.75 21.5 14.75H18.5C17.3065 14.75 16.1619 15.2241 15.318 16.068C14.4741 16.9119 14 18.0565 14 19.25C14 21.9575 15.8465 23.7245 20 25.61V23.75Z"
                    fill="#2D3748"
                  />
                  <rect
                    x="0.5"
                    y="0.5"
                    width="39"
                    height="39"
                    rx="19.5"
                    stroke="#E2E8F0"
                  />
                </svg>
              </Box>

              <Box cursor="pointer">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.75 17.75H26.75L19.25 29V22.25H14L20.75 11V17.75ZM19.25 19.25V16.415L16.649 20.75H20.75V24.0455L23.9473 19.25H19.25Z"
                    fill="#2D3748"
                  />
                  <rect
                    x="0.5"
                    y="0.5"
                    width="39"
                    height="39"
                    rx="19.5"
                    stroke="#E2E8F0"
                  />
                </svg>
              </Box>
            </HStack>
          </HStack>
          <Box maxW="36em" color="gray.500">
            {pool.summary}
          </Box>
        </Box>

        <HStack>
          <Button bg="gray.900" color="white" size="sm">
            PUBLIC
          </Button>
          <Button variant="outline" size="sm">
            BSC
          </Button>
        </HStack>

        <Grid templateColumns="repeat(3,1fr)" gap="8">
          {Object.keys(POOL_STATUSES).map((k, idx) => (
            <Box
              key={idx}
              flex="1"
              borderTop="4px solid"
              borderColor={
                pool.status?.value &&
                pool.status.value >= POOL_STATUSES[k].value
                  ? "gray.900"
                  : "gray.200"
              }
            >
              <Box fontWeight="semibold">{POOL_STATUSES[k].name}</Box>
              <Box fontSize="0.75em">
                {renderStartTime(POOL_STATUSES[k].value)}
              </Box>
            </Box>
          ))}
        </Grid>

        {pool?.status?.value === POOL_STATUSES.claim.value && (
          <Box>
            <Box fontSize="1.875em" fontWeight="semibold" pb="2">
              Vesting
            </Box>

            <VStack align="stretch">
              {pool.claimBatches &&
                pool.claimBatches?.map((claimBatch, idx) => (
                  <VStack
                    key={idx}
                    align="stretch"
                    spacing="3"
                    px="8"
                    py="5"
                    border="1px solid #E2E8F0"
                    borderRadius="md"
                    pos="relative"
                  >
                    <Box
                      pos="absolute"
                      left="0"
                      top="8"
                      transform="translateX(-50%)"
                    >
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          width="40"
                          height="40"
                          rx="20"
                          fill={
                            canClaim(claimBatch.timestamp + pool.startTimeClaim)
                              ? "#C6F6D5"
                              : "#EDF2F7"
                          }
                        />
                        <path
                          d="M17.9997 23.172L27.1917 13.979L28.6067 15.393L17.9997 26L11.6357 19.636L13.0497 18.222L17.9997 23.172Z"
                          fill={
                            canClaim(claimBatch.timestamp + pool.startTimeClaim)
                              ? "#25855A"
                              : "#A0AEC0"
                          }
                        />
                      </svg>
                    </Box>
                    <Box>
                      <Box color="gray.900" fontSize="1.125em" fontWeight="500">
                        {((claimBatch.claimPercent ?? 0) / 1e3).toFixed(2)}%{" "}
                        {canClaim(claimBatch.timestamp + pool.startTimeClaim) &&
                          "- Congratulations"}
                      </Box>
                      <Box color="gray.500" fontSize="0.875em">
                        {formatTime(claimBatch.timestamp + pool.startTimeClaim)}
                      </Box>
                    </Box>
                    {account && claimStatistics?.currentBatch === idx && (
                      <>
                        {" "}
                        <HStack spacing="4">
                          <Box
                            flex="1"
                            color="gray.700"
                            p="6"
                            border="1px solid #E2E8F0"
                            borderRadius="md"
                          >
                            <Box fontSize="0.875em" fontWeight="500">
                              AVAILABLE
                            </Box>
                            <Box fontSize="1.5em" fontWeight="600">
                              {claimStatistics?.claimable
                                ? formatEther(
                                    claimStatistics.claimable.toString()
                                  )
                                : "0.0"}{" "}
                              MARS
                            </Box>
                            {/* <Box>100.00%</Box> */}
                          </Box>
                          <Box
                            flex="1"
                            color="gray.700"
                            p="6"
                            border="1px solid #E2E8F0"
                            borderRadius="md"
                          >
                            <Box fontSize="0.875em" fontWeight="500">
                              CLAIMABLE IN BATCH
                            </Box>
                            <Box fontSize="1.5em" fontWeight="600">
                              {currentBatchStatus?.claimableInBatch?.toString()
                                ? formatEther(
                                    currentBatchStatus.claimableInBatch.toString()
                                  )
                                : "0.0"}{" "}
                              MARS
                            </Box>
                            {/* <Box>100.00%</Box> */}
                          </Box>
                          <Box
                            flex="1"
                            color="gray.700"
                            p="6"
                            border="1px solid #E2E8F0"
                            borderRadius="md"
                          >
                            <Box fontSize="0.875em" fontWeight="500">
                              CLAIMED
                            </Box>
                            <Box fontSize="1.5em" fontWeight="600">
                              {claimStatistics?.claimed?.toString()
                                ? formatEther(
                                    claimStatistics.claimed.toString()
                                  )
                                : "0.0"}{" "}
                              MARS
                            </Box>
                            {/* <Box>100.00%</Box> */}
                          </Box>
                        </HStack>
                        <Box textAlign="right">
                          {canClaim(
                            claimBatch.timestamp + pool.startTimeClaim
                          ) && (
                            <Button
                              size="sm"
                              color="white"
                              borderRadius="md"
                              bg="green.300"
                              _hover={{
                                bg: "green.200",
                              }}
                              isLoading={claiming}
                              onClick={() => handleClaim(poolId)}
                            >
                              Claim
                            </Button>
                          )}
                        </Box>
                      </>
                    )}
                  </VStack>
                ))}
            </VStack>
          </Box>
        )}

        <VStack align="stretch" spacing="4">
          <HStack spacing="2">
            {Object.values(ProjectInfo).map((v, idx) => (
              <Box
                key={idx}
                px="2"
                cursor="pointer"
                borderBottom={selectedInfo === v ? "2px solid" : "none"}
                onClick={() => setSelectedInfo(v)}
              >
                {v}
              </Box>
            ))}
          </HStack>
          {renderProjectInfo()}
        </VStack>
      </VStack>

      <VStack
        align="stretch"
        minW="26em"
        px="8"
        py="6"
        border="1px solid #E2E8F0"
        spacing="4"
        color="gray.500"
      >
        <Box>
          <Box>Fundraise Goal</Box>
          <Box fontSize="2em" fontWeight="semibold" color="black">
            $400,000
          </Box>
        </Box>

        <Box>
          <HStack justify="space-between">
            <Box color="gray.700">Rate</Box>
            <Box>
              1 {pool?.tokenA?.symbol} = 0.04 {pool?.tokenB?.symbol}
            </Box>
          </HStack>
          <HStack justify="space-between">
            <Box color="gray.700">Deposit</Box>
            <Box>{pool?.tokenB?.symbol}</Box>
          </HStack>
          <HStack justify="space-between">
            <Box color="gray.700">Tier required</Box>
            <Box>TIER 1</Box>
          </HStack>
        </Box>

        {isWhitelisted &&
        pool.status?.value &&
        pool.status.value >= POOL_STATUSES.deposit.value ? (
          <Link to={`/projects/${pool.slug}/join`}>
            <Button
              size="lg"
              w="100%"
              color="white"
              borderRadius="md"
              bg="green.300"
              _hover={{
                bg: "green.200",
              }}
            >
              Join Sale
            </Button>
          </Link>
        ) : (
          <>
            <Button
              size="lg"
              w="100%"
              color="white"
              borderRadius="md"
              bg="gray.900"
              _hover={{
                bg: "gray.700",
              }}
            >
              Apply Now
            </Button>
            <Button
              size="lg"
              w="100%"
              color="gray.700"
              borderRadius="md"
              bg="gray.200"
              _hover={{
                bg: "gray.100",
              }}
            >
              How to get whitelisted?
            </Button>
          </>
        )}
        {timeRemaining && (
          <>
            {" "}
            <hr />
            <Box textAlign="center">
              {pool.status?.value &&
              pool.status.value === POOL_STATUSES.deposit.value
                ? "SALE ENDS IN"
                : "SALE STARTS IN"}
            </Box>
            <HStack align="flex-start" justify="space-between" spacing="0">
              <Box textAlign="center" pos="relative">
                <Box fontWeight="semibold" fontSize="2em" color="black">
                  {timeRemaining.days.toString().padStart(2, "0")}
                </Box>
                <Box fontSize="xs" color="gray.400">
                  Days
                </Box>
              </Box>
              <Box textAlign="center" pos="relative">
                <Box fontWeight="semibold" fontSize="2em" color="black">
                  {timeRemaining.hours.toString().padStart(2, "0")}
                </Box>
                <Box fontSize="xs" color="gray.400">
                  Hours
                </Box>
              </Box>
              <Box textAlign="center" pos="relative">
                <Box fontWeight="semibold" fontSize="2em" color="black">
                  {timeRemaining.minutes.toString().padStart(2, "0")}
                </Box>
                <Box fontSize="xs" color="gray.400">
                  Minutes
                </Box>
              </Box>
              <Box textAlign="center" pos="relative">
                <Box fontWeight="semibold" fontSize="2em" color="black">
                  {timeRemaining.seconds.toString().padStart(2, "0")}
                </Box>
                <Box fontSize="xs" color="gray.400">
                  Seconds
                </Box>
              </Box>
            </HStack>
          </>
        )}
      </VStack>
    </HStack>
  );
};

export default DetailProject;
