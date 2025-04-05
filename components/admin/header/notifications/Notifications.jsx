import React from 'react'
import NotificationItem from './NotificationItem'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { clearAlert, removeAlert } from '../../../store/alertSlice';

function Notifications({ notifications }) {
    const dispatch = useDispatch();

    const handleClearAll = () => {
        dispatch(clearAlert());
    };

    const handleCloseAlert = (index) => {
        dispatch(removeAlert(index));
    };

    return (
        <>
            <li className={`nav-item dropdown`}>
                <Link href={`#`} className={`nav-link nav-icon`} onClick={(e) => e.preventDefault()} data-bs-toggle={`dropdown`}>
                    <i className={`bi bi-bell`}></i>
                    <span className={`badge bg-primary badge-number`}>{notifications?.length}</span>
                </Link>

                <ul className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications rounded-25 card-color`}>
                    <li className={`dropdown-header`}>
                        You have {notifications?.length} new notifications
                        <Link href={`#`} onClick={handleClearAll} >
                            <span className={`badge rounded-pill bg-primary p-2 ms-2`} >Clear all</span>
                        </Link>
                    </li>

                    <li><hr className={`dropdown-divider`} /></li>

                    {notifications?.map((notification, index) => (
                        <React.Fragment key={index}>
                            <NotificationItem
                                iconClass={notification?.iconClass}
                                iconColor={notification?.iconColor}
                                title={notification?.title}
                                description={notification?.description}
                                time={notification?.time}
                                omClick={handleCloseAlert(index)}
                            />
                            <li><hr className={`dropdown-divider`} /></li>
                        </React.Fragment>
                    ))}

                    {/* <li className={`dropdown-footer`}>
                        <Link href={`#`} onClick={handleClearAll}>Clear all</Link>
                    </li> */}
                </ul>
            </li>
        </>
    )
}

export default Notifications