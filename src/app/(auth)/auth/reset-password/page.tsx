import { Suspense } from 'react';
import ResetPasswordPage from '../../../../components/auth/ResetPasswordPage';

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
};

export default page;