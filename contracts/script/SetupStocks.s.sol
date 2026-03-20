// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/BiequityCore.sol";

contract SetupStocksScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address coreAddress = 0x5558A1F92192f1941fa0B965FC6715195f9221f0;
        BiequityCore core = BiequityCore(coreAddress);

        vm.startBroadcast(deployerPrivateKey);

        // TSLA/USD
        core.registerStock(
            "TSLA",
            "Tesla Inc",
            0x16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1,
            100 // minBackedRatio
        );

        // AAPL/USD
        core.registerStock(
            "AAPL",
            "Apple Inc",
            0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688,
            100
        );

        // MSFT/USD
        core.registerStock(
            "MSFT",
            "Microsoft Corp",
            0xd0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1,
            100
        );

        vm.stopBroadcast();
    }
}
