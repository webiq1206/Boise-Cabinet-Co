import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, DollarSign, MapPin, Phone, Mail, Building, ChevronDown, Receipt, AlertTriangle, Server, Hash, Calendar, Search, Filter, X, ArrowUpDown, MessageSquare, Plus, Tag, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Lead } from "@shared/schema";
import { useState, useMemo } from "react";
import { PRIORITY_SERVICES, CITIES } from "@shared/contentData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatQuoteRangeWholeFromValue } from "@/lib/utils";
import { calculateQuoteRange } from "@shared/utils";

// Detect if we're running on the production domain
function useEnvironment() {
  return useMemo(() => {
    const hostname = window.location.hostname;
    const isProduction = hostname === 'lawncarekuna.com' || hostname === 'www.lawncarekuna.com';
    return {
      isProduction,
      environmentLabel: isProduction ? 'Production' : 'Development',
      hostname
    };
  }, []);
}

interface LineItem {
  serviceId?: string;
  service?: string;
  serviceName?: string;
  description?: string;
  price?: number;
  basePrice?: number;
  adjustedPrice?: number;
  calculationExplanation?: string;
}

interface ServiceDataEntry {
  propertySize?: number;
  linearFeet?: number;
  zones?: number;
  treeCount?: number;
  quantity?: number;
  [key: string]: any;
}

