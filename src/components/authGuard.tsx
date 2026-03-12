// components/AuthGuard.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { selectIsAuthenticated } from '@/redux/slices/businessOwnerSlice';
import { useAppSelector } from '@/redux/hook';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;