import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

export const injected = new InjectedConnector({ supportedChainIds: [97] });

export const walletconnect = new WalletConnectConnector({
  rpc: {
    97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
  qrcode: true,
  pollingInterval: 12000,
});

export const simpleRpcProvider = new StaticJsonRpcProvider(
  "https://data-seed-prebsc-1-s1.binance.org:8545/"
);
