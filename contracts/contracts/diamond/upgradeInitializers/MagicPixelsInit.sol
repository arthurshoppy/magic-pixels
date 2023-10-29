// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { DiamondInit } from "./DiamondInit.sol";
import { LibPixels } from "../libraries/LibPixels.sol";

contract MagicPixelsInit is DiamondInit {    

    function init() public override {
        super.init();

        LibPixels.Storage storage s = LibPixels.store();

        s.PLATE_SIZE = 16;
				s.MIN_PIXEL = 1;
        s.MAX_PIXEL = 191;
        s.PIXEL_DEPTH = 2;
        
        s.ETH_PROB = 10000;
        s.ETH_PERC = 10;

        s.PRICE = 0.00006 ether;

        s.DEPTH_PROBS = [80_000, 100_000];
    }

}