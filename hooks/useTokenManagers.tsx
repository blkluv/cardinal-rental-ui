import { getTokenManagersForIssuer } from '@cardinal/token-manager/dist/cjs/programs/tokenManager/accounts'
import type { TokenData } from 'api/api'
import { convertStringsToPubkeys, getTokenDatas } from 'api/api'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'

// import { filterTokens, useProjectConfig } from 'providers/ProjectConfigProvider'
import { useDataHook } from './useDataHook'
import { useWalletId } from './useWalletId'

export const useTokenManagers = () => {
  const walletId = useWalletId()
  // const { config } = useProjectConfig()
  const { connection, environment } = useEnvironmentCtx()
  return useDataHook<TokenData[] | undefined>(
    async () => {
      if (!walletId) return
      // if (environment.index) {
      // const response = await client.query({
      //   query: gql`
      //     query GetTokenManagersForIssuer(
      //       $issuer: PublicKey!
      //       $limit: Int!
      //       $offset: Int!
      //     ) {
      //       cardinal_token_managers(
      //         issuer: $issuer
      //         limit: $limit
      //         offset: $offset
      //       ) {
      //         token_manager_address
      //         mint
      //         amount
      //         state
      //         state_changed_at
      //       }
      //     }
      //   `,
      //   variables: {
      //     issuer: walletId.toBase58(),
      //     offset: 0,
      //     limit: 200,
      //   },
      // })
      // return response.data
      if (environment.api) {
        const response = await fetch(
          `${environment.api}/tokenManagersByState?cluster=${environment.label}`
          // &collection=${config.name}`
        )
        const json = (await response.json()) as { data: TokenData[] }
        console.log(json)
        return json.data.map((tokenData) => convertStringsToPubkeys(tokenData))
      } else {
        const tokenManagerDatas = await getTokenManagersForIssuer(
          connection,
          walletId
        )
        return getTokenDatas(connection, tokenManagerDatas)
        // tokenDatas = filterTokens(environment.label, config.filters, tokenDatas)
        // return tokenDatas
      }
    },
    [],
    { name: 'useTokenManagersByState', refreshInterval: 200000 }
  )
}