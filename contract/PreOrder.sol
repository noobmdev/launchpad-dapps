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
    struct TokenAB {
        address tokenA;
        address tokenB;
    }

    struct ClaimBatch {
        uint32 timestamp;
        uint16 claimPercent; // 1e3 = 1%
    }

    struct Time {
        uint32 from;
        uint32 duration;
    }

    uint256 public totalPools;
    address public WETH;
    mapping(uint256 => bool) public isActivePool;
    mapping(uint256 => TokenAB) public tokenAB;
    mapping(uint256 => uint256) public tokenAPrice;
    mapping(uint256 => uint256) public tokenAmountAPreOrder;
    mapping(uint256 => uint256) public totalAmountABought;
    mapping(uint256 => mapping(address => bool)) public whitelist;
    mapping(uint256 => uint256) public maxTokenBCanBuy;
    mapping(uint256 => uint32) public startTime;
    mapping(uint256 => Time) public startTimeSwap;
    mapping(uint256 => uint32) public startTimeClaim;
    mapping(uint256 => mapping(address => uint256)) public totalTokenBBought;
    mapping(uint256 => mapping(address => uint256)) public pendingTokenAAmount;
    mapping(uint256 => mapping(address => uint256)) public pendingTokenAAmountClaimed;
    mapping(uint256 => ClaimBatch[]) public claimBatches;
    mapping(uint256 => mapping(address => uint8)) public currentClaimBatch;

    constructor(address _weth) {
        WETH = _weth;
    }

    modifier isValidPool (uint256 poolIdx) {
        require(poolIdx < totalPools, "invalid_pool");
        require(isActivePool[poolIdx], "inactive_pool");
        _;
    }

    function addPool(
        address _tokenA, 
        address _tokenB, 
        uint256 _tokenAPrice, 
        uint256 _tokenAmountAPreOrder,
        uint256 _maxTokenBCanBuy,
        uint32 _startTime,
        uint32 _startTimeSwapFrom,
        uint32 _startTimeSwapDuration,
        uint32 _startTimeClaim
    ) external onlyOwner {
        require(_tokenA != WETH, "tokenA_cannot_WETH");
        require(_startTime != 0 || _startTimeSwapFrom != 0 || _startTimeSwapDuration != 0 || _startTimeClaim != 0, "time_must_not_zero");
        require(_startTime <= _startTimeSwapFrom, "swap_time_must_be_greater_than_start_time_of_pool");
        require(_startTimeSwapFrom + _startTimeSwapDuration <= _startTimeClaim, "claim_time_must_be_greater_than_swap_time");
        uint256 idx = totalPools;
        isActivePool[idx] = true;
        tokenAB[idx] = TokenAB({
            tokenA: _tokenA,
            tokenB: _tokenB
        });
        tokenAPrice[idx] = _tokenAPrice;
        tokenAmountAPreOrder[idx] = _tokenAmountAPreOrder;
        maxTokenBCanBuy[idx] = _maxTokenBCanBuy;
        startTime[idx] = _startTime;
        startTimeSwap[idx] = Time({
            from: _startTimeSwapFrom,
            duration: _startTimeSwapDuration
        });
        startTimeClaim[idx] = _startTimeClaim;
        totalPools++;
    }

    function addToWhitelist(uint256 poolIdx, address[] memory _addr) external onlyOwner isValidPool(poolIdx) {
        for(uint256 i = 0; i < _addr.length; i++) {
            _addToWhitelist(poolIdx, _addr[i]);
        }
    } 

    function _addToWhitelist(uint256 poolIdx, address _addr) private {
        require(!whitelist[poolIdx][_addr], "alredy_added_whitelist");
        whitelist[poolIdx][_addr] = true;
    } 

    function addClaimBatch(uint256 poolIdx, uint32 _timestamp, uint16 _claimPercent) public onlyOwner isValidPool(poolIdx) {
        require(_claimPercent <= 1e5, "over_max_percent");
        claimBatches[poolIdx].push(ClaimBatch({
            timestamp: _timestamp,
            claimPercent: _claimPercent
        }));
    }

    function getClaimBatches(uint256 poolIdx) external view returns(ClaimBatch[] memory) {
        return claimBatches[poolIdx];
    }

    function setStartTimeSwap(uint256 poolIdx, uint32 _from, uint32 _duration) public onlyOwner isValidPool(poolIdx) {
        require(startTime[poolIdx] <= _from, "swap_time_must_be_greater_than_start_time_of_pool");
        startTimeSwap[poolIdx] = Time({
            from: _from,
            duration: _duration
        });
    }

    function setStartTimeClaim(uint256 poolIdx, uint32 _from) public onlyOwner isValidPool(poolIdx) {
        require(startTimeSwap[poolIdx].from != 0, "swap_time_not_set");
        require(startTimeSwap[poolIdx].from + startTimeSwap[poolIdx].duration <= _from, "claim_time_must_be_greater_than_swap_time");
        startTimeClaim[poolIdx] = _from;
    }

    function getAmountIn(uint256 poolIdx, uint256 amountA) public view isValidPool(poolIdx) returns(uint256)  {
        return amountA*tokenAPrice[poolIdx]/1e18;
    }

    function getAmountOut(uint256 poolIdx, uint256 amountB) public view isValidPool(poolIdx) returns(uint256) {
        return amountB*1e18/tokenAPrice[poolIdx];
    }

    modifier inWhitelist(uint256 poolIdx) {
        require(whitelist[poolIdx][_msgSender()], "not_in_whitelist_of_pool");
        _;
    }

    function _buyPreOrder(uint256 poolIdx, uint256 amountB) private isValidPool(poolIdx) inWhitelist(poolIdx) {
        uint256 amountA = getAmountOut(poolIdx, amountB);
        require(startTimeSwap[poolIdx].from != 0 && startTimeSwap[poolIdx].from < block.timestamp, "swap_time_not_set_or_not_started");
        require(startTimeSwap[poolIdx].from + startTimeSwap[poolIdx].duration > block.timestamp, "swap_time_ended");
        require(totalAmountABought[poolIdx] <= tokenAmountAPreOrder[poolIdx], "reach_maximum_token_in_pool");
        require(IERC20(tokenAB[poolIdx].tokenA).balanceOf(address(this)) >= amountA, "not_enough_token_in_pool");
        address sender = _msgSender();
        uint256 _amountBBought = totalTokenBBought[poolIdx][sender] + amountB;
        require(_amountBBought <= maxTokenBCanBuy[poolIdx], "reach_maximum_amount_can_buy");
        totalTokenBBought[poolIdx][sender] = _amountBBought;
        totalAmountABought[poolIdx] += amountA;
        pendingTokenAAmount[poolIdx][sender] += amountA;
    }

    function buyPreOrder(uint256 poolIdx, uint256 amountB) external isValidPool(poolIdx) inWhitelist(poolIdx)  {
        require(tokenAB[poolIdx].tokenB != WETH);
        address sender = _msgSender();
        IERC20 tokenB = IERC20(tokenAB[poolIdx].tokenB);
        require(tokenB.allowance(sender, address(this)) >= amountB, "ERC20: ALLOWANCE_NOT_ENOUGH");
        bool success = tokenB.transferFrom(sender, address(this), amountB);
        require(success, "ENOUGH_TOKEN_B_TO_DO_TRANSACTION");
        _buyPreOrder(poolIdx, amountB);
    }

    function buyPreOrderWETH(uint256 poolIdx, uint256 amountB) external isValidPool(poolIdx) inWhitelist(poolIdx) payable {
        require(tokenAB[poolIdx].tokenB == WETH);
        require(msg.value >= amountB,"ENOUGH_TOKEN_B_TO_DO_TRANSACTION");
        _buyPreOrder(poolIdx, amountB);
    }

    function claimPendingToken(uint256 poolIdx) external isValidPool(poolIdx) inWhitelist(poolIdx) {
        require(startTimeClaim[poolIdx] != 0 && startTimeClaim[poolIdx] < block.timestamp, "claim_time_not_set_or_not_started");
        require(pendingTokenAAmount[poolIdx][_msgSender()] > 0 , "not_have_pending_token");
        uint8 idx = currentClaimBatch[poolIdx][_msgSender()];
        ClaimBatch memory currentBatch = claimBatches[poolIdx][idx];
        uint256 requireTime = uint256(startTimeClaim[poolIdx]) + uint256(currentBatch.timestamp);
        require(requireTime < block.timestamp, "not_started_batch_claim");
        uint256 pendingClaim = pendingTokenAAmount[poolIdx][_msgSender()] * currentBatch.claimPercent / 1e5;
        require(pendingTokenAAmount[poolIdx][_msgSender()] - pendingClaim >= 0, "not_have_pending_token");
        pendingTokenAAmount[poolIdx][_msgSender()] -= pendingClaim;
        pendingTokenAAmountClaimed[poolIdx][_msgSender()] += pendingClaim;
        currentClaimBatch[poolIdx][_msgSender()]++;
        IERC20(tokenAB[poolIdx].tokenA).transfer(_msgSender(), pendingClaim);
    }

    function withdrawAllTokenAB(uint256 poolIdx) external onlyOwner isValidPool(poolIdx) {
        IERC20 tokenA = IERC20(tokenAB[poolIdx].tokenA);
        IERC20 tokenB = IERC20(tokenAB[poolIdx].tokenB);
        tokenA.transfer(_msgSender(), tokenA.balanceOf(address(this)));
        tokenB.transfer(_msgSender(), tokenB.balanceOf(address(this)));
    }
}