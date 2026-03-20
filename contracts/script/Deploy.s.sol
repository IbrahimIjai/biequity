// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BiequityCore.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDR");
        address pyth = vm.envAddress("PYTH_ADDR");
        address treasury = vm.envAddress("TREASURY_ADDR");

        vm.startBroadcast(deployerPrivateKey);
        
        new BiequityCore(usdc, pyth, treasury);
        
        vm.stopBroadcast();
    }
}
