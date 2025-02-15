import React from 'react';
import { Calendar, User2, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { Task } from '../../types/supabase';
import { toast } from '../ui/toast';
import { useState, useEffect } from 'react';

const initialFormData = {
  name: '',
  priority: 'medium' as const,
  due_date: undefined,
  notes: '',
  status: 'open' as const
};

interface Contact {
  id: string;
  type: 'lead' | 'customer';
  name: string;
}

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
}

export function TaskDialog({ isOpen, onClose, task, onTaskCreated, onTaskUpdated }: TaskDialogProps) {
  const { session } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        priority: task.priority,
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : undefined,
        notes: task.notes || '',
        status: task.status,
        contact_id: task.contact_id,
        contact_type: task.contact_type
      });
    } else {
      const emptyForm = {
        name: '',
        priority: 'medium',
        due_date: undefined,
        notes: '',
        status: 'open',
        contact_id: undefined,
        contact_type: undefined
      };
      setFormData(emptyForm);
    }
  }, [task, isOpen]);

  // Fetch contact details when editing a task with an associated contact
  useEffect(() => {
    if (task?.contact_id && task?.contact_type) {
      const fetchContact = async () => {
        try {
          if (task.contact_type === 'lead') {
            const { data } = await supabase
              .from('leads')
              .select('name')
              .eq('id', task.contact_id)
              .single();
            
            if (data) {
              setSelectedContact({
                id: task.contact_id,
                type: 'lead',
                name: data.name
              });
            }
          } else {
            const { data } = await supabase
              .from('customers')
              .select('first_name, last_name')
              .eq('id', task.contact_id)
              .single();
            
            if (data) {
              setSelectedContact({
                id: task.contact_id,
                type: 'customer',
                name: `${data.first_name} ${data.last_name}`
              });
            }
          }
        } catch (error) {
          console.error('Error fetching contact:', error);
        }
      };

      fetchContact();
    }
  }, [task?.contact_id, task?.contact_type]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setContacts([]);
      return;
    }

    const searchContacts = async () => {
      setIsSearching(true);
      try {
        const [{ data: leads }, { data: customers }] = await Promise.all([
          supabase
            .from('leads')
            .select('id, name')
            .filter('archived', 'eq', false)
            .ilike('name', `%${searchTerm}%`)
            .limit(5),
          supabase
            .from('customers')
            .select('id, first_name, last_name')
            .ilike('first_name', `%${searchTerm}%`)
            .limit(5)
        ]);

        const formattedContacts: Contact[] = [
          ...(leads?.map(lead => ({
            id: lead.id,
            type: 'lead' as const,
            name: lead.name
          })) || []),
          ...(customers?.map(customer => ({
            id: customer.id,
            type: 'customer' as const,
            name: `${customer.first_name} ${customer.last_name}`
          })) || [])
        ];

        setContacts(formattedContacts);
      } catch (error) {
        console.error('Error searching contacts:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchContacts();
  }, [searchTerm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      if (task) {
        const updateData = {
          name: formData.name,
          priority: formData.priority,
          status: formData.status,
          notes: formData.notes,
          due_date: formData.due_date || null,
          contact_id: formData.contact_id || null,
          contact_type: formData.contact_type || null
        };

        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', task.id)
          .select()
          .single();

        if (error) throw error;
        
        // Fetch the updated task to ensure we have the correct state
        const { data: updatedTask, error: fetchError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', task.id)
          .single();

        if (fetchError) throw fetchError;
        if (onTaskUpdated) onTaskUpdated(updatedTask);
        toast.success('Task updated successfully');
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            ...formData,
            user_id: session.user.id,
            due_date: formData.due_date || null
          })
          .select()
          .single();

        if (error) throw error;
        if (onTaskCreated) onTaskCreated(data);
        toast.success('Task created successfully');
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "!fixed !right-0 !left-auto !translate-x-0",
        "!h-screen !max-h-screen !rounded-none",
        "w-full sm:w-[440px] overflow-hidden"
      )}>
        <div className="flex flex-col h-full max-h-screen">
          <div className="flex items-center justify-between mb-4">
            <DialogHeader className="p-0">
              <DialogTitle>
                {task ? 'Edit Task' : 'New Task'}
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2">
            <Label>Task Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter task name..."
              className="w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.due_date ?? ''}
                  className="pl-10"
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    due_date: e.target.value || undefined 
                  }))}
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Associated Contact (Optional)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
              {searchTerm.length >= 2 && contacts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
                  {contacts.map((contact) => (
                    <button
                      key={`${contact.type}-${contact.id}`}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-accent flex items-center space-x-2"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          contact_id: contact.id,
                          contact_type: contact.type
                        }));
                        setSelectedContact(contact);
                        setSearchTerm('');
                      }}
                    >
                      <User2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">{contact.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {contact.type}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {formData.contact_id && (
              <div className="flex items-center justify-between mt-2 p-2 bg-muted rounded-md">
                <div className="flex items-center space-x-2">
                  <User2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm">
                      {selectedContact?.name || contacts.find(c => c.id === formData.contact_id)?.name}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {formData.contact_type}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      contact_id: null,
                      contact_type: null
                    }));
                    setSelectedContact(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'open' | 'in_progress' | 'waiting' | 'done') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

        </form>
        
        <div className="p-6 border-t border-border mt-auto flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {task ? 'Update' : 'Create'} Task
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}