function formatMeasurement(serviceId: string, data: ServiceDataEntry | undefined): string {
  if (!data) return '';
  
  const parts: string[] = [];
  
  if (data.propertySize) {
    parts.push(`${data.propertySize.toLocaleString()} sq ft`);
  }
  if (data.linearFeet) {
    parts.push(`${data.linearFeet.toLocaleString()} linear ft`);
  }
  if (data.zones) {
    parts.push(`${data.zones} zone${data.zones > 1 ? 's' : ''}`);
  }
  if (data.treeCount) {
    parts.push(`${data.treeCount} tree${data.treeCount > 1 ? 's' : ''}`);
  }
  if (data.quantity) {
    parts.push(`${data.quantity} unit${data.quantity > 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

function QuoteBreakdownSection({ lead }: { lead: Lead }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const lineItems = (lead.lineItems as LineItem[] | null) || [];
  const serviceData = (lead.serviceData as Record<string, ServiceDataEntry> | null) || {};
  const hasBreakdown = lineItems.length > 0 || Object.keys(serviceData).length > 0;
  
  if (!hasBreakdown && !lead.finalQuote) {
    return null;
  }
  
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '$0';
    return `$${price.toLocaleString()}`;
  };
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border-t pt-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
            data-testid={`button-toggle-breakdown-${lead.id}`}
          >
            <span className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Quote Breakdown
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-3" data-testid={`section-breakdown-${lead.id}`}>
          {lineItems.length > 0 ? (
            <div className="space-y-3">
              {lineItems.map((item, index) => {
                const serviceId = item.serviceId || item.service || '';
                const serviceName = item.serviceName || item.service || 'Service';
                const price = item.price || item.adjustedPrice || 0;
                const measurement = serviceData[serviceId] ? formatMeasurement(serviceId, serviceData[serviceId]) : '';
                
                return (
                  <div 
                    key={index} 
                    className="bg-muted/50 rounded-md p-3"
                    data-testid={`lineitem-${lead.id}-${index}`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-medium text-sm" data-testid={`text-service-name-${lead.id}-${index}`}>
                        {serviceName}
                      </span>
                      <span className="font-semibold text-sm text-primary" data-testid={`text-service-price-${lead.id}-${index}`}>
                        {formatPrice(price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground" data-testid={`text-service-desc-${lead.id}-${index}`}>
                        {item.description}
                      </p>
                    )}
                    {measurement && (
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-service-measurement-${lead.id}-${index}`}>
                        Measurement: {measurement}
                      </p>
                    )}
                    {item.calculationExplanation && (
                      <p className="text-xs text-muted-foreground/70 italic mt-2 pl-2 border-l-2 border-muted" data-testid={`text-service-explanation-${lead.id}-${index}`}>
                        {item.calculationExplanation}
                      </p>
                    )}
                  </div>
                );
              })}
              
              {lead.finalQuote && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-sm">Total Quote</span>
                  <span className="font-bold text-lg text-primary" data-testid={`text-total-quote-${lead.id}`}>
                    {formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {Object.keys(serviceData).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Service Measurements:</p>
                  {Object.entries(serviceData).map(([svcId, data]) => (
                    <div key={svcId} className="bg-muted/50 rounded-md p-2 text-sm">
                      <span className="font-medium">{svcId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-muted-foreground ml-2">{formatMeasurement(svcId, data)}</span>
                    </div>
                  ))}
                </div>
              )}
              {lead.finalQuote && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-sm">Total Quote</span>
                  <span className="font-bold text-lg text-primary" data-testid={`text-total-quote-${lead.id}`}>
                    {formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const environment = useEnvironment();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterServiceType, setFilterServiceType] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterQuoteMin, setFilterQuoteMin] = useState<string>("");
  const [filterQuoteMax, setFilterQuoteMax] = useState<string>("");
  const [filterLeadAge, setFilterLeadAge] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "quote" | "leadPrice" | "age">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
  });
  
  // Filter and search leads
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];
    
    // Tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter(l => l.status === "pending_admin");
    } else if (activeTab === "available") {
      filtered = filtered.filter(l => l.status === "available");
    } else if (activeTab === "purchased") {
      filtered = filtered.filter(l => l.status === "purchased");
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.address?.toLowerCase().includes(query) ||
        lead.city?.toLowerCase().includes(query)
      );
    }
    
    // Service type filter
    if (filterServiceType !== "all") {
      filtered = filtered.filter(l => l.serviceType === filterServiceType);
    }
    
    // City filter
    if (filterCity !== "all") {
      filtered = filtered.filter(l => l.city.toLowerCase() === filterCity.toLowerCase());
    }
    
    // Quote value filter
    if (filterQuoteMin) {
      const min = parseFloat(filterQuoteMin);
      if (!isNaN(min)) {
        filtered = filtered.filter(l => {
          if (!l.finalQuote) return false;
          const { max: quoteMax } = calculateQuoteRange(l.finalQuote, 0.15);
          return quoteMax >= min;
        });
      }
    }
    if (filterQuoteMax) {
      const max = parseFloat(filterQuoteMax);
      if (!isNaN(max)) {
        filtered = filtered.filter(l => {
          if (!l.finalQuote) return false;
          const { min: quoteMin } = calculateQuoteRange(l.finalQuote, 0.15);
          return quoteMin <= max;
        });
      }
    }
    
    // Lead age filter
    if (filterLeadAge !== "all") {
      const now = new Date();
      filtered = filtered.filter(l => {
        const created = new Date(l.createdAt);
        const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        const days = hours / 24;
        
        switch (filterLeadAge) {
          case "today":
            return hours < 24;
          case "24h":
            return hours >= 24 && hours < 48;
          case "48h+":
            return hours >= 48;
          default:
            return true;
        }
      });
    }
    
    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(l => (l.priority || "normal") === filterPriority);
    }
    
    // Tags filter
    if (filterTags.length > 0) {
      filtered = filtered.filter(l => {
        const leadTags: string[] = Array.isArray(l.tags) ? l.tags : (typeof l.tags === 'string' ? JSON.parse(l.tags) : []);
        return filterTags.some(tag => leadTags.includes(tag));
      });
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "quote":
          const pointA = a.finalQuote ? calculateQuoteRange(a.finalQuote, 0.15).point : 0;
          const pointB = b.finalQuote ? calculateQuoteRange(b.finalQuote, 0.15).point : 0;
          comparison = pointA - pointB;
          break;
        case "leadPrice":
          const priceA = parseFloat(a.currentLeadPrice || "0");
          const priceB = parseFloat(b.currentLeadPrice || "0");
          comparison = priceA - priceB;
          break;
        case "age":
          const ageA = new Date().getTime() - new Date(a.createdAt).getTime();
          const ageB = new Date().getTime() - new Date(b.createdAt).getTime();
          comparison = ageA - ageB;
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [leads, activeTab, searchQuery, filterServiceType, filterCity, filterQuoteMin, filterQuoteMax, filterLeadAge, filterPriority, filterTags, sortBy, sortOrder]);
  
  const clearFilters = () => {
    setSearchQuery("");
    setFilterServiceType("all");
    setFilterCity("all");
    setFilterQuoteMin("");
    setFilterQuoteMax("");
    setFilterLeadAge("all");
    setFilterPriority("all");
    setFilterTags([]);
    setSortBy("date");
    setSortOrder("desc");
  };
  
  const hasActiveFilters = searchQuery || filterServiceType !== "all" || filterCity !== "all" || 
    filterQuoteMin || filterQuoteMax || filterLeadAge !== "all" || filterPriority !== "all" || filterTags.length > 0 || sortBy !== "date" || sortOrder !== "desc";

  // Get all unique tags from leads
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    leads.forEach(lead => {
      const tags: string[] = Array.isArray(lead.tags) ? lead.tags : (typeof lead.tags === 'string' ? JSON.parse(lead.tags) : []);
      tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [leads]);

  const acceptLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/accept`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Accepted",
        description: "You have accepted this lead.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const declineLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/decline`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Declined",
        description: "Lead is now available for subcontractors.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ leadId, note }: { leadId: string; note: string }) => {
      const res = await apiRequest("POST", `/api/leads/${leadId}/notes`, { note });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Note Added",
        description: "Your note has been added to the lead.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, data }: { leadId: string; data: Partial<Lead> }) => {
      const res = await apiRequest("PATCH", `/api/leads/${leadId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead Updated",
        description: "Lead details have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Use filtered leads instead of separate arrays
  const pendingLeads = filteredLeads.filter(l => l.status === "pending_admin");
  const acceptedLeads = filteredLeads.filter(l => l.status === "accepted");
  const declinedLeads = filteredLeads.filter(l => l.status === "available");
  const allPurchasedLeads = filteredLeads.filter(l => l.status === "purchased");

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0.00";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLeadAge = (date: Date | string | null) => {
    if (!date) return "N/A";
    const now = new Date();
    const created = new Date(date);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const getServiceName = (serviceSlug: string): string => {
    const service = PRIORITY_SERVICES.find(s => s.slug === serviceSlug);
    return service ? service.name : serviceSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPropertySizeFromServiceData = (serviceData: Record<string, ServiceDataEntry> | null): number | null => {
    if (!serviceData) return null;
    for (const data of Object.values(serviceData)) {
      if (data?.propertySize && typeof data.propertySize === 'number' && data.propertySize > 0) {
        return data.propertySize;
      }
    }
    return null;
  };

  const NotesSection = ({ lead, onAddNote }: { lead: Lead; onAddNote: (note: string) => void }) => {
    const [noteText, setNoteText] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const notes: Array<{text: string; addedBy: string; addedAt: string}> = lead.notes 
      ? (Array.isArray(lead.notes) ? lead.notes : typeof lead.notes === 'string' ? JSON.parse(lead.notes) : [])
      : [];
    
    const handleAddNote = () => {
      if (noteText.trim()) {
        onAddNote(noteText.trim());
        setNoteText("");
        setIsDialogOpen(false);
      }
    };
    
    return (
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Notes ({notes.length})</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Note</DialogTitle>
                <DialogDescription>
                  Add an internal note about this lead. Notes are only visible to admins.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Enter your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                  Add Note
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {notes.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notes.map((note, index) => (
              <div key={index} className="bg-muted/50 rounded-md p-3 text-sm">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-xs text-muted-foreground">{note.addedBy}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.addedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p className="text-sm">{note.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No notes yet. Add a note to track internal comments about this lead.</p>
        )}
      </div>
    );
  };

  const LeadCard = ({ lead, showActions = false }: { lead: Lead; showActions?: boolean }) => {
    const leadTags: string[] = Array.isArray(lead.tags) ? lead.tags : (typeof lead.tags === 'string' ? JSON.parse(lead.tags) : []);
    const priority = lead.priority || "normal";
    const [editingTags, setEditingTags] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [editingPriority, setEditingPriority] = useState(false);

    const getPriorityColor = (p: string) => {
      switch (p) {
        case "urgent": return "bg-red-600 text-white";
        case "high": return "bg-orange-600 text-white";
        case "normal": return "bg-blue-600 text-white";
        case "low": return "bg-gray-400 text-white";
        default: return "bg-blue-600 text-white";
      }
    };

    return (
    <Card key={lead.id} className="overflow-hidden" data-testid={`card-lead-${lead.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-lg" data-testid={`text-lead-name-${lead.id}`}>
                {lead.name}
              </CardTitle>
              {priority !== "normal" && (
                <Badge className={getPriorityColor(priority)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {priority.toUpperCase()}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">
              {lead.serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} in {lead.city}
            </CardDescription>
            {leadTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {leadTags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={lead.status === "pending_admin" ? "default" : lead.status === "purchased" ? "secondary" : "outline"} data-testid={`badge-status-${lead.id}`}>
              {lead.status === "pending_admin" ? "Pending Review" : lead.status === "purchased" ? "Purchased" : "Available"}
            </Badge>
            {showActions && (
              <div className="flex gap-1">
                <Popover open={editingPriority} onOpenChange={setEditingPriority}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7">
                      <Flag className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <Label>Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(value) => {
                        updateLeadMutation.mutate({ leadId: lead.id, data: { priority: value as any } });
                        setEditingPriority(false);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </PopoverContent>
                </Popover>
                <Popover open={editingTags} onOpenChange={setEditingTags}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7">
                      <Tag className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <Label>Tags</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newTag.trim()) {
                              const updatedTags = [...leadTags, newTag.trim()];
                              updateLeadMutation.mutate({ leadId: lead.id, data: { tags: updatedTags as any } });
                              setNewTag("");
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (newTag.trim()) {
                              const updatedTags = [...leadTags, newTag.trim()];
                              updateLeadMutation.mutate({ leadId: lead.id, data: { tags: updatedTags as any } });
                              setNewTag("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {leadTags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                            <button
                              onClick={() => {
                                const updatedTags = leadTags.filter((_, i) => i !== idx);
                                updateLeadMutation.mutate({ leadId: lead.id, data: { tags: updatedTags as any } });
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                Quote Range: {lead.finalQuote ? formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15) : "Pending"}
              </p>
              <p className="text-muted-foreground">
                Lead Price: {formatCurrency(lead.currentLeadPrice)}
                {lead.baseLeadPrice !== lead.currentLeadPrice && (
                  <span className="ml-1 text-xs">(Base: {formatCurrency(lead.baseLeadPrice)})</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{formatDate(lead.createdAt)}</p>
              <p className="text-muted-foreground text-xs">
                {formatLeadAge(lead.createdAt)} • {lead.frequency || "one-time"}
              </p>
            </div>
          </div>
        </div>

        {lead.quoteId && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
            <Hash className="h-3 w-3" />
            <span>Quote ID: {lead.quoteId}</span>
          </div>
        )}

        {lead.selectedServices && lead.selectedServices.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Selected Services:</p>
            <div className="flex flex-wrap gap-2">
              {lead.selectedServices.map((serviceId, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {getServiceName(serviceId)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!!lead.serviceData && typeof lead.serviceData === "object" && Object.keys(lead.serviceData as any).length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Service Measurements:</p>
            <div className="space-y-2">
              {Object.entries(lead.serviceData as Record<string, ServiceDataEntry>).map(([serviceId, data]) => {
                const measurement = formatMeasurement(serviceId, data);
                return (
                  <div key={serviceId} className="bg-muted/50 rounded-md p-2 text-sm">
                    <span className="font-medium">{getServiceName(serviceId)}:</span>
                    {measurement && (
                      <span className="text-muted-foreground ml-2">{measurement}</span>
                    )}
                    {!measurement && data && (
                      <span className="text-muted-foreground ml-2 text-xs italic">No measurements provided</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`mailto:${lead.email}`} 
              className="text-primary hover:underline"
              data-testid={`text-email-${lead.id}`}
            >
              {lead.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`tel:${lead.phone}`} 
              className="text-primary hover:underline"
              data-testid={`text-phone-${lead.id}`}
            >
              {lead.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-address-${lead.id}`}>
              {lead.address && lead.address !== "***" ? lead.address : `${lead.city.charAt(0).toUpperCase() + lead.city.slice(1)}, Idaho`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{lead.propertyType.replace(/-/g, " ")}</span>
          </div>
          {(() => {
            const propertySize = getPropertySizeFromServiceData(lead.serviceData as Record<string, ServiceDataEntry> | null);
            return propertySize ? (
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span>{propertySize.toLocaleString()} sq ft</span>
              </div>
            ) : null;
          })()}
        </div>

        {lead.message && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-1">Customer Message:</p>
            <p className="text-sm" data-testid={`text-message-${lead.id}`}>{lead.message}</p>
          </div>
        )}

        <QuoteBreakdownSection lead={lead} />

        {/* Notes Section */}
        <NotesSection lead={lead} onAddNote={(note) => addNoteMutation.mutate({ leadId: lead.id, note })} />

        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => acceptLeadMutation.mutate(lead.id)}
              disabled={acceptLeadMutation.isPending}
              className="flex-1"
              data-testid={`button-accept-${lead.id}`}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Accept Lead
            </Button>
            <Button
              onClick={() => declineLeadMutation.mutate(lead.id)}
              disabled={declineLeadMutation.isPending}
              variant="outline"
              className="flex-1"
              data-testid={`button-decline-${lead.id}`}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline (Send to Subcontractors)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container py-8" data-testid="page-admin-dashboard">
      {/* Environment Indicator */}
      {!environment.isProduction && (
        <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md flex items-center gap-3" data-testid="banner-dev-environment">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">Development Environment</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              You're viewing the development database. For production leads, visit{" "}
              <a 
                href="https://lawncarekuna.com/admin" 
                className="underline font-medium hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                lawncarekuna.com/admin
              </a>
            </p>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <Badge 
            variant={environment.isProduction ? "default" : "outline"}
            className={environment.isProduction ? "bg-green-600 hover:bg-green-600" : "border-amber-500 text-amber-700 dark:text-amber-400"}
            data-testid="badge-environment"
          >
            <Server className="h-3 w-3 mr-1" />
            {environment.environmentLabel}
          </Badge>
        </div>
        <p className="text-muted-foreground">Manage incoming leads and quote requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-pending">{pendingLeads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted by You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-accepted">{acceptedLeads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available to Subs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-available">{declinedLeads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="count-purchased">{allPurchasedLeads.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filters
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, address, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Service Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Service Type</label>
                <Select value={filterServiceType} onValueChange={setFilterServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {Array.from(new Set(leads.map(l => l.serviceType))).map(serviceType => (
                      <SelectItem key={serviceType} value={serviceType}>
                        {serviceType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">City</label>
                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {Array.from(new Set(leads.map(l => l.city))).sort().map(city => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lead Age Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Lead Age</label>
                <Select value={filterLeadAge} onValueChange={setFilterLeadAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="today">Today (&lt;24h)</SelectItem>
                    <SelectItem value="24h">24-48 Hours</SelectItem>
                    <SelectItem value="48h+">48+ Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !filterTags.includes(value)) {
                      setFilterTags([...filterTags, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tags..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                    {allTags.length === 0 && (
                      <SelectItem value="" disabled>No tags available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {filterTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filterTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => setFilterTags(filterTags.filter(t => t !== tag))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="quote">Quote Value</SelectItem>
                      <SelectItem value="leadPrice">Lead Price</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quote Value Range */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Quote Value Range</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min $"
                    value={filterQuoteMin}
                    onChange={(e) => setFilterQuoteMin(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max $"
                    value={filterQuoteMax}
                    onChange={(e) => setFilterQuoteMax(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground pt-2 border-t">
            Showing {filteredLeads.length} of {leads.length} leads
            {hasActiveFilters && " (filtered)"}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions (for pending leads only) */}
      {activeTab === "pending" && filteredLeads.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
            <CardDescription>Select leads to perform bulk operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const selected = filteredLeads.filter(l => l.status === "pending_admin");
                  if (selected.length > 0 && confirm(`Accept ${selected.length} lead(s)?`)) {
                    selected.forEach(lead => acceptLeadMutation.mutate(lead.id));
                  }
                }}
                disabled={acceptLeadMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Accept All Filtered ({filteredLeads.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const selected = filteredLeads.filter(l => l.status === "pending_admin");
                  if (selected.length > 0 && confirm(`Decline ${selected.length} lead(s)?`)) {
                    selected.forEach(lead => declineLeadMutation.mutate(lead.id));
                  }
                }}
                disabled={declineLeadMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline All Filtered ({filteredLeads.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export to CSV
                  const csv = [
                    ["Name", "Email", "Phone", "City", "Service Type", "Quote Value", "Lead Price", "Status", "Created At"].join(","),
                    ...filteredLeads.map(lead => [
                      lead.name,
                      lead.email,
                      lead.phone,
                      lead.city,
                      lead.serviceType,
                      lead.finalQuote ? formatQuoteRangeWholeFromValue(lead.finalQuote, 0.15) : "Pending",
                      lead.currentLeadPrice,
                      lead.status,
                      new Date(lead.createdAt).toISOString()
                    ].map(v => `"${v}"`).join(","))
                  ].join("\n");
                  
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  
                  toast({
                    title: "Export Complete",
                    description: `Exported ${filteredLeads.length} leads to CSV`,
                  });
                }}
              >
                <Receipt className="h-4 w-4 mr-1" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingLeads.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" data-testid="tab-accepted">
            Accepted ({acceptedLeads.length})
          </TabsTrigger>
          <TabsTrigger value="available" data-testid="tab-available">
            Available ({declinedLeads.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All Purchased ({allPurchasedLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredLeads.filter(l => l.status === "pending_admin").length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {hasActiveFilters ? "No pending leads match your filters" : "No pending leads to review"}
              </CardContent>
            </Card>
          ) : (
            filteredLeads.filter(l => l.status === "pending_admin").map(lead => <LeadCard key={lead.id} lead={lead} showActions />)
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {filteredLeads.filter(l => l.status === "accepted").length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {hasActiveFilters ? "No accepted leads match your filters" : "You haven't accepted any leads yet"}
              </CardContent>
            </Card>
          ) : (
            filteredLeads.filter(l => l.status === "accepted").map(lead => <LeadCard key={lead.id} lead={lead} />)
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {filteredLeads.filter(l => l.status === "available").length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {hasActiveFilters ? "No available leads match your filters" : "No leads available for subcontractors"}
              </CardContent>
            </Card>
          ) : (
            filteredLeads.filter(l => l.status === "available").map(lead => <LeadCard key={lead.id} lead={lead} />)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredLeads.filter(l => l.status === "purchased").length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {hasActiveFilters ? "No purchased leads match your filters" : "No purchased leads yet"}
              </CardContent>
            </Card>
          ) : (
            filteredLeads.filter(l => l.status === "purchased").map(lead => <LeadCard key={lead.id} lead={lead} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
