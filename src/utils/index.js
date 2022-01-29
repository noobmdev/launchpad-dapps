import { formatUnits } from "ethers/lib/utils";

export const removeNumericKey = (object) => {
  let obj = { ...object };
  for (let key in obj) {
    if (!Number.isNaN(+key)) {
      delete obj[key];
    }
  }
  return obj;
};

export const formatNumber = (number) =>
  number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 *
 * @param {timestamp} endTime
 */
export const getTimeRemaining = (endTime) => {
  const total = endTime * 1000 - Date.now();
  if (total <= 0) return null;
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

/**
 *
 * @param {timestamp} time
 */
export const formatTime = (time) => {
  if (isNaN(time) || !time) return;
  return new Date(time * 1000).toUTCString();
};

/**
 *
 * @param {String | BigNumber} bigNumber
 * @param {Number} decimal
 * @returns
 */
export const _toString = (bigNumber, decimal = 18) => {
  if (!bigNumber) return "";
  return formatUnits(bigNumber?.toString(), decimal);
};

/**
 *
 * @param {String} address
 * @returns
 */
export const formatAddress = (address) => {
  if (!address || !address?.toString()) return "";
  const addr = address.toString();
  const length = addr.length;
  return length > 10
    ? `${addr.slice(0, 6)}...${addr.slice(length - 4, length)}`
    : addr;
};
