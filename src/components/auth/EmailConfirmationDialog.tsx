import React from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { useTheme } from 'next-themes';
import { cn } from '../../lib/utils';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function EmailConfirmationDialog({ isOpen, onClose, email }: EmailConfirmationDialogProps) {
  const { theme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-lg py-6",
        theme === 'dark' ? "bg-white text-gray-900" : "bg-gray-900 text-white"
      )}>
        <DialogHeader>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className={cn(
              "h-5 w-5",
              theme === 'dark' ? "text-gray-900" : "text-white"
            )} />
            <DialogTitle className="text-center text-lg font-semibold">
              Registration Successful
            </DialogTitle>
          </div>
          <DialogDescription className={cn(
            "text-center space-y-1",
            theme === 'dark' ? "text-gray-600" : "text-gray-300"
          )}>
            <p>We've sent a verification email to:</p>
            <p className="font-medium">{email}</p>
            <p>Please check your email (including spam folder) and click the verification link.</p>
          </DialogDescription>
        </DialogHeader>
        <div className={cn(
          "mt-4 pt-4 border-t",
          theme === 'dark' ? "border-gray-200" : "border-gray-700"
        )}>
          <p className={cn(
            "text-sm text-center",
            theme === 'dark' ? "text-gray-600" : "text-gray-300"
          )}>
            If you don't receive the email within 5 minutes, contact{' '}
            <a
              href="mailto:support@otternautcrm.com"
              className={cn(
                "hover:underline",
                theme === 'dark' ? "text-blue-600" : "text-blue-400"
              )}
            >
              support@otternautcrm.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}