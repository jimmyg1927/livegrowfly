import dynamic from 'next/dynamic';

// ✅ Dynamically import the client component
const SignUpForm = dynamic(() => import('./SignUpForm'), {
  ssr: false, // ✅ disable server-side rendering
});

export default function SignUpPage() {
  return <SignUpForm />;
}
