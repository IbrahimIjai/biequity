// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";

/// @title IdentityRegistry
/// @notice Simplified on-chain KYC whitelist implementing IIdentityRegistry.
/// @dev ERC-3643 (T-REX) compliant identity registry.
///      Production implementation would integrate with an oracle (Fractal, Quadrata, etc.)
///      and store claim topics (e.g. KYC_APPROVED = 1, ACCREDITED_INVESTOR = 2).
contract IdentityRegistry is IIdentityRegistry, Ownable {
    /// @dev Maps investor address to verification status.
    mapping(address => bool) private _verified;

    /// @notice Claim topic constant: KYC approved (mirrors T-REX ClaimTopicsRegistry).
    uint256 public constant KYC_APPROVED = 1;

    constructor() Ownable(msg.sender) {}

    /// @inheritdoc IIdentityRegistry
    function isVerified(address investor) external view override returns (bool) {
        return _verified[investor];
    }

    /// @notice Whitelist an investor after KYC verification.
    /// @param investor The address to whitelist.
    function addVerifiedInvestor(address investor) external onlyOwner {
        _verified[investor] = true;
        emit IdentityVerified(investor, true);
    }

    /// @notice Remove an investor from the whitelist (e.g. compliance breach).
    /// @param investor The address to remove.
    function removeVerifiedInvestor(address investor) external onlyOwner {
        _verified[investor] = false;
        emit IdentityVerified(investor, false);
    }

    /// @notice Batch whitelist multiple investors (gas efficient for onboarding).
    /// @param investors Array of addresses to whitelist.
    function batchAddVerifiedInvestors(address[] calldata investors) external onlyOwner {
        for (uint256 i = 0; i < investors.length; i++) {
            _verified[investors[i]] = true;
            emit IdentityVerified(investors[i], true);
        }
    }
}
