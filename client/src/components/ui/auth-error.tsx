
import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

interface AuthErrorProps {
  error: {
    error: string;
    message: string;
    userRoles?: string[];
  };
  onRetry?: () => void;
}

export function AuthError({ error, onRetry }: AuthErrorProps) {
  const isAuthRequired = error.error === 'Authentication required';
  const isInsufficientPermissions = error.error === 'Insufficient permissions';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive" className="border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            {isAuthRequired ? (
              <Shield className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle className="text-red-800 dark:text-red-200">
              {isAuthRequired ? 'Authentication Required' : 'Access Denied'}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2 text-red-700 dark:text-red-300">
            {error.message}
          </AlertDescription>
          
          {isInsufficientPermissions && error.userRoles && error.userRoles.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                Your current Discord roles:
              </p>
              <div className="flex flex-wrap gap-1">
                {error.userRoles.map((role, index) => (
                  <span
                    key={index}
                    className="inline-block bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Alert>

        <div className="text-center space-y-3">
          {isAuthRequired ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please log in with your Replit account to continue.
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Contact a server administrator to get the required roles.
            </p>
          )}
          
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
