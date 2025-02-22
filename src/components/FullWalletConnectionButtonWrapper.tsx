import { useSupportedChains } from '@hooks/app/useSupportedChains'
import { ButtonTheme } from '@pooltogether/react-components'
import { FullWalletConnectionButton } from '@pooltogether/wallet-connection'
import { Trans } from 'next-i18next'

/**
 * NOTE: Only render one per app
 * @param props
 * @returns
 */
export const FullWalletConnectionButtonWrapper = (props) => {
  const chains = useSupportedChains()

  return (
    <FullWalletConnectionButton
      {...props}
      chains={chains}
      theme={ButtonTheme.transparent}
      TosDisclaimer={
        <Trans
          i18nKey='connectWalletTermsAndDisclaimerBlurb'
          components={{
            termsLink: (
              <a
                className='text-pt-teal transition hover:opacity-70 underline'
                href='https://pooltogether.com/terms/'
                target='_blank'
                rel='noreferrer'
              />
            ),
            disclaimerLink: (
              <a
                className='text-pt-teal transition hover:opacity-70 underline'
                href='https://pooltogether.com/protocol-disclaimer/'
                target='_blank'
                rel='noreferrer'
              />
            )
          }}
        />
      }
    />
  )
}
