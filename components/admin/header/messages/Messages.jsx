import React from 'react'
import Link from 'next/link'

export default function Messages() {
    return (
        <>
            <li className={`nav-item dropdown`}>
                <Link href={`#`} className={`nav-link nav-icon`} onClick={(e) => e.preventDefault()} data-bs-toggle={`dropdown`}>
                    <i className={`bi bi-chat-left-text`}></i>
                    <span className={`badge bg-success badge-number`}>3</span>
                </Link>
                <ul className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow messages rounded-25 card-color`}>
                    <li className={`dropdown-header`}>
                        You have 3 new messages
                        <Link href={`#`} onClick={(e) => e.preventDefault()}><span className={`badge rounded-pill bg-primary p-2 ms-2`}>View all</span></Link>
                    </li>
                    <li className={`dropdown-footer`}>
                        <Link href={`#`} onClick={(e) => e.preventDefault()}>Show all messages</Link>
                    </li>
                </ul>
            </li>
        </>
    )
}
