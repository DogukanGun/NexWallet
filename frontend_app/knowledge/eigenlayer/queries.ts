export const queries = {
  stakingPools: (address?: string) => `
    query {
      stakingPools {
        id
        totalShares
        totalStaked
        ${address ? `
        delegators(where: {address: "${address}"}) {
          shares
          stakedAmount
        }` : ''}
      }
    }
  `,

  delegators: (first: number = 100, skip: number = 0) => `
    query {
      delegators(first: ${first}, skip: ${skip}) {
        id
        address
        totalShares
        totalStaked
      }
    }
  `,

  operators: (first: number = 100, skip: number = 0) => `
    query {
      operators(first: ${first}, skip: ${skip}) {
        id
        address
        totalDelegated
        delegatorCount
      }
    }
  `
}; 