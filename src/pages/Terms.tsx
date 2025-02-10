import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';

export function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray dark:prose-invert">
            <p className="text-muted-foreground mb-6">Last updated: January 25, 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Otternaut's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-muted-foreground mb-4">
                Otternaut grants you a limited, non-exclusive, non-transferable license to use our services for your business purposes, subject to these terms.
              </p>
              <p className="text-muted-foreground">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose without authorization</li>
                <li>Transfer the materials to another person or mirror them on any other server</li>
                <li>Attempt to decompile or reverse engineer any software</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Subscription and Payments</h2>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>You may cancel your subscription at any time</li>
                <li>Refunds are provided on a prorated basis for annual subscriptions</li>
                <li>We reserve the right to modify pricing with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
              <p className="text-muted-foreground">You are responsible for:</p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Maintaining the confidentiality of your account</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your data complies with applicable laws</li>
                <li>Obtaining necessary consents for data collection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Otternaut shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Contact</h2>
              <p className="text-muted-foreground">
                Questions about the Terms of Service should be sent to{' '}
                <a href="mailto:info@otternautcrm.com" className="text-primary hover:underline">
                  info@otternautcrm.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}