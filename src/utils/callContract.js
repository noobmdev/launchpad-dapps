import {
  ERC20_METHODS,
  MAX_UINT256,
  PRE_ORDER_ADDRESS,
  PRE_ORDER_METHODS,
  TOKEN_B_ADDRESS,
} from "configs";
import {
  callContract,
  getPreOrderContract,
  getERC20Contract,
} from "hooks/useContract";

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

export const getAllowanceB = async (library, account) => {
  return getAllowance(library, TOKEN_B_ADDRESS, account, PRE_ORDER_ADDRESS);
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

export const approveB = async (library, account) => {
  return approve(
    library,
    account,
    TOKEN_B_ADDRESS,
    PRE_ORDER_ADDRESS,
    MAX_UINT256
  );
};

export const buyPreOrder = async (library, account, amount) => {
  try {
    const preOrderContract = getPreOrderContract(library, account);
    return callContract(preOrderContract, PRE_ORDER_METHODS.buyPreOrder, [
      amount,
    ]);
  } catch (error) {
    throw error;
  }
};

export const claimPendingToken = async (library, account) => {
  try {
    const preOrderContract = getPreOrderContract(library, account);
    return callContract(
      preOrderContract,
      PRE_ORDER_METHODS.claimPendingToken,
      []
    );
  } catch (error) {
    throw error;
  }
};
