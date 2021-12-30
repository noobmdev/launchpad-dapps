import {
  ERC20_METHODS,
  MAX_UINT256,
  POOL_STATUSES,
  PRE_ORDER_ADDRESS,
  PRE_ORDER_METHODS,
} from "configs";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import {
  callContract,
  getPreOrderContract,
  getERC20Contract,
} from "hooks/useContract";

export const getPools = async (library) => {
  try {
    const preOrderContract = getPreOrderContract(library);
    const totalPools = await callContract(
      preOrderContract,
      PRE_ORDER_METHODS.totalPools,
      []
    );
    const currentTimestamp = BigNumber.from(Math.floor(Date.now() / 1000));
    return Promise.all(
      new Array(+totalPools).fill("").map(async (_, idx) => {
        const [
          isActivePool,
          tokenAB,
          tokenAPrice,
          tokenAmountAPreOrder,
          maxTokenBCanBuy,
          startTime,
          startTimeSwap,
          startTimeClaim,
          claimBatches,
        ] = await Promise.all([
          callContract(preOrderContract, PRE_ORDER_METHODS.isActivePool, [idx]),
          callContract(preOrderContract, PRE_ORDER_METHODS.tokenAB, [idx]),
          callContract(preOrderContract, PRE_ORDER_METHODS.tokenAPrice, [idx]),
          callContract(
            preOrderContract,
            PRE_ORDER_METHODS.tokenAmountAPreOrder,
            [idx]
          ),
          callContract(preOrderContract, PRE_ORDER_METHODS.maxTokenBCanBuy, [
            idx,
          ]),
          callContract(preOrderContract, PRE_ORDER_METHODS.startTime, [idx]),
          callContract(preOrderContract, PRE_ORDER_METHODS.startTimeSwap, [
            idx,
          ]),
          callContract(preOrderContract, PRE_ORDER_METHODS.startTimeClaim, [
            idx,
          ]),
          callContract(preOrderContract, PRE_ORDER_METHODS.getClaimBatches, [
            idx,
          ]),
        ]);
        let status;
        if (
          !!startTime &&
          startTime > currentTimestamp &&
          currentTimestamp < startTimeSwap.from
        ) {
          status = POOL_STATUSES.register;
        } else if (
          (!!startTimeSwap.from &&
            startTimeSwap.from &&
            startTimeSwap.from !== 0 &&
            startTimeSwap.duration !== 0 &&
            startTimeSwap.from > currentTimestamp &&
            startTimeSwap.from + startTimeSwap.duration > currentTimestamp) ||
          currentTimestamp < startTimeClaim
        ) {
          status = POOL_STATUSES.deposit;
        } else if (startTimeClaim !== 0 && startTimeClaim < currentTimestamp) {
          status = POOL_STATUSES.claim;
        }
        return {
          isActivePool,
          tokenAB,
          tokenAPrice,
          tokenAmountAPreOrder,
          maxTokenBCanBuy,
          startTime,
          startTimeSwap,
          startTimeClaim,
          status,
          claimBatches,
        };
      })
    );
  } catch (error) {
    throw error;
  }
};

export const getWhitelisted = async (library, poolIdx, account) => {
  try {
    const preOrderContract = getPreOrderContract(library);
    return callContract(preOrderContract, PRE_ORDER_METHODS.whitelist, [
      poolIdx,
      account,
    ]);
  } catch (error) {
    throw error;
  }
};

export const getStartTime = async (library) => {
  try {
    const preOrderContract = getPreOrderContract(library);
    return Promise.all([
      callContract(preOrderContract, PRE_ORDER_METHODS.startTimeSwap, []),
      callContract(preOrderContract, PRE_ORDER_METHODS.startTimeClaim, []),
    ]);
  } catch (error) {
    throw error;
  }
};

export const getTotalAmountBought = async (library) => {
  try {
    const preOrderContract = getPreOrderContract(library);
    return callContract(
      preOrderContract,
      PRE_ORDER_METHODS.totalAmountBought,
      []
    );
  } catch (error) {
    throw error;
  }
};

export const getAllowance = async (library, erc20Address, owner, spender) => {
  try {
    const erc20Contract = getERC20Contract(library, erc20Address);
    return callContract(erc20Contract, ERC20_METHODS.allowance, [
      owner,
      spender,
    ]);
  } catch (error) {
    throw error;
  }
};

export const getTokenBalance = async (library, erc20Address, account) => {
  try {
    const erc20Contract = getERC20Contract(library, erc20Address);
    return callContract(erc20Contract, ERC20_METHODS.balanceOf, [account]);
  } catch (error) {
    throw error;
  }
};

export const approve = async (
  library,
  account,
  erc20Address,
  spender,
  amount
) => {
  try {
    const erc20Contract = getERC20Contract(library, erc20Address, account);
    return callContract(erc20Contract, ERC20_METHODS.approve, [
      spender,
      amount,
    ]);
  } catch (error) {
    throw error;
  }
};

export const getTotalBDeposited = async (library, poolIdx, account) => {
  try {
    const preOrderContract = getPreOrderContract(library, account);
    return callContract(preOrderContract, PRE_ORDER_METHODS.totalTokenBBought, [
      poolIdx,
      account,
    ]);
  } catch (error) {
    throw error;
  }
};

export const buyPreOrder = async (
  library,
  account,
  poolIdx,
  tokenB,
  amountB
) => {
  try {
    if (
      !library ||
      !account ||
      !tokenB ||
      isNaN(amountB) ||
      amountB === "" ||
      +amountB === 0
    )
      return;
    const _amountB = parseEther(amountB);
    const allowance = await getAllowance(
      library,
      tokenB,
      PRE_ORDER_ADDRESS,
      account
    );
    if (allowance.lt(_amountB)) {
      await approve(library, account, tokenB, PRE_ORDER_ADDRESS, MAX_UINT256);
    }
    const preOrderContract = getPreOrderContract(library, account);
    return callContract(preOrderContract, PRE_ORDER_METHODS.buyPreOrder, [
      poolIdx,
      _amountB,
    ]);
  } catch (error) {
    throw error;
  }
};

export const getClaimStatistics = async (library, poolIdx, account) => {
  try {
    const preOrderContract = getPreOrderContract(library);
    const [claimable, currentBatch] = await Promise.all([
      callContract(preOrderContract, PRE_ORDER_METHODS.pendingTokenAAmount, [
        poolIdx,
        account,
      ]),
      callContract(preOrderContract, PRE_ORDER_METHODS.currentClaimBatch, [
        poolIdx,
        account,
      ]),
    ]);
    console.log(claimable, currentBatch === 1);
    return {
      claimable,
      currentBatch,
    };
  } catch (error) {
    throw error;
  }
};

export const claimPendingToken = async (library, poolIdx, account) => {
  try {
    const preOrderContract = getPreOrderContract(library, account);
    return callContract(preOrderContract, PRE_ORDER_METHODS.claimPendingToken, [
      poolIdx,
    ]);
  } catch (error) {
    throw error;
  }
};
