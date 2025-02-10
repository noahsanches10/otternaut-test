import React, { useState, useEffect } from 'react';
import { Bug, Lightbulb, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface KnownBug {
  title: string;
  description: string;
  status: string;
  reportedDate: string;
  affectedVersion: string;
  workaround?: string;
}

interface RoadmapItem {
  title: string;
  description: string;
  date?: string;
  status: 'new' | 'in-progress' | 'upcoming';
}

export function Help() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [knownBugs, setKnownBugs] = useState<KnownBug[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isKnownBugsExpanded, setIsKnownBugsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/ai/faq.json').then(res => res.json()),
      fetch('/ai/roadmap.json').then(res => res.json()),
      fetch('/ai/known-bugs.json').then(res => res.json())
    ]).then(([faqData, roadmapData, bugsData]) => {
      setFaqs(faqData);
      setRoadmap(roadmapData);
      setKnownBugs(bugsData);
      setIsLoading(false);
    });
  }, []);

  const roadmapSections = {
    new: roadmap.filter(item => item.status === 'new'),
    inProgress: roadmap.filter(item => item.status === 'in-progress'),
    upcoming: roadmap.filter(item => item.status === 'upcoming')
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold -mt-2">Help Center</h1>

      {/* FAQ Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
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
                <div className="px-4 py-3 bg-muted/50 border-t border-border">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Product Roadmap</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Releases */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              New Releases
            </h3>
            {roadmapSections.new.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.date && (
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* In Progress */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center text-blue-500">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
              In Progress
            </h3>
            {roadmapSections.inProgress.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.date && (
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center text-purple-500">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
              Upcoming
            </h3>
            {roadmapSections.upcoming.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.date && (
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Known Bugs Section */}
      <div>
        <button
          className="w-full flex items-center justify-between text-xl font-semibold mb-6"
          onClick={() => setIsKnownBugsExpanded(!isKnownBugsExpanded)}
        >
          <span>Known Bugs</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">({isKnownBugsExpanded ? 'Collapse' : 'View'})</span>
            {isKnownBugsExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>
        
        {isKnownBugsExpanded && (
          <div className="space-y-4">
            {knownBugs.map((bug, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{bug.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    Reported: {new Date(bug.reportedDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{bug.description}</p>
                {bug.workaround && (
                  <div className="text-sm">
                    <span className="font-medium">Workaround: </span>
                    <span className="text-muted-foreground">{bug.workaround}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Status: {bug.status}</span>
                  <span>Version: {bug.affectedVersion}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          size="lg"
          className="h-auto p-6 flex flex-col items-center space-y-2"
          onClick={() => window.open('mailto:support@otternautcrm.com')}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="font-medium">Contact Support</span>
          <span className="text-sm text-muted-foreground">Get help from our team</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-auto p-6 flex flex-col items-center space-y-2"
          onClick={() => window.open('mailto:support@otternautcrm.com?subject=Bug Report&body=**FIRST CHECK THE KNOWN BUGS IN THE HELP PAGE**%0D%0A%0D%0AHello!%0D%0A%0D%0AI would like to report a bug I encountered while using Otternaut...%0D%0A%0D%0ADescription (provide a clear description of the issue, including the expected outcome and what the actual outcome currently is):%0D%0A%0D%0ASteps to replicate the bug:%0D%0A     1.%0D%0A     2.%0D%0A     3.%0D%0A%0D%0AWhy it should be solved (explain the impact of the bug on your workflow or user experience):')}
        >
          <Bug className="w-6 h-6" />
          <span className="font-medium">Report a Bug</span>
          <span className="text-sm text-muted-foreground">Help us improve</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-auto p-6 flex flex-col items-center space-y-2"
          onClick={() => window.open('mailto:support@otternautcrm.com?subject=Feature Request&body=Hello!%0D%0A%0D%0AI would like to suggest a new feature for Otternaut...%0D%0A%0D%0AFeature Description (provide a clear and concise description of the feature you\'d like to see implemented):%0D%0A%0D%0AUse Case (explain how you or others would use this feature and in what scenarios it would be beneficial):%0D%0A%0D%0ABenefits (highlight the advantages of adding this feature, such as improved user experience, increased efficiency, or potential value to other users):%0D%0A%0D%0AAdditional Notes (include any extra information, mockups, or examples that could help clarify your request):')}
        >
          <Lightbulb className="w-6 h-6" />
          <span className="font-medium">Request a Feature</span>
          <span className="text-sm text-muted-foreground">Share your ideas</span>
        </Button>
      </div>
    </div>
  );
}