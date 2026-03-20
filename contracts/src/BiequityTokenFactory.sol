// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {BiequityToken} from "./BiequityToken.sol";

/// @title BiequityTokenFactory
/// @notice Deploys BiequityToken instances on behalf of BiequityCore.
/// @dev Each deployed token shares the same identity registry (deployed by BiequityCore),
///      allowing consistent compliance rules across all stocks.
///
///      Security note: deployToken is restricted to CORE only — in the original
///      implementation there was no access control here, allowing anyone to deploy tokens.
contract BiequityTokenFactory {
    address public immutable CORE;
    address public immutable IDENTITY_REGISTRY;

    mapping(string => address) public deployedTokens;

    event TokenDeployed(string symbol, address tokenAddress);

    constructor(address _core, address _identityRegistry) {
        CORE = _core;
        IDENTITY_REGISTRY = _identityRegistry;
    }

    function deployToken(
        string calldata symbol,
        string calldata name,
        string calldata stockSymbol
    ) external {
        require(msg.sender == CORE, "BiequityTokenFactory: only CORE can deploy");
        require(deployedTokens[symbol] == address(0), "Token already deployed");

        BiequityToken newToken = new BiequityToken(
            name,
            string(abi.encodePacked("bie", stockSymbol)),
            stockSymbol,
            CORE,
            IDENTITY_REGISTRY
        );
        newToken.grantRole(newToken.MINTER_ROLE(), CORE);
        deployedTokens[symbol] = address(newToken);

        emit TokenDeployed(symbol, address(newToken));
    }
}
