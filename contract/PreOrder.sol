// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


contract PreOrder is Ownable {
    IERC20 tokenA; // CAMA
    IERC20 tokenB; // BUSD

    struct ClaimBatch {
        uint32 timestamp;
        uint16 claimPercent; // 1e3 = 1%
    }

    // 1 tokenA = 0.04 tokenB
    uint256 public tokenPrice = 0.04 ether;
    uint256 public tokenAmountPreOrder = 15 * 10**6 * 10**18; // 15000000000000000000000000
    uint256 public totalAmountBought;
    mapping(address => bool) public whitelist;
    uint32 public startTimeSwap = 1638768985;
    uint32 public startTimeClaim = 1638768985;
    mapping(address => uint256) public pendingTokenAmount;

    ClaimBatch[] public claimBatchs;
    // address => index of claimBatchs
    mapping(address => uint8) currentClaimBatch;

    constructor() {
        tokenA = IERC20(0xC6C679DD13AD5732eCa77478f3d0A8baD159221b);
        tokenB = IERC20(0x1b92f04269Bc9413514694ec0Fa5FBCE5CDd6a99);

        uint32[12] memory timestamps = [1 minutes, 60 days, 90 days, 120 days, 150 days, 180 days, 210 days, 240 days, 270 days, 300 days, 330 days, 360 days];
        uint16[12] memory claimPercents = [5e3, 5e3, 5e3, 5e3, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4, 1e4];

        for(uint8 i = 0; i < timestamps.length; i++){
            addClaimBatchs(timestamps[i], claimPercents[i]);
        }
    }

    function addToWhitelist(address _addr) external onlyOwner {
        require(!whitelist[_addr], "ALREADY_ADDED");
        whitelist[_addr] = true;
    } 

    function addClaimBatchs(uint32 _timestamp, uint16 _claimPercent) public onlyOwner {
        claimBatchs.push(ClaimBatch({
            timestamp: _timestamp,
            claimPercent: _claimPercent
        }));
    }

    function setStartTimeSwap(uint32 _timestamp) public onlyOwner {
        startTimeSwap = _timestamp;
    }

    function setStartClaim(uint32 _timestamp) public onlyOwner {
        require(startTimeSwap != 0, "SWAP_TIME_NOT_SETTED");
        require(startTimeSwap <= _timestamp, "CLAIM_MUST_BE_GREATER_THAN_SWAP_TIME");
        startTimeClaim = _timestamp;
    }

    function getAmountIn(uint256 amountA) public view returns(uint256) {
        return amountA*tokenPrice/1e18;
    }

     function getAmountOut(uint256 amountB) public view returns(uint256) {
        return amountB*1e18/tokenPrice;
    }

    modifier inWhitelist {
        require(whitelist[_msgSender()], "NOT_IN_WHITELIST");
        _;
    }

    function buyPreOrder(uint256 amountA) external inWhitelist {
        require(startTimeSwap != 0 && startTimeSwap < block.timestamp, "SWAP_TIME_NOT_SETTED_OR_NOT_STARTED");
        require(totalAmountBought <= tokenAmountPreOrder, "NOT_ENOUGH_TOKEN_SWAP");
        require(tokenA.balanceOf(address(this)) >= amountA, "NOT_ENOUGH_TOKEN_TO_SWAP");
        uint256 amountB = getAmountIn(amountA);
        require(tokenB.allowance(_msgSender(), address(this)) >= amountB, "ERC20: ALLOWANCE_NOT_ENOUGH");
        bool success = tokenB.transferFrom(_msgSender(), address(this), amountB);
        require(success);
        totalAmountBought += amountA;
        pendingTokenAmount[_msgSender()] += amountA;
    }

    function claimPendingToken() external inWhitelist {
        require(startTimeClaim != 0 && startTimeClaim < block.timestamp, "CLAIM_TIME_NOT_SETTED_OR_NOT_STARTED");
        require(pendingTokenAmount[_msgSender()] > 0 , "NOT_HAVE_PENDING_TOKEN");
        uint8 idx = currentClaimBatch[_msgSender()];
        ClaimBatch memory currentBatch = claimBatchs[idx];
        uint256 requireTime = uint256(startTimeClaim) + uint256(currentBatch.timestamp);
        require(requireTime < block.timestamp, "NOT_STARTED_BATCH_CLAIM");
        uint256 pendingClaim = pendingTokenAmount[_msgSender()] * currentBatch.claimPercent / 1e5;
        require(pendingTokenAmount[_msgSender()] - pendingClaim >=0, "NOT_ENOUGH_PENDING_TOKEN");
        pendingTokenAmount[_msgSender()] -= pendingClaim;
        currentClaimBatch[_msgSender()]++;
        tokenA.transfer(_msgSender(), pendingClaim);
    }

    function withdrawAllTokenAB() external onlyOwner {
        tokenA.transfer(_msgSender(), tokenA.balanceOf(address(this)));
        tokenB.transfer(_msgSender(), tokenB.balanceOf(address(this)));
    }
}