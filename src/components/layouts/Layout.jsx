import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import Icon from "@chakra-ui/icon";
import { Box, Grid, HStack, Text, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ReactComponent as MetamaskIcon } from "assets/images/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "assets/images/walletconnect.svg";
import { injected, walletconnect } from "connectors";
import { useWallet } from "connectors/hooks";
import { useActiveWeb3React } from "hooks/useActiveWeb3React";
import React from "react";
import { RiWallet3Fill } from "react-icons/ri";
import "styles/Layout.css";

export const Layout = ({ children }) => {
  const { account, isConnected } = useActiveWeb3React();
  const { connect } = useWallet();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      minH="100vh"
      bg="radial-gradient(50% 50% at 50% 50%, rgb(34, 34, 40) 0%, rgb(4, 7, 25) 100%);"
    >
      <Modal size="sm" isOpen={isOpen && !isConnected} onClose={onClose}>
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

      <HStack
        align="flex-start"
        justify="center"
        minH="100vh"
        px="8"
        py="4"
        bgImage="https://res.cloudinary.com/munumber2/image/upload/v1638481640/bg_ozlucl.svg"
        bgSize="100% auto"
        bgPos="0px 90px"
      >
        <VStack align="stretch" maxW="72em" flex="1">
          <HStack h="14" align="center">
            <HStack flex="1" justify="flex-end" spacing="4">
              {isConnected ? (
                <HStack>
                  <Button colorScheme="blue" borderRadius="3em">
                    {account}
                  </Button>
                </HStack>
              ) : (
                <Button
                  leftIcon={<Icon as={RiWallet3Fill} w="6" h="6" />}
                  colorScheme="blue"
                  borderRadius="3em"
                  onClick={onOpen}
                >
                  Connect wallet
                </Button>
              )}
            </HStack>
          </HStack>
          <Box flex="1">{children}</Box>
        </VStack>
      </HStack>
    </Box>
  );
};
