// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title IIdentityRegistry
/// @notice Simplified ERC-3643 identity registry interface.
/// @dev In production this would be backed by an on-chain KYC/AML oracle (e.g. Fractal, Quadrata).
///      For this portfolio implementation, the owner manually whitelists addresses.
interface IIdentityRegistry {
    /// @notice Returns true if `investor` has passed KYC and is allowed to hold/transfer tokens.
    function isVerified(address investor) external view returns (bool);

    /// @notice Emitted when an investor's verification status changes.
    event IdentityVerified(address indexed investor, bool verified);
}
