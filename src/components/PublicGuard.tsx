// components/PublicGuard.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { selectIsAuthenticated } from '@/redux/slices/businessOwnerSlice';
import { useAppSelector } from '@/redux/hook';

interface PublicGuardProps {
  children: ReactNode;
}

const PublicGuard = ({ children }: PublicGuardProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicGuard;