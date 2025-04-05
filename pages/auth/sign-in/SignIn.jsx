import React from 'react'
import Link from 'next/link'
import Designedby from '@/admin/footer/designedby/Designedby'
import { SignInForm } from './SignInForm';

function SignIn() {
  return (
    <>
      <div className={`container`}>
        <section className={`section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4`}>
          <div className={`container`}>
            <div className={`row justify-content-center`}>
              <div className={`col-lg-5 col-md-7 d-flex flex-column align-items-center justify-content-center`}>
                <div className={`d-flex justify-content-center py-4`}>
                  <Link href={`#`} className={`logo d-flex align-items-center w-auto`} >
                    <span className={`d-none d-lg-block`}>Admin</span>
                  </Link>
                </div>
                <div className={`card mb-3`}>
                  <div className={`card-body`}>
                    <div className={`pt-4 pb-2`}>
                      <h5 className={`card-title text-center pb-0 fs-4`}>Login to Your Account</h5>
                    </div>
                    <SignInForm />
                  </div>
                </div>
                <Designedby />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default SignIn