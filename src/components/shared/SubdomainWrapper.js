'use client';

import { useSubdomainRedirect } from '@/hooks/useSubdomainRedirect';

const SubdomainWrapper = ({ children }) => {
  // Handle subdomain routing on client side
  useSubdomainRedirect();
  
  return children;
};

export default SubdomainWrapper;
