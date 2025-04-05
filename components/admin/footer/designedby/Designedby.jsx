import React from 'react'
import Link from 'next/link'

function Designedby() {
    return (
        <>
            <div className={`credits pt-0 pb-2`}>
                Designed by  <Link href={`#`}> Frank And Hub </Link>
            </div>
        </>
    )
}

export default Designedby