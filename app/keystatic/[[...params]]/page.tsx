import dynamic from 'next/dynamic';

const KeystaticApp = dynamic(
  () => import('../keystatic'),
  { ssr: false }
);

export default function Page() {
  return <KeystaticApp />;
}
