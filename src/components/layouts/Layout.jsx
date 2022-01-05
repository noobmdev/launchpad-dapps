import {
  Box,
  Button,
  Grid,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { ReactComponent as LogoIcon } from "assets/images/logo.svg";
import { ReactComponent as MetamaskIcon } from "assets/images/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "assets/images/walletconnect.svg";
import { injected, walletconnect } from "connectors";
import { useWallet } from "connectors/hooks";
import { GlobalContext } from "context/GlobalContext";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import React from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "styles/Layout.css";
import { getPools } from "utils/callContract";

const menu = [
  { name: "Projects", path: "/projects" },
  { name: "Staking", path: "/staking" },
  { name: "About", path: "/about" },
];

export const Layout = ({ children }) => {
  const { account, chainId, library } = useActiveWeb3React();
  const { connect } = useWallet();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setPools, user } = useContext(GlobalContext);

  useEffect(() => {
    (async () => {
      if (!library) return;
      getPools(library, account).then(setPools).catch(console.error);
    })();
  }, [library, account]);

  return (
    <>
      <Modal
        size="sm"
        isOpen={isOpen && !account && !chainId}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap="12">
              <VStack
                cursor="pointer"
                p="4"
                borderRadius="md"
                _hover={{
                  bg: "gray.300",
                }}
                onClick={() => connect(injected)}
              >
                <Box h="12">
                  <MetamaskIcon />
                </Box>
                <Text as="b" textAlign="center">
                  Metamask
                </Text>
              </VStack>

              <VStack
                cursor="pointer"
                p="4"
                borderRadius="md"
                _hover={{
                  bg: "gray.300",
                }}
                onClick={() => connect(walletconnect)}
              >
                <Box h="12">
                  <WalletConnectIcon />
                </Box>
                <Text as="b" textAlign="center">
                  WalletConnect
                </Text>
              </VStack>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>

      <VStack minH="100vh" align="stretch">
        <HStack
          h="14"
          justify="space-between"
          spacing="4"
          px="5"
          pos="relative"
          borderBottom="1px solid #E2E8F0"
        >
          <HStack>
            <Link to="/">
              <HStack>
                <LogoIcon />
                <Box
                  fontSize="xl"
                  fontWeight="bold"
                  d={{ base: "none", xl: "flex" }}
                >
                  Marstarter
                </Box>
              </HStack>
            </Link>
            <HStack pl="24" spacing="8" d={{ base: "none", xl: "flex" }}>
              {menu.map((e, idx) => (
                <Link key={idx} to={e.path}>
                  <Box
                    py="4"
                    borderBottom={
                      location.pathname.includes(e.path)
                        ? "2px solid #171923"
                        : "none"
                    }
                  >
                    {e.name}
                  </Box>
                </Link>
              ))}
            </HStack>
          </HStack>
          {account ? (
            <HStack>
              <Button
                bg="gray.900"
                color="white"
                size="sm"
                borderRadius="md"
                _hover={{
                  bg: "gray.700",
                }}
              >
                {account.slice(0, 6)}...
                {account.slice(account.length - 6, account.length)}
              </Button>
            </HStack>
          ) : (
            <Button
              bg="gray.900"
              color="white"
              size="sm"
              borderRadius="md"
              _hover={{
                bg: "gray.700",
              }}
              onClick={onOpen}
            >
              Connect wallet
            </Button>
          )}
        </HStack>
        <Box
          flex="1"
          px={{ base: 4, md: 20, xl: 40 }}
          py={{ base: 2, md: 4, xl: 10 }}
        >
          {children}
        </Box>
      </VStack>
    </>
  );
};
