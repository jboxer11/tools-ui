import { AutoClaim } from '@autoClaim/index'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'next/head'
import { NextPage } from 'next/types'
import nextI18NextConfig from '../../next-i18next.config.js'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig))
    }
  }
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Auto Claim - PoolTogether</title>
        <meta name='description' content='Have prizes autoclaimed for a small fee.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <AutoClaim />
    </>
  )
}

export default Home
