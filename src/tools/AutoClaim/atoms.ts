import { getChainIdByAlias, getNetworkNameAliasByChainId } from '@pooltogether/utilities'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import { getUrlQueryParam } from '@utils/getUrlQueryParam'
import { atom } from 'jotai'
import { QUERY_PARAM } from './constants'
import { getDefaultAutoClaimChainId } from './utils/getDefaultAutoClaimChainId'
import { getAutoClaimSupportedChainIds } from './utils/getAutoClaimSupportedChainIds'



/**
 * Tries to get the chain id from a query param, otherwise returns the default
 * @returns
 */
const getStartingAutoClaimChainId = () => {
  const defaultChainId = getDefaultAutoClaimChainId()
  const autoClaimChainAlias = getUrlQueryParam(QUERY_PARAM.autoClaimChain)
  if (!autoClaimChainAlias) return defaultChainId
  const queryParamChainId = getChainIdByAlias(autoClaimChainAlias)
  const supportedChainIds = getAutoClaimSupportedChainIds()
  if (supportedChainIds.includes(queryParamChainId)) return queryParamChainId
  return defaultChainId
}

/**
 * The chain id to use for the tokenFaucet view.
 * TODO: Eventually we'll need to update this to a specific deployment when there are more than 1 on a chain.
 */
export const autoClaimChainIdAtom = atom<number>(CHAIN_ID.mainnet)
autoClaimChainIdAtom.onMount = (setAtom) => setAtom(getStartingAutoClaimChainId())

/**
 * The default autoclaim address to use for the autoClaim view.
 */
export const autoClaimAddressAtom = atom<string>('')

/**
 * Write-only
 */
export const setAutoClaimChainAtom = atom<null, number>(null, (get, set, chainId) => {
  if (!chainId) {
    set(autoClaimChainIdAtom, undefined)
    return
  }
  const chainName = getNetworkNameAliasByChainId(chainId)
  const url = new URL(window.location.href)
  url.searchParams.set(QUERY_PARAM.autoClaimChain, chainName)
  window.history.pushState(null, '', url)
  set(autoClaimChainIdAtom, chainId)
})

///////////////////////////// Modals /////////////////////////////

/**
 *
 */
export const claimAutoClaimModalOpenAtom = atom<boolean>(false)
