import React from 'react'
import Link from 'next/link';
import { useAuth } from '../../../utils/AuthContext';
import { notifySuccess } from '../comman/notification/Notification';
import { post } from '../../../utils/AxiosUtils';
import { useRouter } from 'next/router';

const SignOut = () => {
   const router = useRouter();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    const res = await post(`/sign-out`);
    if (res) {
      await logout();
      notifySuccess(`User sign out...`);
    }
    router.push('/admin/signin')
  }

  return (
    <li>
      <Link
        className={`dropdown-item d-flex align-items-center`}
        onClick={handleSignOut}
      >
        <i className={`bi bi-box-arrow-right`} ></i>
        <span>Sign Out</span>
      </Link>
    </li>
  );
}

export default SignOut;
