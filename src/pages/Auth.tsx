import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { CircleUserRound, Loader2 } from 'lucide-react';
import { EmailConfirmationDialog } from '../components/auth/EmailConfirmationDialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { supabase, clearStoredSession } from '../lib/supabase';
import { cn } from '../lib/utils';
import { toast } from '../components/ui/toast';
import { useSearchParams } from 'react-router-dom';
import { redirectToStripePayment } from '../lib/stripe';

interface AuthProps {
  defaultSignUp?: boolean;
}

export function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get('payment_success') === 'true');
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const checkSubscription = async (email: string) => {
    try {
      // console.log('Checking subscription for email:', email);
      const stripeApiKey = import.meta.env.VITE_STRIPE_RESTRICTED_KEY;
      const stripeUrl = `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email.toLowerCase())}`;
      
      // console.log('Fetching customer from Stripe...');
      const response = await fetch(stripeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const customerData = await response.json();
      // console.log('Stripe customer response:', customerData);
      
      if (!customerData.data || customerData.data.length === 0) {
        // console.log('No customer found in Stripe');
        throw new Error('No subscription found. Please sign up first.');
      }

      // Get the customer's subscription status
      const customerId = customerData.data[0].id;
      // console.log('Found customer ID:', customerId);
      
      // console.log('Fetching subscriptions...');
      const subsResponse = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const subsData = await subsResponse.json();
      // console.log('Stripe subscription response:', subsData);
      
      if (!subsData.data || subsData.data.length === 0) {
        // console.log('No active subscription found');
        throw new Error('Your subscription has expired. Please renew to continue.');
      }

      // console.log('Active subscription found');
      return true;
    } catch (error) {
      // console.error('Subscription check error:', error);
      throw error;
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    // console.log('Form submitted, checking credentials...');

    try {
      clearStoredSession();

      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              emailRedirectTo: `${window.location.origin}/onboarding?token=signup`,
              data: {
                email_confirmed: false
              }
            },
          });

        if (signUpError) throw signUpError;

        setShowEmailConfirmation(true);
      } else {
        // Temporarily disabled subscription check
        /* 
        try {
          // console.log('Starting subscription check...');
          await checkSubscription(formData.email);
          // console.log('Subscription check passed');
        } catch (error) {
          // console.error('Login process error:', error);
          toast.error(error.message);
          setIsLoading(false);
          return;
        }
        */

        // console.log('Attempting Supabase login...');
        const { error, data } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        // console.log('Supabase login response:', { error, data });

        if (error) throw error;

        // console.log('Login successful, navigating to home...');
        navigate('/');
        toast.success('Welcome back!');
      }
    } catch (error) {
      // console.error('Form submission error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 p-8 bg-card rounded-lg border border-border">
        <div className="text-center">
          <img
            src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
            alt="Otternaut"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            {isSignUp && (
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Tip: Complete your account customization on the Settings page after verifying your email.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (!isSignUp && searchParams.get('payment_success') === 'true')}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Sign up' : 'Sign in'}
          </Button>

          {!isSignUp && (
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className="text-primary hover:underline"
              >
                Forgot My Password
              </button>
            </div>
          )}

          {!searchParams.get('payment_success') && !isSignUp && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => redirectToStripePayment(false)} // Explicitly set to monthly plan
                  className="text-primary hover:underline"
                >
                  Start your free trial
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
      <EmailConfirmationDialog
        isOpen={showEmailConfirmation}
        onClose={() => setShowEmailConfirmation(false)}
        email={formData.email}
      />
    </div>
  );
}