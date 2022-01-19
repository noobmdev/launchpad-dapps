if (!process.env.REACT_APP_SERVER_URL)
  throw Error("config server url environment error");

export const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const PRE_ORDER_ADDRESS = "0x400a5E8A40D0812B9124AeC65d279D277D6a98f5";

export const WETH = "0xae13d989dac2f0debff460ac112a837c89baa7cd";
export const WETH_SYMBOL = "BNB";

export const PRE_ORDER_METHODS = {
  whitelist: "whitelist",
  totalPools: "totalPools",
  isActivePool: "isActivePool",
  tokenAB: "tokenAB",
  tokenAPrice: "tokenAPrice",
  tokenAmountAPreOrder: "tokenAmountAPreOrder",
  totalAmountABought: "totalAmountABought",
  maxTokenBCanBuy: "maxTokenBCanBuy",
  startTime: "startTime",
  startTimeSwap: "startTimeSwap",
  startTimeClaim: "startTimeClaim",
  buyPreOrder: "buyPreOrder",
  buyPreOrderWETH: "buyPreOrderWETH",
  claimPendingToken: "claimPendingToken",
  pendingTokenAAmount: "pendingTokenAAmount",
  pendingTokenAAmountClaimed: "pendingTokenAAmountClaimed",
  totalTokenBBought: "totalTokenBBought",
  getClaimBatches: "getClaimBatches",
  currentClaimBatch: "currentClaimBatch",
};

export const ERC20_METHODS = {
  allowance: "allowance",
  approve: "approve",
  balanceOf: "balanceOf",
  name: "name",
  symbol: "symbol",
  decimals: "decimals",
};

export const POOL_STATUSES = {
  register: {
    name: "REGISTER",
    value: 1,
  },
  deposit: {
    name: "DEPOSIT",
    value: 2,
  },
  claim: {
    name: "CLAIM",
    value: 3,
  },
};

export const ONE_HUNDRED_PERCENT = 100000;

export const MAX_UINT256 =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
