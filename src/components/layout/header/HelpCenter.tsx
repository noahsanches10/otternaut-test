import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { useNavigate } from 'react-router-dom';

interface HelpCenterProps {
  className?: string;
}

export function HelpCenter({ className }: HelpCenterProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full"
      onClick={() => navigate('/help')}
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );
}