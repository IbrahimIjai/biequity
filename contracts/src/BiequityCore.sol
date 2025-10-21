// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IPyth} from "@pyth-network/IPyth.sol";

import {BiequityTokenFactory} from "./BiequityTokenFactory.sol";

contract BiequityCore is Ownable {
    BiequityTokenFactory public immutable FACTORY;
    IERC20 public immutable USDC;
    IPyth public immutable PYTH; // Pyth oracle
    address public treasury;
    address private operator;

    enum TokenState {
        Issued,
        PendingSettlement,
        Settled
    }

    struct Position {
        uint256 amount;
        TokenState state;
    }

    struct StockConfig {
        address tokenAddress;
        uint256 id;
        uint256 totalIssued;
        uint256 totalBacked;
        uint256 totalPending;
        uint256 usdcBalance;
        uint256 minBackedRatio;
        bytes32 pythFeedId;
        bool active;
    }

    uint256 public stockCounter = 0; //STOCKS IDs
    uint256 public constant FEE_BPS = 300; // 3%

    mapping(address => StockConfig) public stocksByToken;
    mapping(string => address) public tokenBySymbol;

    event StockRegistered(
        string symbol,
        uint256 id,
        bytes32 pythFeedId,
        address tokenAddress
    );
    event TokensMinted(string symbol, uint256 amount, uint256 netUsdc);
    event TokensSettled(string symbol, uint256 amount);
    event TokensRedeemed(string symbol, uint256 amount, uint256 usdcOut);

    constructor(
        address _usdc,
        address _pyth,
        address _treasury
    ) Ownable(msg.sender) {
        operator = msg.sender;
        // Initialize core dependencies
        USDC = IERC20(_usdc);

        // https://docs.pyth.network/price-feeds/contract-addresses/evm
        // BASE = 0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a
        // BASE-SEPOLIIA = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729
        PYTH = IPyth(_pyth);
        treasury = _treasury;
        // Deploy a TokenFactory bound to this core (granted MINTER_ROLE)
        FACTORY = new BiequityTokenFactory(address(this));
    }

    function registerStock(
        string calldata symbol,
        string calldata name,
        bytes32 pythFeedId,
        uint256 minBackedRatio
    ) external onlyOwner {
        require(tokenBySymbol[symbol] == address(0), "Stock exists");

        FACTORY.deployToken(
            symbol,
            string(abi.encodePacked("Biequity ", name)),
            symbol
        );

        address tokenAddr = FACTORY.deployedTokens(symbol);
        stockCounter++;
        stocksByToken[tokenAddr] = StockConfig({
            tokenAddress: tokenAddr,
            id: stockCounter,
            totalIssued: 0,
            totalBacked: 0,
            totalPending: 0,
            usdcBalance: 0,
            minBackedRatio: minBackedRatio,
            pythFeedId: pythFeedId,
            active: true
        });
        tokenBySymbol[symbol] = tokenAddr;

        emit StockRegistered(symbol, stockCounter, pythFeedId, tokenAddr);
    }
}
