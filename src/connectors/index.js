import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

export const injected = new InjectedConnector({ supportedChainIds: [56] });

export const walletconnect = new WalletConnectConnector({
  rpc: {
    56: "https://bsc-dataseed1.ninicoin.io/",
  },
  qrcode: true,
  pollingInterval: 12000,
});

export const simpleRpcProvider = new StaticJsonRpcProvider(
  "https://bsc-dataseed1.ninicoin.io/"
);
