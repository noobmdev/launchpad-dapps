import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  HStack,
  Input,
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { PRE_ORDER_ADDRESS } from "configs";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import { usePool } from "hooks/useFetch";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useParams, useHistory } from "react-router-dom";
import {
  approveB,
  buyPreOrder,
  getAllowance,
  getTokenBalance,
  getTotalBDeposited,
  getWhitelisted,
} from "utils/callContract";
import Whitelisted from "./components/Whitelisted";

const JoinPool = () => {
  const { account, library } = useActiveWeb3React();
  const { slug } = useParams();
  const history = useHistory();
  const toast = useToast();
  const { pool, isLoading } = usePool(slug);

  const poolId = pool?.pid;

  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [amountB, setAmountB] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [joinedJoinSuccess, setJoinedSuccess] = useState(false);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [balanceB, setBalanceB] = useState(0);
  const [allowanceB, setAllowanceB] = useState();

  const amountA = useMemo(() => {
    if (!pool?.tokenAPrice || isNaN(amountB)) return;
    if (+amountB === 0) return "0.0";
    return amountB / formatEther(pool.tokenAPrice);
  }, [pool, amountB]);

  useEffect(() => {
    (async () => {
      if (
        !account ||
        !library ||
        isNaN(poolId) ||
        !pool ||
        !pool.tokenB?.address
      )
        return;
      try {
        const [whitelisted, totalDeposited, balanceB, allowanceB] =
          await Promise.all([
            getWhitelisted(library, poolId, account),
            getTotalBDeposited(library, poolId, account),
            getTokenBalance(library, pool.tokenB.address, account),
            getAllowance(
              library,
              pool.tokenB.address,
              account,
              PRE_ORDER_ADDRESS
            ),
          ]);
        setBalanceB(balanceB);
        setIsWhitelisted(whitelisted);
        setTotalDeposited(totalDeposited);
        setAllowanceB(allowanceB);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [account, library, poolId, pool]);

  const needApproved = useMemo(() => {
    console.log(allowanceB);
    if (+amountB === 0 || !allowanceB) return false;
    try {
      const _amountB = parseEther(amountB);
      return BigNumber.from(_amountB).gt(allowanceB);
    } catch (error) {
      return false;
    }
  }, [amountB, allowanceB]);

  console.count("render");

  const handleBuy = async () => {
    if (
      !library ||
      !account ||
      isNaN(poolId) ||
      !pool ||
      !pool.tokenB.address ||
      amountB === "" ||
      +amountB === 0
    )
      return;
    if (!isWhitelisted)
      return toast({
        title: "Whitelisted",
        description: "Join whitelisted to do that",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    try {
      setSubmitting(true);

      if (needApproved) {
        await approveB(library, account, pool.tokenB.address);
        setSubmitting(false);
        toast({
          title: "Approved",
          description: "Approve success",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        await buyPreOrder(
          library,
          account,
          poolId,
          pool.tokenB.address,
          amountB
        );
        setJoinedSuccess(true);
        toast({
          title: "Transaction success",
          description: "Buy success",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => history.push("/projects"), 5000);
      }
    } catch (error) {
      console.error(error);
      typeof error.data?.message === "string" &&
        toast({
          title: "Transaction Error",
          description: error.data.message.replace("execution reverted: ", ""),
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      setSubmitting(false);
      setSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;
  return (
    <VStack align="stretch" spacing="8">
      <Breadcrumb separator="-" color="gray.500">
        <BreadcrumbItem>
          <Link to="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to="/projects">Projects</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/projects/${pool.slug}`}>Warrior Arena</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/projects/${pool.slug}/join`}>Join Pool</Link>
        </BreadcrumbItem>
      </Breadcrumb>

      <HStack justify="center">
        <VStack w="34em" align="stretch" spacing="4">
          {joinedJoinSuccess ? (
            <VStack align="center" p="8" bg="green.50">
              <Box fontSize="1.875em" fontWeight="semibold">
                Warrior Arena
              </Box>
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
              <Box>Congratulations!</Box>
              <Box color="gray.500">
                You've joined this project successfully and reserved{" "}
                {amountA?.toString()} MARS
              </Box>
              <Link style={{ width: "100%" }} to="/projects">
                <Button
                  w="100%"
                  bg="gray.900"
                  color="white"
                  size="lg"
                  borderRadius="md"
                  _hover={{
                    bg: "gray.700",
                  }}
                >
                  See your allocations
                </Button>
              </Link>
            </VStack>
          ) : (
            <>
              <Whitelisted isWhitelisted={isWhitelisted} />
              <VStack
                px="8"
                py="6"
                border="1px solid #E2E8F0"
                borderRadius="md"
                spacing="4"
              >
                <Box fontSize="1.875em" fontWeight="semibold">
                  Warrior Arena
                </Box>

                <Box>
                  <svg
                    width="129"
                    height="128"
                    viewBox="0 0 129 128"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="129" height="128" rx="64" fill="#E2E8F0" />
                    <path
                      d="M64.9998 28.6667C83.4065 28.6667 98.3332 41.9267 98.3332 58.2967C98.3305 63.2074 96.3784 67.9161 92.9057 71.3882C89.433 74.8603 84.7239 76.8116 79.8132 76.8134H73.2598C70.1865 76.8134 67.7032 79.2967 67.7032 82.37C67.7032 83.7767 68.2598 85.0734 69.1098 86.0367C69.9998 87.0367 70.5565 88.3334 70.5565 89.7767C70.5565 92.8534 67.9998 95.3334 64.9998 95.3334C46.5932 95.3334 31.6665 80.4067 31.6665 62C31.6665 43.5934 46.5932 28.6667 64.9998 28.6667ZM61.0365 82.37C61.0352 80.7645 61.3505 79.1744 61.9643 77.6908C62.5781 76.2072 63.4784 74.8592 64.6137 73.7239C65.749 72.5886 67.097 71.6883 68.5806 71.0745C70.0642 70.4606 71.6543 70.1454 73.2598 70.1467H79.8132C82.9552 70.1449 85.9681 68.8964 88.1904 66.6753C90.4128 64.4542 91.663 61.442 91.6665 58.3C91.6665 45.7967 79.8932 35.3334 64.9998 35.3334C58.1184 35.3271 51.501 37.9812 46.5311 42.7409C41.5612 47.5005 38.6237 53.9971 38.3327 60.8724C38.0417 67.7476 40.4198 74.4692 44.9697 79.6318C49.5197 84.7943 55.8892 87.9982 62.7465 88.5734C61.6304 86.6976 61.0397 84.556 61.0365 82.3734V82.37ZM49.9998 62C48.6738 62 47.402 61.4732 46.4643 60.5356C45.5266 59.5979 44.9998 58.3261 44.9998 57C44.9998 55.6739 45.5266 54.4022 46.4643 53.4645C47.402 52.5268 48.6738 52 49.9998 52C51.3259 52 52.5977 52.5268 53.5354 53.4645C54.4731 54.4022 54.9998 55.6739 54.9998 57C54.9998 58.3261 54.4731 59.5979 53.5354 60.5356C52.5977 61.4732 51.3259 62 49.9998 62ZM79.9998 62C78.6738 62 77.402 61.4732 76.4643 60.5356C75.5266 59.5979 74.9998 58.3261 74.9998 57C74.9998 55.6739 75.5266 54.4022 76.4643 53.4645C77.402 52.5268 78.6738 52 79.9998 52C81.3259 52 82.5977 52.5268 83.5354 53.4645C84.4731 54.4022 84.9998 55.6739 84.9998 57C84.9998 58.3261 84.4731 59.5979 83.5354 60.5356C82.5977 61.4732 81.3259 62 79.9998 62ZM64.9998 52C63.6738 52 62.402 51.4732 61.4643 50.5356C60.5266 49.5979 59.9998 48.3261 59.9998 47C59.9998 45.6739 60.5266 44.4022 61.4643 43.4645C62.402 42.5268 63.6738 42 64.9998 42C66.3259 42 67.5977 42.5268 68.5354 43.4645C69.4731 44.4022 69.9998 45.6739 69.9998 47C69.9998 48.3261 69.4731 49.5979 68.5354 50.5356C67.5977 51.4732 66.3259 52 64.9998 52Z"
                      fill="#2D3748"
                    />
                  </svg>
                </Box>

                <Box w="100%">
                  <Box
                    p="6"
                    border="1px solid #CBD5E0"
                    borderRadius="md"
                    pos="relative"
                  >
                    <HStack spacing="8">
                      <HStack flex="1">
                        <svg
                          width="26"
                          height="27"
                          viewBox="0 0 26 27"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            y="0.0543213"
                            width="26"
                            height="26"
                            rx="13"
                            fill="#D69E2E"
                          />
                          <path
                            d="M13 13.8043C12.8011 13.8043 12.6103 13.7253 12.4697 13.5846C12.329 13.444 12.25 13.2532 12.25 13.0543C12.25 12.8554 12.329 12.6646 12.4697 12.524C12.6103 12.3833 12.8011 12.3043 13 12.3043C13.1989 12.3043 13.3897 12.3833 13.5303 12.524C13.671 12.6646 13.75 12.8554 13.75 13.0543C13.75 13.2532 13.671 13.444 13.5303 13.5846C13.3897 13.7253 13.1989 13.8043 13 13.8043ZM12.736 15.3013C12.8235 15.4063 12.9115 15.5083 13 15.6058C13.0885 15.5083 13.1765 15.4068 13.264 15.3013C13.088 15.305 12.912 15.305 12.736 15.3013ZM11.7385 15.2388C11.3545 15.1988 10.9731 15.1374 10.596 15.0548C10.5585 15.2298 10.53 15.3998 10.511 15.5628C10.416 16.3543 10.5485 16.8353 10.75 16.9513C10.9515 17.0678 11.434 16.9418 12.0725 16.4643C12.204 16.3658 12.3365 16.2563 12.4695 16.1368C12.2092 15.8513 11.9652 15.5515 11.7385 15.2388ZM15.404 15.0548C15.0455 15.1348 14.6625 15.1968 14.2615 15.2388C14.0348 15.5515 13.7908 15.8513 13.5305 16.1368C13.6635 16.2568 13.796 16.3658 13.9275 16.4643C14.566 16.9418 15.0485 17.0678 15.25 16.9513C15.4515 16.8353 15.5835 16.3543 15.4895 15.5628C15.4689 15.3923 15.4405 15.2227 15.4045 15.0548H15.404ZM16.129 14.8613C16.4175 16.1808 16.266 17.2313 15.625 17.6013C14.984 17.9713 13.9985 17.5773 13 16.6678C12.0015 17.5773 11.016 17.9708 10.375 17.6008C9.734 17.2308 9.5825 16.1808 9.8705 14.8608C8.5835 14.4513 7.75 13.7943 7.75 13.0543C7.75 12.3143 8.5835 11.6578 9.8705 11.2473C9.5825 9.92779 9.734 8.87729 10.375 8.50729C11.016 8.13729 12.0015 8.53129 13 9.44079C13.9985 8.53129 14.984 8.13779 15.625 8.50779C16.266 8.87779 16.4175 9.92779 16.1295 11.2478C17.4165 11.6573 18.25 12.3143 18.25 13.0543C18.25 13.7943 17.4165 14.4508 16.1295 14.8613H16.129ZM12.469 9.97179C12.3418 9.85669 12.2095 9.74741 12.0725 9.64429C11.434 9.16679 10.9515 9.04079 10.75 9.15729C10.5485 9.27329 10.4165 9.75429 10.5105 10.5458C10.5305 10.7093 10.5585 10.8788 10.5955 11.0538C10.9728 10.9712 11.3544 10.9097 11.7385 10.8698C11.976 10.5433 12.221 10.2428 12.4695 9.97179H12.469ZM14.2615 10.8698C14.6625 10.9118 15.0455 10.9743 15.404 11.0538C15.4415 10.8788 15.47 10.7088 15.489 10.5458C15.584 9.75429 15.4515 9.27329 15.25 9.15729C15.0485 9.04079 14.566 9.16679 13.9275 9.64429C13.7903 9.7474 13.6578 9.85668 13.5305 9.97179C13.779 10.2428 14.024 10.5433 14.2615 10.8698ZM13.264 10.8073C13.1765 10.7023 13.0885 10.6003 13 10.5028C12.9115 10.6003 12.8235 10.7018 12.736 10.8073C12.912 10.8036 13.088 10.8036 13.264 10.8073ZM11.186 14.4063C11.0948 14.2558 11.0068 14.1035 10.922 13.9493C10.8745 14.0778 10.8305 14.2043 10.7905 14.3298C10.919 14.3578 11.051 14.3833 11.1855 14.4063H11.186ZM12.152 14.5233C12.7166 14.5652 13.2834 14.5652 13.848 14.5233C14.1666 14.0553 14.45 13.5642 14.696 13.0543C14.45 12.5443 14.1666 12.0533 13.848 11.5853C13.2834 11.5434 12.7166 11.5434 12.152 11.5853C11.8334 12.0533 11.55 12.5443 11.304 13.0543C11.55 13.5642 11.8334 14.0553 12.152 14.5233ZM15.078 12.1593C15.1255 12.0308 15.1695 11.9043 15.2095 11.7788C15.0784 11.7503 14.9467 11.7248 14.8145 11.7023C14.9056 11.8527 14.9934 12.0051 15.078 12.1593ZM10.065 11.9728C9.895 12.0278 9.734 12.0878 9.583 12.1528C8.8505 12.4668 8.5 12.8218 8.5 13.0543C8.5 13.2868 8.85 13.6418 9.583 13.9558C9.734 14.0208 9.895 14.0808 10.065 14.1358C10.176 13.7858 10.3135 13.4228 10.4775 13.0543C10.3199 12.7018 10.1822 12.3407 10.065 11.9728ZM10.79 11.7788C10.8305 11.9038 10.8745 12.0308 10.922 12.1588C11.0068 12.0048 11.0948 11.8526 11.186 11.7023C11.051 11.7253 10.919 11.7508 10.7905 11.7788H10.79ZM15.935 14.1358C16.105 14.0808 16.266 14.0208 16.417 13.9558C17.1495 13.6418 17.5 13.2868 17.5 13.0543C17.5 12.8218 17.15 12.4668 16.417 12.1528C16.2591 12.0855 16.0983 12.0255 15.935 11.9728C15.824 12.3228 15.6865 12.6858 15.5225 13.0543C15.6865 13.4228 15.824 13.7853 15.935 14.1358ZM15.21 14.3298C15.1695 14.2048 15.1255 14.0778 15.078 13.9498C14.9932 14.1038 14.9052 14.256 14.814 14.4063C14.949 14.3833 15.081 14.3578 15.2095 14.3298H15.21Z"
                            fill="#F7FAFC"
                          />
                        </svg>
                        <Input
                          pl="1"
                          border="none"
                          fontSize="1.875em"
                          fontWeight="semibold"
                          value={amountB}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (isNaN(value)) return;
                            setAmountB(value);
                          }}
                        />
                      </HStack>
                      <Button
                        size="sm"
                        colorScheme="gray"
                        onClick={() => {
                          // const left = balanceB()

                          const left = BigNumber.from(pool.maxTokenBCanBuy).sub(
                            BigNumber.from(totalDeposited)
                          );
                          const _left = formatEther(left.toString());
                          setAmountB(_left);
                        }}
                      >
                        MAX
                      </Button>
                    </HStack>
                    <Box color="gray.500" mt="2">
                      Balance:{" "}
                      {balanceB.balance
                        ? formatEther(balanceB.balance.toString())
                        : "0.0"}{" "}
                      {balanceB?.symbol}
                    </Box>
                    <Box pos="absolute" bottom="-5" left="50%">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="31"
                          height="31"
                          rx="15.5"
                          fill="white"
                        />
                        <path
                          d="M15.9997 18.1719L20.9497 13.2219L22.3637 14.6359L15.9997 20.9999L9.63574 14.6359L11.0497 13.2219L15.9997 18.1719Z"
                          fill="#2D3748"
                        />
                        <rect
                          x="0.5"
                          y="0.5"
                          width="31"
                          height="31"
                          rx="15.5"
                          stroke="#E2E8F0"
                        />
                      </svg>
                    </Box>
                  </Box>
                  <Box
                    p="6"
                    border="1px solid #CBD5E0"
                    borderRadius="md"
                    mt="2"
                  >
                    <HStack>
                      <svg
                        width="26"
                        height="27"
                        viewBox="0 0 26 27"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          y="0.0543213"
                          width="26"
                          height="26"
                          rx="13"
                          fill="#4FD1C5"
                        />
                        <path
                          d="M13 13.8043C12.8011 13.8043 12.6103 13.7253 12.4697 13.5846C12.329 13.444 12.25 13.2532 12.25 13.0543C12.25 12.8554 12.329 12.6646 12.4697 12.524C12.6103 12.3833 12.8011 12.3043 13 12.3043C13.1989 12.3043 13.3897 12.3833 13.5303 12.524C13.671 12.6646 13.75 12.8554 13.75 13.0543C13.75 13.2532 13.671 13.444 13.5303 13.5846C13.3897 13.7253 13.1989 13.8043 13 13.8043ZM12.736 15.3013C12.8235 15.4063 12.9115 15.5083 13 15.6058C13.0885 15.5083 13.1765 15.4068 13.264 15.3013C13.088 15.305 12.912 15.305 12.736 15.3013ZM11.7385 15.2388C11.3545 15.1988 10.9731 15.1374 10.596 15.0548C10.5585 15.2298 10.53 15.3998 10.511 15.5628C10.416 16.3543 10.5485 16.8353 10.75 16.9513C10.9515 17.0678 11.434 16.9418 12.0725 16.4643C12.204 16.3658 12.3365 16.2563 12.4695 16.1368C12.2092 15.8513 11.9652 15.5515 11.7385 15.2388ZM15.404 15.0548C15.0455 15.1348 14.6625 15.1968 14.2615 15.2388C14.0348 15.5515 13.7908 15.8513 13.5305 16.1368C13.6635 16.2568 13.796 16.3658 13.9275 16.4643C14.566 16.9418 15.0485 17.0678 15.25 16.9513C15.4515 16.8353 15.5835 16.3543 15.4895 15.5628C15.4689 15.3923 15.4405 15.2227 15.4045 15.0548H15.404ZM16.129 14.8613C16.4175 16.1808 16.266 17.2313 15.625 17.6013C14.984 17.9713 13.9985 17.5773 13 16.6678C12.0015 17.5773 11.016 17.9708 10.375 17.6008C9.734 17.2308 9.5825 16.1808 9.8705 14.8608C8.5835 14.4513 7.75 13.7943 7.75 13.0543C7.75 12.3143 8.5835 11.6578 9.8705 11.2473C9.5825 9.92779 9.734 8.87729 10.375 8.50729C11.016 8.13729 12.0015 8.53129 13 9.44079C13.9985 8.53129 14.984 8.13779 15.625 8.50779C16.266 8.87779 16.4175 9.92779 16.1295 11.2478C17.4165 11.6573 18.25 12.3143 18.25 13.0543C18.25 13.7943 17.4165 14.4508 16.1295 14.8613H16.129ZM12.469 9.97179C12.3418 9.85669 12.2095 9.74741 12.0725 9.64429C11.434 9.16679 10.9515 9.04079 10.75 9.15729C10.5485 9.27329 10.4165 9.75429 10.5105 10.5458C10.5305 10.7093 10.5585 10.8788 10.5955 11.0538C10.9728 10.9712 11.3544 10.9097 11.7385 10.8698C11.976 10.5433 12.221 10.2428 12.4695 9.97179H12.469ZM14.2615 10.8698C14.6625 10.9118 15.0455 10.9743 15.404 11.0538C15.4415 10.8788 15.47 10.7088 15.489 10.5458C15.584 9.75429 15.4515 9.27329 15.25 9.15729C15.0485 9.04079 14.566 9.16679 13.9275 9.64429C13.7903 9.7474 13.6578 9.85668 13.5305 9.97179C13.779 10.2428 14.024 10.5433 14.2615 10.8698ZM13.264 10.8073C13.1765 10.7023 13.0885 10.6003 13 10.5028C12.9115 10.6003 12.8235 10.7018 12.736 10.8073C12.912 10.8036 13.088 10.8036 13.264 10.8073ZM11.186 14.4063C11.0948 14.2558 11.0068 14.1035 10.922 13.9493C10.8745 14.0778 10.8305 14.2043 10.7905 14.3298C10.919 14.3578 11.051 14.3833 11.1855 14.4063H11.186ZM12.152 14.5233C12.7166 14.5652 13.2834 14.5652 13.848 14.5233C14.1666 14.0553 14.45 13.5642 14.696 13.0543C14.45 12.5443 14.1666 12.0533 13.848 11.5853C13.2834 11.5434 12.7166 11.5434 12.152 11.5853C11.8334 12.0533 11.55 12.5443 11.304 13.0543C11.55 13.5642 11.8334 14.0553 12.152 14.5233ZM15.078 12.1593C15.1255 12.0308 15.1695 11.9043 15.2095 11.7788C15.0784 11.7503 14.9467 11.7248 14.8145 11.7023C14.9056 11.8527 14.9934 12.0051 15.078 12.1593ZM10.065 11.9728C9.895 12.0278 9.734 12.0878 9.583 12.1528C8.8505 12.4668 8.5 12.8218 8.5 13.0543C8.5 13.2868 8.85 13.6418 9.583 13.9558C9.734 14.0208 9.895 14.0808 10.065 14.1358C10.176 13.7858 10.3135 13.4228 10.4775 13.0543C10.3199 12.7018 10.1822 12.3407 10.065 11.9728ZM10.79 11.7788C10.8305 11.9038 10.8745 12.0308 10.922 12.1588C11.0068 12.0048 11.0948 11.8526 11.186 11.7023C11.051 11.7253 10.919 11.7508 10.7905 11.7788H10.79ZM15.935 14.1358C16.105 14.0808 16.266 14.0208 16.417 13.9558C17.1495 13.6418 17.5 13.2868 17.5 13.0543C17.5 12.8218 17.15 12.4668 16.417 12.1528C16.2591 12.0855 16.0983 12.0255 15.935 11.9728C15.824 12.3228 15.6865 12.6858 15.5225 13.0543C15.6865 13.4228 15.824 13.7853 15.935 14.1358ZM15.21 14.3298C15.1695 14.2048 15.1255 14.0778 15.078 13.9498C14.9932 14.1038 14.9052 14.256 14.814 14.4063C14.949 14.3833 15.081 14.3578 15.2095 14.3298H15.21Z"
                          fill="#F7FAFC"
                        />
                      </svg>

                      <Box fontSize="1.875em" fontWeight="semibold">
                        {amountA?.toString()}
                      </Box>
                    </HStack>
                    {/* <Box color="gray.500">{1234} MARS Remaining</Box> */}
                  </Box>
                </Box>

                <HStack w="100%" justify="space-between">
                  <Box>MAX Allocation</Box>
                  <Box color="gray.500">
                    {pool.maxTokenBCanBuy
                      ? formatEther(pool.maxTokenBCanBuy)
                      : "0.00"}{" "}
                    BUSD
                  </Box>
                </HStack>
                <HStack w="100%" justify="space-between">
                  <Box>Total Deposited</Box>
                  <Box color="gray.500">
                    {formatEther(totalDeposited.toString())} BUSD
                  </Box>
                </HStack>

                <Button
                  size="lg"
                  w="100%"
                  color="white"
                  borderRadius="md"
                  bg="green.300"
                  _hover={{
                    bg: "green.200",
                  }}
                  isLoading={submitting}
                  onClick={handleBuy}
                >
                  {needApproved
                    ? `Approve ${pool.tokenB?.symbol}`
                    : "Join Pool"}
                </Button>
              </VStack>
            </>
          )}
        </VStack>
      </HStack>
    </VStack>
  );
};

export default JoinPool;
