export const BASE_SYSTEM_PROMPT = `You are Otterbot, Otternaut's AI assistant. Your purpose is to help users navigate and effectively use the Otternaut platform.

Key Responsibilities:
1. Guide users through Otternaut's features
2. Explain concepts like lead scoring and customer management
3. Suggest next steps based on user data
4. Provide troubleshooting support
5. Offer industry-specific advice based on the user's profile and data
6. Help users understand the product roadmap, known issues, and FAQs
7. Direct users to the Help Center (accessed via question mark icon in header) for detailed FAQs and support options
8. Assist with feature requests and bug reports

Keep responses:
- Concise and actionable
- Focused on one topic at a time
- Professional but friendly
- Specific to Otternaut features

You have access to:
- Product roadmap including new releases, in-progress features, and upcoming features
- Known bugs and their current status
- Workarounds for reported issues
- Frequently asked questions and their answers
- Navigation structure of the application`;

// Function-specific prompts that can be added based on context
export const CONTEXT_PROMPTS = {
  leadManagement: `Available Lead Management Features:
- Lead scoring (based on value, engagement, timeline, qualification)
- Lead stage tracking (new, contacted, qualified, negotiation, won, lost)
- Follow-up scheduling
- Interaction logging (calls, emails, meetings)`,

  customerManagement: `Available Customer Management Features:
- Customer details tracking
- Service history
- Billing information
- Communication logs
- Custom fields configuration`,

  taskManagement: `Available Task Management Features:
- Task creation and assignment
- Priority levels (low, medium, high)
- Due date tracking
- Status updates (open, in progress, waiting, done)
- Drag-and-drop organization`
};

// Helper to construct context-aware system prompts
export function buildSystemPrompt(
  userProfile: any,
  activeFeatures: string[],
  entityData?: {
    leads?: any[];
    customers?: any[];
    tasks?: any[];
  }
) {
  let prompt = BASE_SYSTEM_PROMPT;

  // Add profile-specific context
  if (userProfile) {
    prompt += `\n\nUser Profile Context:
- Company: ${userProfile.company_name || 'Not specified'}
- Role: ${userProfile.role || 'Not specified'}
- Industry: ${userProfile.industry || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Website: ${userProfile.website || 'Not specified'}
- Personal Linkedin: ${userProfile.personal_linkedin || 'Not specified'}
- Company Lindedin: ${userProfile.company_linkedin || 'Not specified'}
- Target Market: ${userProfile.target_market || 'Not specified'}
- Product Description: ${userProfile.product_description || 'Not specified'}
- Additional Info: ${userProfile.additional_info || 'Not specified'}

Lead Sources: ${[...(userProfile.lead_sources || []), ...(userProfile.custom_lead_sources || [])].join(', ')}
Lead Stages: ${[...(userProfile.lead_stages || []), ...(userProfile.custom_lead_stages || [])].join(', ')}
Service Types: ${[...(userProfile.service_types || []), ...(userProfile.custom_service_types || [])].join(', ')}
Service Frequencies: ${[...(userProfile.service_frequencies || []), ...(userProfile.custom_service_frequencies || [])].join(', ')}

Lead Scoring Parameters:
- Value Thresholds: Low $${userProfile.scoring_params?.value?.threshold_low || 0}, Medium $${userProfile.scoring_params?.value?.threshold_medium || 0}, High $${userProfile.scoring_params?.value?.threshold_high || 0}
- Engagement: Min ${userProfile.scoring_params?.engagement?.min_interactions || 0} interactions, Optimal ${userProfile.scoring_params?.engagement?.optimal_interactions || 0} interactions
- Timeline: Overdue penalty ${userProfile.scoring_params?.timeline?.overdue_penalty || 0}, Upcoming bonus ${userProfile.scoring_params?.timeline?.upcoming_bonus || 0}
- Stage Weights: ${Object.entries(userProfile.scoring_params?.qualification?.stage_weights || {}).map(([stage, weight]) => `${stage}: ${weight}`).join(', ')}`;
  }

  // Add relevant feature documentation
  activeFeatures.forEach(feature => {
    if (CONTEXT_PROMPTS[feature as keyof typeof CONTEXT_PROMPTS]) {
      prompt += `\n\n${CONTEXT_PROMPTS[feature as keyof typeof CONTEXT_PROMPTS]}`;
    }
  });

  // Add entity data if available
  if (entityData) {
    if (entityData.leads?.length) {
      prompt += `\n\nCurrent Active Leads: ${entityData.leads.length}`;
    }
    if (entityData.customers?.length) {
      prompt += `\nCurrent Active Customers: ${entityData.customers.length}`;
    }
    if (entityData.tasks?.length) {
      prompt += `\nCurrent Tasks: ${entityData.tasks.length}`;
    }
    if (entityData.roadmap?.length) {
      prompt += `\n\nProduct Roadmap:`;
      prompt += `\nNew Releases:`;
      entityData.roadmap.filter(item => item.status === 'new')
        .forEach(item => prompt += `\n- ${item.title}: ${item.description}`);
      
      prompt += `\n\nIn Progress:`;
      entityData.roadmap.filter(item => item.status === 'in-progress')
        .forEach(item => prompt += `\n- ${item.title}: ${item.description}`);
      
      prompt += `\n\nUpcoming:`;
      entityData.roadmap.filter(item => item.status === 'upcoming')
        .forEach(item => prompt += `\n- ${item.title}: ${item.description}`);
    }
    if (entityData.knownBugs?.length) {
      prompt += `\n\nKnown Issues:`;
      entityData.knownBugs.forEach(bug => {
        prompt += `\n- ${bug.title} (${bug.status})`;
        prompt += `\n  Description: ${bug.description}`;
        if (bug.workaround) {
          prompt += `\n  Workaround: ${bug.workaround}`;
        }
      });
    }
    if (entityData.faq?.length) {
      prompt += `\n\nFrequently Asked Questions:`;
      entityData.faq.forEach(item => {
        prompt += `\n- Q: ${item.question}`;
        prompt += `\n  A: ${item.answer}`;
      });
    }
    if (entityData.navigation) {
      prompt += `\n\nApplication Navigation:`;
      prompt += `\nThe Help Center can be accessed via the question mark icon in the header.`;
      prompt += `\nProfile settings, including lead scoring parameters, can be accessed via the Settings icon in the header.`;
    }
  }

  return prompt;
}