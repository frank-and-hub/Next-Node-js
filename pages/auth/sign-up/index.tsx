import React from 'react'
import SignUp from './SignUp'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Next app sign up page" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SignUp />
    </>
  )
}
