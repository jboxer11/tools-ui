
import { APP_ENVIRONMENTS, getStoredIsTestnetsCookie } from '@pooltogether/hooks'
import { AUTO_CLAIM_SUPPORTED_CHAIN_IDS } from '@autoClaim/config'

/**
 *
 * @returns
 */
export const getAutoClaimSupportedChainIds = () => {
  const isTestnets = getStoredIsTestnetsCookie()
  return isTestnets
    ? AUTO_CLAIM_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.testnets]
    : AUTO_CLAIM_SUPPORTED_CHAIN_IDS[APP_ENVIRONMENTS.mainnets]
}
