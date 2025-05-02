import UniswapComponent from './tools/UniswapComponent';

export type ComponentType = 'uniswap';

export const componentFactory = (type: ComponentType) => {
    switch (type) {
        case 'uniswap':
            return UniswapComponent;
        default:
            throw new Error(`Unknown component type: ${type}`);
    }
};
