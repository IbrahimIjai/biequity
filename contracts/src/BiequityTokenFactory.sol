// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {BiequityToken} from "./BiequityToken.sol";

contract BiequityTokenFactory {
    address public immutable CORE; // granted MINTER_ROLE
    mapping(string => address) public deployedTokens;

    event TokenDeployed(string symbol, address tokenAddress);

    constructor(address _core) {
        CORE = _core;
    }

    function deployToken(
        string calldata symbol,
        string calldata name,
        string calldata stockSymbol
    ) external {
        require(deployedTokens[symbol] == address(0), "Token already deployed");

        BiequityToken newToken = new BiequityToken(
            name,
            string(abi.encodePacked("bie", stockSymbol)),
            stockSymbol,
            CORE
        );
        newToken.grantRole(newToken.MINTER_ROLE(), CORE);
        deployedTokens[symbol] = address(newToken);

        emit TokenDeployed(symbol, address(newToken));
    }
}
