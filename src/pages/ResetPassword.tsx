import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { toast } from '../components/ui/toast';

export function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const stripeApiKey = import.meta.env.VITE_STRIPE_RESTRICTED_KEY;
      const stripeUrl = `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email.toLowerCase())}`;

      // const stripeApiKey = import.meta.env.VITE_STRIPE_RESTRICTED_KEY;
      // const stripeUrl = `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email.toLowerCase())}`;

      const response = await fetch(stripeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      // console.log('Stripe customer check response:', data);

      if (data.data.length === 0) {
        toast.error('No account found with this email. Please sign up first.');
        setIsLoading(false);
        return;
      }

      if (data.data.length > 1) {
        toast.error('Multiple accounts found with this email. Please contact support.');
        setIsLoading(false);
        return;
      }

      // If user exists, send magic link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/profile?reset=true`,
        },
      });

      if (otpError) {
        if (otpError.message.includes('rate limit')) {
          throw new Error('Please wait a few minutes before requesting another link');
        }
        throw otpError;
      }

      toast.success('Check your email for the one time sign in');
      navigate('/auth');
    } catch (error) {
      // console.error('Check user error:', error);
      toast.error(error.message || 'Failed to check user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 p-8 bg-card rounded-lg border border-border">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account? Enter your email below.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Link
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-sm text-primary hover:underline"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}