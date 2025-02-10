import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { toast } from '../ui/toast';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { buildSystemPrompt } from '../../lib/ai/prompts';
import { fetchUserLeads, fetchUserCustomers, fetchUserTasks } from '../../lib/ai/data';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "👋 Hi! I'm Otterbot, your AI assistant.\n\nI can help you with:\n• Using Otternaut features\n• Managing leads and customers\n• Sales tips and best practices\n• Questions and troubleshooting\n\nHow can I assist you today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [entityData, setEntityData] = useState<{
    leads?: any[];
    customers?: any[];
    tasks?: any[];
    roadmap?: any[];
    knownBugs?: any[];
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile();
      fetchEntityData();
      fetchProductData();
    }
  }, [session?.user?.id]);

  const fetchProductData = async () => {
    try {
      const [roadmapResponse, bugsResponse, faqResponse, navigationResponse] = await Promise.all([
        fetch('/ai/roadmap.json'),
        fetch('/ai/known-bugs.json'),
        fetch('/ai/faq.json'),
        fetch('/ai/navigation.json')
      ]);
      
      const [roadmap, knownBugs, faq, navigation] = await Promise.all([
        roadmapResponse.json(),
        bugsResponse.json(),
        faqResponse.json(),
        navigationResponse.json()
      ]);

      setEntityData(prev => ({
        ...prev,
        roadmap,
        knownBugs,
        faq,
        navigation
      }));
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchEntityData = async () => {
    if (!session?.user?.id) return;

    try {
      const [leads, customers, tasks] = await Promise.all([
        fetchUserLeads(session.user.id, { archived: false }),
        fetchUserCustomers(session.user.id, { archived: false }),
        fetchUserTasks(session.user.id)
      ]);

      setEntityData({ leads, customers, tasks });
    } catch (error) {
      console.error('Error fetching entity data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build system message with context
      const systemPrompt = buildSystemPrompt(
        userProfile,
        ['leadManagement', 'customerManagement', 'taskManagement'],
        {
          ...entityData,
          roadmap: entityData.roadmap || [],
          knownBugs: entityData.knownBugs || []
        }
      );

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-4), // Keep last 4 messages for context
            { role: 'user', content: userMessage }
          ],
          max_tokens: 400,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-full sm:w-[400px] z-50",
      "bg-background border-l border-border flex flex-col",
      "transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold">Otterbot</h2>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
              Beta
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] rounded-lg px-4 py-2",
              message.role === 'user'
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How can I help you today?"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          Otterbot can make mistakes. Double check important info.
        </p>
      </form>
    </div>
  );
}