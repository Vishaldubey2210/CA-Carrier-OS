'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/jobs');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: '#71717A', fontSize: '0.875rem' }}>
      Redirecting to CA Jobs...
    </div>
  );
}
