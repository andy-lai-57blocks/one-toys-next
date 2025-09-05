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
      
      // Skip www subdomain
      if (subdomain === 'www') return;
      
      const targetRoute = getRouteFromSubdomain(subdomain);
      
      if (targetRoute && window.location.pathname === '/') {
        // Get main domain (remove subdomain)
        const mainDomain = hostParts.slice(1).join('.');
        const protocol = window.location.protocol;
        
        // Redirect to main domain with tool path
        const redirectUrl = `${protocol}//${mainDomain}${targetRoute}`;
        
        // Use window.location.href for full redirect (changes domain)
        window.location.href = redirectUrl;
        
        return; // Exit early since we're doing a full redirect
      }
      
      // If subdomain doesn't match any tool, redirect to main domain with search
      if (!targetRoute && window.location.pathname === '/') {
        const mainDomain = hostParts.slice(1).join('.');
        const protocol = window.location.protocol;
        
        // Redirect to search with subdomain as query
        const searchUrl = `${protocol}//${mainDomain}/search?q=${encodeURIComponent(subdomain)}`;
        window.location.href = searchUrl;
      }
    }
  }, [router]);
};
