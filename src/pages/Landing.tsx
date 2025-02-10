import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Check, ArrowRight, Rocket, Shield, Users, BarChart3, MessageSquare, Calendar, Search, X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../components/ui/button';
import { Particles } from '../components/ui/particles';
import { BorderBeam } from '../components/ui/border-beam';
import { redirectToStripePayment } from '../lib/stripe';
import { cn } from '../lib/utils';

const features = [
  {
    title: 'Lead Scoring',
    description: 'Quickly identify your hottest leads with our intuitive scoring system. Focus your efforts on prospects most likely to close and boost your conversion rates.',
    image: '/landing page/full-lead-scoring.png'
  },
  {
    title: 'Task Management',
    description: "Ensure nothing slips through the cracks with integrated task tracking for leads and customers. Streamline your work and increase productivity.",
    image: '/landing page/tasks-page.png'
  },
  {
    title: 'Schedule Manager',
    description: 'Stay on top of every opportunity with follow-up reminders and interaction histories for each individual, elevating your ability to close deals efficiently.',
    image: '/landing page/schedule-manager.png'
  },
  {
    title: 'Analytics Dashboard',
    description: 'Monitor key performance metrics to drive data-driven decisions. Track progress towards your goals and benchmark against your best to continuously improve results.',
    image: '/landing page/analytics-dashboard.png'
  },
  {
    title: 'AI Assistant',
    description: 'Receive guidance in real-time, trained on your business profile to strengthen your strategy for engaging leads and managing customers effectively.',
    image: '/landing page/otterbot-long.png'
  }
];

