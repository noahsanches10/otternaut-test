import React, { useState, useRef, useEffect } from 'react';
import { Upload, AlertCircle, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from '../ui/toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import * as XLSX from 'xlsx';
import { importTemplates } from '../../lib/importTemplates';

interface MappingField {
  sourceField: string;
  targetField: string;
}

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const { session } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'leads' | 'customers'>('leads');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<MappingField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [defaultStatus, setDefaultStatus] = useState('');
  const [defaultSource, setDefaultSource] = useState('');
  const [defaultServiceType, setDefaultServiceType] = useState('');
  const [defaultFrequency, setDefaultFrequency] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .single();

      if (error) throw error;
      setProfile(data);
      
      // Set default status and source to first available option
      if (data.lead_stages?.length) {
        setDefaultStatus(data.lead_stages[0]);
      }
      if (data.lead_sources?.length) {
        setDefaultSource(data.lead_sources[0]);
      }
      if (data.service_types?.length) {
        setDefaultServiceType(data.service_types[0]);
      }
      if (data.service_frequencies?.length) {
        setDefaultFrequency(data.service_frequencies[0]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  const targetFields = {
    leads: [
      { value: 'name', label: 'Name' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'address', label: 'Address' },
      { value: 'projected_value', label: 'Projected Value' },
      { value: 'notes', label: 'Notes' }
    ],
    customers: [
      { value: 'first_name', label: 'First Name' },
      { value: 'last_name', label: 'Last Name' },
      { value: 'company_name', label: 'Company Name' },
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'property_street1', label: 'Street Address' },
      { value: 'property_city', label: 'City' },
      { value: 'property_state', label: 'State' },
      { value: 'property_zip', label: 'ZIP Code' },
      { value: 'sale_value', label: 'Sale Value' },
      { value: 'notes', label: 'Notes' }
    ]
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    
    try {
      const fileHeaders = await readFileHeaders(file);
      setHeaders(fileHeaders);
      
      // Create initial mappings
      const initialMappings = fileHeaders.map(header => ({
        sourceField: header,
        targetField: findMatchingTargetField(header) || ''
      }));
      setMappings(initialMappings);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
    }
  };

  const findMatchingTargetField = (sourceField: string): string => {
    const normalizedSource = sourceField.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fields = targetFields[selectedTab];
    
    return fields.find(field => 
      field.value === normalizedSource || 
      field.label.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedSource
    )?.value || '';
  };

  const readFileHeaders = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          const headers = jsonData[0] as string[];
          resolve(headers);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsBinaryString(file);
    });
  };

  const handleImport = async () => {
    if (!file || !session?.user?.id) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Record<string, any>[];

          // Validate required fields for leads
          if (selectedTab === 'leads') {
            const hasStatusMapping = mappings.some(m => m.targetField === 'status');
            const hasSourceMapping = mappings.some(m => m.targetField === 'lead_source');
            
            if (!hasStatusMapping && !defaultStatus) {
              throw new Error('Please select a default status for leads without one');
            }
            if (!hasSourceMapping && !defaultSource) {
              throw new Error('Please select a default source for leads without one');
            }
          }

          // Transform data based on mappings
          const transformedData = jsonData.map(row => {
            const transformed: Record<string, any> = {
              user_id: session.user.id
            };
            
            // Handle customers specific transformations
            if (selectedTab === 'customers') {
              // Set source
              const sourceMapping = mappings.find(m => m.targetField === 'source');
              transformed.source = sourceMapping
                ? row[sourceMapping.sourceField] || defaultSource
                : defaultSource;

              // Set service type
              const typeMapping = mappings.find(m => m.targetField === 'service_type');
              transformed.service_type = typeMapping
                ? row[typeMapping.sourceField] || defaultServiceType
                : defaultServiceType;

              // Set service frequency
              const frequencyMapping = mappings.find(m => m.targetField === 'service_frequency');
              transformed.service_frequency = frequencyMapping
                ? row[frequencyMapping.sourceField] || defaultFrequency
                : defaultFrequency;

              // Set status to active by default
              transformed.status = 'active';
            }

            // Handle leads specific transformations
            if (selectedTab === 'leads') {
              // Set priority
              const priorityMapping = mappings.find(m => m.targetField === 'priority');
              transformed.priority = priorityMapping 
                ? row[priorityMapping.sourceField]?.toLowerCase() || defaultPriority
                : defaultPriority;

              // Set status
              const statusMapping = mappings.find(m => m.targetField === 'status');
              transformed.status = statusMapping
                ? row[statusMapping.sourceField] || defaultStatus
                : defaultStatus;

              // Set source
              const sourceMapping = mappings.find(m => m.targetField === 'lead_source');
              transformed.lead_source = sourceMapping
                ? row[sourceMapping.sourceField] || defaultSource
                : defaultSource;

              // Set projected value
              const valueMapping = mappings.find(m => m.targetField === 'projected_value');
              transformed.projected_value = valueMapping
                ? Number(row[valueMapping.sourceField]) || 0
                : 0;
            }

            mappings.forEach(mapping => {
              if (mapping.targetField && mapping.targetField !== '_skip' && mapping.sourceField) {
                // Handle text fields
                if (['name', 'email', 'phone', 'address', 'notes'].includes(mapping.targetField)) {
                  transformed[mapping.targetField] = row[mapping.sourceField] || '';
                }
                // Handle projected value
                else if (mapping.targetField === 'projected_value') {
                  transformed[mapping.targetField] = Number(row[mapping.sourceField]) || 0;
                }
                // Handle other fields normally
                else {
                  transformed[mapping.targetField] = row[mapping.sourceField];
                }
              }
            });

            return transformed;
          });

          // Insert data into Supabase
          const { error } = await supabase
            .from(selectedTab)
            .insert(transformedData);

          if (error) throw error;

          toast.success(`${transformedData.length} records imported successfully`);
          onClose();
        } catch (error) {
          console.error('Error importing data:', error);
          toast.error('Failed to import data');
        }
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMapping = (index: number, targetField: string) => {
    setMappings(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        targetField
      };
      return updated;
    });
  };

  const downloadTemplate = (type: 'leads' | 'customers') => {
    const worksheet = XLSX.utils.aoa_to_sheet(importTemplates[type]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, `${type}-import-template.xlsx`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[100vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(value: 'leads' | 'customers') => setSelectedTab(value)} className="flex flex-col items-center mx-auto">
          <TabsList className="flex space-x-4 mb-1">
            <TabsTrigger value="leads" className="px-4">Import Leads</TabsTrigger>
            <TabsTrigger value="customers" className="px-4">Import Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4 text-center">
            <div className="flex flex-col items-center text-sm text-muted-foreground">
              <p>Import your leads from a CSV or Excel file. Map your columns to the correct fields. Edits post submission may be necessary.</p>
              <Button
                variant="link"
                className="mt-2 h-auto p-0"
                onClick={() => downloadTemplate('leads')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Leads Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4 text-center">
            <div className="flex flex-col items-center text-sm text-muted-foreground">
              <p>Import your customers from a CSV or Excel file. Map your columns to the correct fields. Edits post submission may be necessary.</p>
              <Button
                variant="link"
                className="mt-2 h-auto p-0"
                onClick={() => downloadTemplate('customers')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Customers Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex-1 overflow-hidden flex flex-col">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />

          {!file ? (
            <div className="flex-1 flex items-center justify-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-auto py-8 px-12 flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm font-medium">Upload File</div>
                <div className="text-xs text-muted-foreground">CSV or Excel files supported</div>
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{file.name}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setHeaders([]);
                    setMappings([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Change File
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium">Map Your Fields</div>
                {mappings.map((mapping, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Source Field</div>
                      <div className="text-sm px-2">{mapping.sourceField}</div>
                    </div>
                    <div className="flex-1 px-1">
                      <div className="text-xs text-muted-foreground mb-1">Target Field</div>
                      <Select
                        value={mapping.targetField}
                        onValueChange={(value) => handleUpdateMapping(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px] px-2 min-w-[200px]">
                          <SelectItem value="_skip">Skip Field</SelectItem>
                          {targetFields[selectedTab].map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {file && selectedTab === 'customers' && (
            <div className="border-t pt-4 space-y-4 -mx-6 px-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Assigned Source</Label>
                  <Select value={defaultSource} onValueChange={setDefaultSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="px-2 min-w-[200px]">
                      {[...(profile?.lead_sources || []), ...(profile?.custom_lead_sources || [])].map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied to all customers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Service Type</Label>
                  <Select value={defaultServiceType} onValueChange={setDefaultServiceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="px-2 min-w-[200px]">
                      {[...(profile?.service_types || []), ...(profile?.custom_service_types || [])].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied to all customers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Frequency</Label>
                  <Select value={defaultFrequency} onValueChange={setDefaultFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="px-2 min-w-[200px]">
                      {[...(profile?.service_frequencies || []), ...(profile?.custom_service_frequencies || [])].map(frequency => (
                        <SelectItem key={frequency} value={frequency}>{frequency}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied to all customers
                  </p>
                </div>
              </div>
            </div>
          )}

          {file && selectedTab === 'leads' && (
            <div className="border-t pt-4 space-y-4 -mx-6 px-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Assigned Priority</Label>
                  <Select value={defaultPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setDefaultPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="px-2 min-w-[200px]">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied to all leads
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Status</Label>
                  <Select value={defaultStatus} onValueChange={setDefaultStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="px-2 min-w-[200px]">
                      {[...(profile?.lead_stages || []), ...(profile?.custom_lead_stages || [])].map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied to all leads
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Assigned Source</Label>
                  <Select value={defaultSource} onValueChange={setDefaultSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="px-2 min-w-[200px]">
                      {[...(profile?.lead_sources || []), ...(profile?.custom_lead_sources || [])].map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied to all leads
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={!file || isLoading || !mappings.some(m => m.targetField)}
          >
            {isLoading ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}