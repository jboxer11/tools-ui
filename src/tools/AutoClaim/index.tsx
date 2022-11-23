import { PagePadding } from '@components/Layout/PagePadding'
import { PageTitle } from '@components/Layout/PageTitle'
import { LoadingScreen } from '@pooltogether/react-components'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { useAtom } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic.js'
import { Suspense } from 'react'
import { setAutoClaimChainAtom, autoClaimChainIdAtom } from './atoms'
import { AutoClaimDescription } from './AutoClaimDescription'
import { AutoClaimList } from './AutoClaimList'
import { AutoClaimSettings } from './AutoClaimSettings'

const Layout = dynamic(() => import('@components/Layout'), {
  suspense: true
})

export const AutoClaim: React.FC = () => {
  const [chainId] = useAtom(autoClaimChainIdAtom)
  const setChainId = useUpdateAtom(setAutoClaimChainAtom)
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <PagePadding>
          <PageTitle title={t('pooltogetherAutoClaim')} />
          <AutoClaimDescription className='mb-8' />
          <AutoClaimSettings className='mb-8' />
          <AutoClaimList />
        </PagePadding>
      </Layout>
    </Suspense>
  )
}
