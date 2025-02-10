import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripePromise = loadStripe('pk_live_51QcMtKL2Utx5IaHRlqDGObw6Zqi3i0LX15JoSFyfDq25zebidhJBRz4chJygeP1tB9X87liher5zucFUkFX45XTJ00kE8DPdRr');

// Function to redirect to Stripe payment
export function redirectToStripePayment(isAnnual = false) {
  window.location.href = isAnnual 
    ? 'https://buy.stripe.com/eVacNM2uW4HY6UoaEH'  // Annual plan
    : 'https://buy.stripe.com/eVadRQd9A0rI92w289';  // Monthly plan (free trial)
}