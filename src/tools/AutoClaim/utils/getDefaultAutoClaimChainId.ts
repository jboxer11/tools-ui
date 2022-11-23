import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { AUTO_CLAIM_DEFAULT_CHAIN_ID } from '@autoClaim/config'



/**
 *
 * @returns
 */
export const getDefaultAutoClaimChainId = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? AUTO_CLAIM_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.testnets]
    : AUTO_CLAIM_DEFAULT_CHAIN_ID[APP_ENVIRONMENTS.mainnets]
}