const pricingPlans = [
  {
    name: 'Pro',
    price: {
      monthly: 29,
      annual: 19
    },
    description: 'Perfect for growing businesses',
    features: [
      'Unlimited leads',
      'Customer management',
      'Analytics dashboard',
      'Task management',
      'Mobile & tablet friendly'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: {
      monthly: 199,
      annual: 179
    },
    description: 'For businesses with unique needs',
    features: [
      'All features in Pro',
      'Custom analytics',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
    ]
  }
];

const faqs = [
  {
    question: 'How do I get started with Otternaut?',
    answer: 'Getting started is easy! Once you sign up for a free-trial you can visit the settings page to optimize your profile, import your data, and customize the software to your needs.'
  },
  {
    question: 'Can I import or export my data?',
    answer: 'Absolutely! With Otternaut, you can seamlessly import and export your leads and customer data. We support formats such as CSV and Excel, making it easy to transition your existing data into our platform or move it elsewhere as needed.'
  },
  {
    question: 'Is Otternaut tablet and mobile friendly?',
    answer: "Yes! Otternaut is designed to work seamlessly on both tablets and mobile devices. For an app-like experience, you can add Otternaut to your device's home screen. The desktop view provides the most comprehensive experience."
  },
  {
    question: 'Is there a long-term contract or additional fees?',
    answer: 'Not at all! We offer flexible monthly plans with no long-term commitments. Opt for an annual plan to enjoy discounted rates and cancel anytime with a prorated refund. Plus, there are no hidden fees, and we offer free setup assistance to get you started smoothly.'
  },
  {
    question: 'How secure is my data?',
    answer: 'We prioritize your data’s security with encrypted storage and secure connections. Our systems are built using best practices, and we are committed to maintaining high security standards.'
  }
];

export function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clickedSection, setClickedSection] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Force dark theme on mount
  useEffect(() => {
    setTheme('dark');
  }, []);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [hoveredFaq, setHoveredFaq] = useState<number | null>(null);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({
    features: null,
    pricing: null,
    faq: null,
    contact: null
  });

  // Clear clicked section when scrolling
  useEffect(() => {
    const handleScroll = () => setClickedSection('');
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    sectionsRef.current[sectionId]?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
    setClickedSection(sectionId);
  };

  const otternautLogoPath = theme === 'light' ? "/landing page/otternaut-website-light.png" : "/landing page/otternaut-website-black.png";
  const mainviewImagePath = theme === 'light' ? "/landing page/mainview-light.png" : "/landing page/mainview.png";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="h-8"
            >
              <img 
                src={otternautLogoPath}
                alt="Otternaut" 
                className="h-full w-auto" 
              />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {Object.keys(sectionsRef.current)
                .filter(section => section !== 'contact')
                .map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    clickedSection === section ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {section === 'faq' ? 'FAQ' : section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">Login</Button>
              </Link>
              <Button onClick={() => redirectToStripePayment(false)}>
                Start Free Trial
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-accent rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <>
                    <div className="w-6 h-0.5 bg-foreground rounded-full" />
                    <div className="w-6 h-0.5 bg-foreground rounded-full" />
                    <div className="w-6 h-0.5 bg-foreground rounded-full" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                {Object.keys(sectionsRef.current)
                  .filter(section => section !== 'contact')
                  .map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary text-left py-2",
                      clickedSection === section ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {section === 'faq' ? 'FAQ' : section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </nav>
              <div className="border-t border-border pt-4" />
              <div className="flex flex-col space-y-2">
                <Link to="/auth">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Button 
                  className="w-full"
                  onClick={() => redirectToStripePayment(false)}
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative">
        <div className="particles-container">
          {isMobile ? (
            <div className="fixed inset-0 h-[100vh] z-10">
              <Particles 
                quantity={50}
                staticity={80}
                ease={30}
                color={theme === 'dark' ? '#ffffff' : '#000000'}
                className="pointer-events-none"
              />
            </div>
          ) : (
            <Particles 
              quantity={100}
              staticity={80}
              ease={30}
              color={theme === 'dark' ? '#ffffff' : '#000000'}
              className="pointer-events-none"
            />
          )}
        </div>
        <div className="absolute top-20 right-4 md:right-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-gradient-x bg-[length:200%_auto] bg-gradient-to-r from-blue-500 via-primary to-blue-500 bg-clip-text text-transparent"
            style={{ lineHeight: '1.2', paddingBottom: '0.5rem' }}>
            Convert Leads to Loyal Customers
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Smart Lead Management for Small to Mid-Sized Businesses
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400">
            <Button 
              size="lg" 
              type="button"
              className="w-full md:w-auto"
              onClick={() => redirectToStripePayment(false)}
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              type="button"
              onClick={() => scrollToSection('features')}
              className="w-full md:w-auto"
            >
              Learn More
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
             <div className="relative after:absolute after:inset-x-0 after:bottom-0 after:h-48 after:bg-gradient-to-t after:from-background after:to-transparent after:rounded-b-3xl">
              <BorderBeam className="max-w-5xl mx-auto mt-12" size={150} duration={12} theme={theme}>
                <div className="relative after:absolute after:inset-x-0 after:bottom-0 after:h-48 after:bg-gradient-to-t after:from-background after:to-transparent after:rounded-b-3xl">
                <img
                src={mainviewImagePath}
                alt="Otternaut Platform Overview"
                className="rounded-3xl"
                />
                </div>
              </BorderBeam>
            </div>
        </div>
<div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
  {/* Central gradient */}
  <div className="absolute inset-x-0 bottom-0 h-24
    bg-gradient-to-t 
    from-transparent 
    via-blue-500/30 
    to-transparent 
    blur-xl 
    mx-[43%] 
    translate-y-1/2 
    origin-bottom 
    scale-x-[1.5] 
    scale-y-[0.7]" />

  {/* Fading edges */}
  <div className="absolute inset-x-0 bottom-0 h-24
    bg-gradient-to-t 
    from-transparent 
    via-blue-500/100 
    to-transparent 
    blur-2xl 
    mx-[30%] 
    translate-y-1/2 
    origin-bottom 
    scale-x-[1.5] 
    scale-y-[0.5]" />
</div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        ref={(el) => (sectionsRef.current.features = el)}
        className="py-16 md:py-24 relative z-20 bg-background"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Unlock Your Business Potential
          </h2>
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={cn(
                  "flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12",
                  index % 2 === 1 && "md:flex-row-reverse"
                )}
              >
                <div className="flex-1">
                  <div className="overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                       className={cn(
                      feature.title === 'AI Assistant' && "max-h-[500px] max-w-[350px] object-contain w-full mx-auto"
                      )}
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        ref={(el) => (sectionsRef.current.pricing = el)}
        className="py-16 md:py-24 relative z-20 bg-background"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Choose the plan that's right for your business
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={cn(
              "text-sm",
              !isAnnualBilling ? "text-primary" : "text-muted-foreground"
            )}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnualBilling(!isAnnualBilling)}
              className={cn(
                "relative inline-flex h-6 w-11 mx-3 items-center rounded-full transition-colors",
                isAnnualBilling ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isAnnualBilling ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className={cn(
              "text-sm",
              isAnnualBilling ? "text-primary" : "text-muted-foreground"
            )}>
              Annual (Save 34%)
            </span>
          </div>

  <div className="mx-auto max-w-2xl">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {pricingPlans.map((plan) => (
      <div 
        key={plan.name}
        onMouseEnter={() => setHoveredPlan(plan.name)}
        onMouseLeave={() => setHoveredPlan(null)}
        className={cn(
          "bg-card rounded-lg border transition-all duration-300 ease-in-out",
          {
            'shadow-blue-glow border-border': plan.popular && (hoveredPlan === null || hoveredPlan === plan.name),
            'hover:border-primary': plan.popular || hoveredPlan === plan.name,
            'hover:shadow-blue-glow': !plan.popular || hoveredPlan === plan.name,
            'shadow-none': plan.popular && hoveredPlan !== null && hoveredPlan !== plan.name,
            'border-border': !plan.popular && hoveredPlan !== plan.name
          }
        )}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                {plan.popular ? (
                  <>
                    <span className="text-4xl font-bold">
                      ${isAnnualBilling ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </>
                ) : (
                  <span className="text-4xl font-medium text-muted-foreground">
                    Custom
                  </span>
                )}
              </div>
              <Button
                className="w-full mb-6"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={plan.popular ? () => redirectToStripePayment(isAnnualBilling) : () => window.location.href = 'mailto:info@otternautcrm.com'}
              >
                {plan.popular ? 'Start Free Trial' : 'Contact Us'}
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* FAQ Section */}
<section
  id="faq"
  ref={(el) => (sectionsRef.current.faq = el)}
  className={cn(
    "py-16 md:py-24 relative z-20",
    "md:bg-accent/50",
    "bg-accent"
  )}
>
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
      Frequently Asked Questions
    </h2>
    <p className="text-muted-foreground text-center mb-8">
      Have more questions? Reach out to info@otternautcrm.com.
    </p>
    <div className="max-w-3xl mx-auto space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className={cn(
            "bg-card border border-border rounded-lg overflow-hidden transition-shadow duration-300 ease-in-out",
            {
              'shadow-blue-glow': expandedFaq === index || hoveredFaq === index,
              'hover:shadow-blue-glow': expandedFaq !== index
            }
          )}
          onMouseEnter={() => setHoveredFaq(index)}
          onMouseLeave={() => setHoveredFaq(null)}
        >
          <button
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-accent/50"
            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
          >
            <span className="font-medium">{faq.question}</span>
            {expandedFaq === index ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          {expandedFaq === index && (
            <div className="px-6 py-4 bg-accent/50 border-t border-border">
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Contact Section */}
      <section
        id="contact"
        ref={(el) => (sectionsRef.current.contact = el)}
        className="py-16 md:py-24 relative z-20 bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start your free trial today and see how Otternaut can transform your sales process.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
              <Button 
                size="lg"
                onClick={() => redirectToStripePayment(false)}
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 relative z-20 overflow-hidden">
        <div className="particles-container absolute inset-0 z-0">
          <Particles 
            quantity={isMobile ? 30 : 50}
            staticity={80}
            ease={30}
            color={theme === 'dark' ? '#ffffff' : '#000000'}
            className="pointer-events-none"
          />
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={otternautLogoPath}
                  alt="Otternaut" 
                  className="h-8 w-auto" 
                />
              </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <Link
                    to="/auth"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:info@otternautcrm.com"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Otternaut. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
