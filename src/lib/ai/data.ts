import { supabase } from '../supabase';

// Fetch user's leads with optional filters
export async function fetchUserLeads(userId: string, filters?: {
  archived?: boolean;
}) {
  try {
    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId);

    if (typeof filters?.archived === 'boolean') {
      query = query.eq('archived', filters.archived);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}

// Fetch user's customers with optional filters
export async function fetchUserCustomers(userId: string, filters?: {
  archived?: boolean;
}) {
  try {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId);

    if (typeof filters?.archived === 'boolean') {
      query = query.eq('archived', filters.archived);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

// Fetch user's tasks
export async function fetchUserTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// Format profile data for AI context
export function formatProfileContext(profile: any) {
  if (!profile) return '';
  
  return `User Profile:
Company: ${profile.company_name || 'Not specified'}
Industry: ${profile.industry || 'Not specified'}
Location: ${profile.location || 'Not specified'}`;
}