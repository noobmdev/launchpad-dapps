import axiosInstance from "../utils/axios";
import useSWR from "swr";

const fetcher = async (url) => {
  const res = await axiosInstance.get(url);
  return res.data;
};

export const usePools = () => {
  const { data, error } = useSWR("/pools", fetcher);
  return {
    pools: data,
    isLoading: !error && !data,
    error,
    isError: error,
  };
};

export const usePool = (slug) => {
  const { data, error } = useSWR(`/pools/${slug}`, fetcher);
  return {
    pool: data,
    isLoading: !error && !data,
    error,
    isError: error,
  };
};
