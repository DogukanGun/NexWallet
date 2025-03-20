import React from 'react';
import { darkTheme, SwapWidget } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css'

const UniswapComponent: React.FC = () => {
    return (
        <div>
            <SwapWidget
                theme={darkTheme}
                defaultInputTokenAddress="0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH Address
                defaultOutputTokenAddress="0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" // USDC Address
            />        
            </div>
    );
};

export default UniswapComponent;
