// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IPyth} from "@pyth-network/IPyth.sol";
import {BiequityToken} from "./BiequityToken.sol";

import {PythStructs} from "@pyth-network/PythStructs.sol";

import {BiequityTokenFactory} from "./BiequityTokenFactory.sol";

contract BiequityCore is Ownable {
    using SafeERC20 for IERC20;
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

    enum StockState {
        Unbacked,
        PartialPending,
        FullySettled
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

    function buy(string calldata symbol, uint256 usdcAmount) external {
        address tokenAddr = tokenBySymbol[symbol];
        require(tokenAddr != address(0), "Stock not registered");
        StockConfig storage stock = stocksByToken[tokenAddr];
        require(stock.active, "Stock inactive");
        require(usdcAmount > 0, "Invalid amount");

        // Use SafeERC20 wrappers to handle non-standard ERC20 implementations
        USDC.safeTransferFrom(msg.sender, address(this), usdcAmount);
        stock.usdcBalance += usdcAmount;

        uint256 fee = _calculateFee(usdcAmount);
        USDC.safeTransfer(treasury, fee);
        stock.usdcBalance -= fee;

        uint256 netUsdc = usdcAmount - fee;

        uint256 tokens = _getStockAmtFromUsd(symbol, netUsdc);

        BiequityToken(tokenAddr).mint(msg.sender, tokens);

        stock.totalIssued += tokens;
        stock.totalPending += tokens;

        emit TokensMinted(symbol, tokens, netUsdc);
    }

    function settleTokens(
        string calldata symbol,
        uint256 amount
    ) external onlyOwner {
        address tokenAddr = tokenBySymbol[symbol];
        require(tokenAddr != address(0), "Stock not registered");
        StockConfig storage stock = stocksByToken[tokenAddr];
        require(stock.totalPending >= amount, "Exceeds pending");
        require(
            stock.totalIssued >= stock.totalBacked + amount,
            "Exceeds issued"
        );

        stock.totalBacked += amount;
        stock.totalPending -= amount;

        emit TokensSettled(symbol, amount);
    }

    function redeem(string calldata symbol, uint256 tokenAmount) external {
        address tokenAddr = tokenBySymbol[symbol];
        require(tokenAddr != address(0), "Stock not registered");
        StockConfig storage stock = stocksByToken[tokenAddr];
        require(stock.active, "Stock inactive");
        require(
            IERC20(tokenAddr).balanceOf(msg.sender) >= tokenAmount,
            "Insufficient"
        );

        require(
            stock.totalBacked >=
                (stock.totalIssued * stock.minBackedRatio) / 100,
            "Not fully backed"
        );

        // Compute price in USDC base units per 1 token, then convert to USDC out
        uint8 usdcDecimals = IERC20Metadata(address(USDC)).decimals();
        uint256 priceUsdcUnits = _getPythPriceInUsdcUnits(
            stock.pythFeedId,
            usdcDecimals
        );
        uint256 usdcOut = (tokenAmount * priceUsdcUnits) / (10 ** 18);
        uint256 fee = _calculateFee(usdcOut);
        USDC.safeTransfer(treasury, fee);
        stock.usdcBalance -= fee;

        USDC.safeTransfer(msg.sender, usdcOut - fee);
        stock.usdcBalance -= (usdcOut - fee);

        BiequityToken(tokenAddr).burnFrom(msg.sender, tokenAmount);
        stock.totalIssued -= tokenAmount;
        stock.totalPending = stock.totalIssued > stock.totalBacked
            ? stock.totalIssued - stock.totalBacked
            : 0;

        emit TokensRedeemed(symbol, tokenAmount, usdcOut - fee);
    }

    function withdrawUsdcFromStock(
        address tokenAddr,
        uint256 amount
    ) external onlyOwner {
        StockConfig storage stock = stocksByToken[tokenAddr];
        require(
            address(stock.tokenAddress) != address(0),
            "Stock not registered"
        );
        require(stock.usdcBalance >= amount, "Insufficient stock balance");
        stock.usdcBalance -= amount;
        USDC.safeTransfer(msg.sender, amount);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }

    function getStockConfigByToken(
        address tokenAddr
    )
        external
        view
        returns (
            address _tokenAddress,
            uint256 id,
            uint256 totalIssued,
            uint256 totalBacked,
            uint256 totalPending,
            uint256 usdcBalance,
            uint256 minBackedRatio,
            bytes32 pythFeedId,
            bool active,
            StockState computedState
        )
    {
        StockConfig storage stock = stocksByToken[tokenAddr];
        require(
            address(stock.tokenAddress) != address(0),
            "Stock not registered"
        );
        _tokenAddress = stock.tokenAddress;
        id = stock.id;
        totalIssued = stock.totalIssued;
        totalBacked = stock.totalBacked;
        totalPending = stock.totalPending;
        usdcBalance = stock.usdcBalance;
        minBackedRatio = stock.minBackedRatio;
        pythFeedId = stock.pythFeedId;
        active = stock.active;

        if (totalIssued == 0) {
            computedState = StockState.Unbacked;
        } else if (totalBacked < totalIssued) {
            computedState = StockState.PartialPending;
        } else {
            computedState = StockState.FullySettled;
        }
    }

    function getStockAmtFromUsd(
        string calldata symbol,
        uint256 usdAmount
    ) external view returns (uint256) {
        return _getStockAmtFromUsd(symbol, usdAmount);
    }

    // Returns price in USDC base units per 1 token (i.e., scaled by 10^usdcDecimals)
    function _getPythPriceInUsdcUnits(
        bytes32 feedId,
        uint8 usdcDecimals
    ) internal view returns (uint256) {
        PythStructs.Price memory price = PYTH.getPriceUnsafe(feedId);
        if (price.price <= 0) revert("Invalid price");
        int32 expo = price.expo;
        require(expo >= -77 && expo <= 77, "expo out of range");
        uint256 base = uint256(int256(price.price));

        if (expo < 0) {
            // expo is in [-77, -1] here due to the require above; casting to uint32 is safe
            // because -expo is in [1, 77], and then widening to uint256 cannot truncate.
            // forge-lint: disable-next-line(unsafe-typecast)
            uint256 denom = 10 ** uint256(uint32(-expo));
            return (base * (10 ** usdcDecimals)) / denom;
        } else if (expo > 0) {
            // expo is in [1, 77] here due to the require above; casting to uint32 is safe
            // and then widening to uint256 cannot truncate.
            // forge-lint: disable-next-line(unsafe-typecast)
            uint256 mul = 10 ** uint256(uint32(expo));
            return base * (10 ** usdcDecimals) * mul;
        } else {
            return base * (10 ** usdcDecimals);
        }
    }

    function _getStockAmtFromUsd(
        string calldata symbol,
        uint256 usdAmount
    ) internal view returns (uint256) {
        address tokenAddr = tokenBySymbol[symbol];
        require(tokenAddr != address(0), "Stock not registered");
        StockConfig storage stock = stocksByToken[tokenAddr];
        // price in USDC base units per 1 token
        uint8 usdcDecimals = IERC20Metadata(address(USDC)).decimals();
        uint256 priceUsdcUnits = _getPythPriceInUsdcUnits(
            stock.pythFeedId,
            usdcDecimals
        );
        // tokens (1e18) = usdAmount (USDC base units) * 1e18 / priceUsdcUnits
        return (usdAmount * 1e18) / priceUsdcUnits;
    }

    function _calculateFee(uint256 amount) internal pure returns (uint256) {
        return (amount * FEE_BPS) / 10000;
    }
}
