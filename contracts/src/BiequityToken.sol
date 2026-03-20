// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {IIdentityRegistry} from "./interfaces/IIdentityRegistry.sol";

/// @title BiequityToken
/// @notice ERC-20 token representing a tokenized real-world stock position.
/// @dev Implements a simplified ERC-3643 (T-REX) compliance layer:
///      - Every transfer is gated by an on-chain IdentityRegistry (KYC check).
///      - Mint is restricted to MINTER_ROLE (held by BiequityCore).
///      - Transfers can be paused by PAUSER_ROLE (held by BiequityCore operator).
///      - ERC20Permit enables gasless approvals (useful for DeFi integrations).
///
///      ERC-3643 deviation note: A full T-REX implementation also includes
///      ClaimTopicsRegistry and TrustedIssuersRegistry. Those are omitted here
///      as out of scope for this portfolio implementation — the identity check
///      is the load-bearing compliance primitive.
contract BiequityToken is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice The underlying stock ticker this token represents (e.g. "TSLA").
    string public stockSymbol;

    /// @notice The ERC-3643 identity registry. All transfers are validated against this.
    IIdentityRegistry public identityRegistry;

    /// @notice Emitted when the identity registry is updated.
    event IdentityRegistrySet(address indexed registry);

    /// @notice Transfer blocked because sender or recipient is not KYC-verified.
    error TransferNotCompliant(address from, address to);

    constructor(
        string memory name,
        string memory symbol,
        string memory _stockSymbol,
        address operator,
        address _identityRegistry
    ) ERC20(name, symbol) ERC20Permit(name) {
        stockSymbol = _stockSymbol;
        identityRegistry = IIdentityRegistry(_identityRegistry);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, operator);

        emit IdentityRegistrySet(_identityRegistry);
    }

    /// @notice Update the identity registry (admin only).
    /// @dev Allows rotating the registry without redeploying tokens.
    function setIdentityRegistry(address _registry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        identityRegistry = IIdentityRegistry(_registry);
        emit IdentityRegistrySet(_registry);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /// @dev Override _update to enforce:
    ///      1. ERC20Pausable check (inherited).
    ///      2. ERC-3643 compliance: both sender and recipient must be KYC-verified,
    ///         EXCEPT for mints (from == address(0)) and burns (to == address(0)).
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        // Skip compliance check for mints and burns — only user-to-user transfers are gated.
        bool isMint = from == address(0);
        bool isBurn = to == address(0);

        if (!isMint && !isBurn) {
            if (!identityRegistry.isVerified(from)) {
                revert TransferNotCompliant(from, to);
            }
            if (!identityRegistry.isVerified(to)) {
                revert TransferNotCompliant(from, to);
            }
        }

        super._update(from, to, value);
    }
}
