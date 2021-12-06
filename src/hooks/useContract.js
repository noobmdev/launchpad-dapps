import { Contract } from "@ethersproject/contracts";
import { getAddress } from "@ethersproject/address";
import { useMemo } from "react";
import { PRE_ORDER_ADDRESS } from "configs";
import PreOrderABI from "abis/PreOrder.json";
import IERC20ABI from "abis/IERC20.json";
import { useActiveWeb3React } from "./useActiveWeb3React";

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value) {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// account is not optional
export function getSigner(library, account) {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(library, account = undefined) {
  return account ? getSigner(library, account) : library;
}

// account is optional
export function getContract(address, ABI, library, account = undefined) {
  if (
    !isAddress(address) ||
    address === 0x0000000000000000000000000000000000000000
  ) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  if (!library) return new Error("No provider or signer");

  return new Contract(address, ABI, getProviderOrSigner(library, account));
}

// returns null on errors
export function useContract(address, ABI, withSignerIfPossible = true) {
  const { library, account } = useActiveWeb3React();

  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

export async function callContract(contract, method, args, overrides = {}) {
  try {
    const tx = await contract[method](...args, {
      ...overrides,
    });
    if (typeof tx.wait !== "function") return tx;
    if (!tx) throw new Error("cannot create transaction");
    const res = await tx.wait();
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function getPreOrderContract(library, account = undefined) {
  return getContract(PRE_ORDER_ADDRESS, PreOrderABI, library, account);
}

export function getERC20Contract(library, contract, account = undefined) {
  return getContract(contract, IERC20ABI, library, account);
}
