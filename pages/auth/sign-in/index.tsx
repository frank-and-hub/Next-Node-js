import React from 'react'
import SignIn from './SignIn'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Sign In</title>
        <meta name="description" content="Next app sign in page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        </Head>
      <SignIn />
    </>
  )
}
