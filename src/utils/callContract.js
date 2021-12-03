import { JOB_CORE_METHODS } from "configs";
import { callContract, getJobCoreContract } from "hooks/useContract";
import { removeNumericKey } from "./index";

export const getLatestRecruiterId = (library) => {
  try {
    const jobCoreContract = getJobCoreContract(library);
    return callContract(
      jobCoreContract,
      JOB_CORE_METHODS.getLatestRecruiterId,
      []
    );
  } catch (error) {
    throw error;
  }
};
