import { Suspense } from 'react';
import SignupClient from './SignupClient';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading signup form...</div>}>
      <SignupClient />
    </Suspense>
  );
}
