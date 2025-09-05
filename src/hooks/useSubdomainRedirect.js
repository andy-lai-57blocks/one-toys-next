'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRouteFromSubdomain } from '@/utils/toolsData';

export const useSubdomainRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hostname = window.location.hostname;
    const hostParts = hostname.split('.');
    
    // Check if it's a subdomain (has more than 2 parts and not localhost)
    if (hostParts.length >= 3 && !hostname.includes('localhost')) {
      const subdomain = hostParts[0].toLowerCase();
      const targetRoute = getRouteFromSubdomain(subdomain);
      
      if (targetRoute && window.location.pathname === '/') {
        // Only redirect from root path to avoid loops
        router.replace(targetRoute);
      }
    }
  }, [router]);
};
