import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { getServiceFieldConfig, ServiceFieldConfig } from "@shared/serviceFieldConfig";

interface ServiceFieldsRendererProps {
  selectedServices: string[];
  serviceData: Record<string, Record<string, any>>;
  onChange: (serviceId: string, fieldName: string, value: any) => void;
  activeServiceId?: string | null;
  onActiveServiceIdChange?: (serviceId: string | null) => void;
}

export function ServiceFieldsRenderer({
  selectedServices,
  serviceData,
  onChange,
  activeServiceId: controlledActiveServiceId,
  onActiveServiceIdChange,
}: ServiceFieldsRendererProps) {
  const [internalActiveServiceId, setInternalActiveServiceId] = useState<string | null>(null);
  const activeServiceId = controlledActiveServiceId ?? internalActiveServiceId;
  const setActiveServiceId = (serviceId: string | null) => {
    if (onActiveServiceIdChange) onActiveServiceIdChange(serviceId);
    else setInternalActiveServiceId(serviceId);
  };

  // Get configs for all selected services
  const serviceConfigs = selectedServices
    .map(id => getServiceFieldConfig(id))
    .filter((config): config is ServiceFieldConfig => config !== undefined);

  // Initialize or realign activeServiceId when selected services change
  useEffect(() => {
    if (serviceConfigs.length === 0) {
      setActiveServiceId(null);
      return;
    }

    // If no active service or active service is no longer in the list, set to first service
    const isActiveServiceStillSelected = serviceConfigs.some(c => c.serviceId === activeServiceId);
    if (!activeServiceId || !isActiveServiceStillSelected) {
      setActiveServiceId(serviceConfigs[0].serviceId);
    }
  }, [selectedServices, activeServiceId]);

  if (selectedServices.length === 0) {
    return null;
  }

  if (serviceConfigs.length === 0) {
    return null;
  }

  // Check if a service's fields are complete
  const isServiceComplete = (serviceId: string): boolean => {
    const config = getServiceFieldConfig(serviceId);
    if (!config) return false;
    const data = serviceData[serviceId] || {};
    return config.fields
      .filter(f => f.required)
      .every(f => {
        const value = data[f.name];
        return value !== undefined && value !== null && value !== "";
      });
  };

  const activeConfig = serviceConfigs.find(c => c.serviceId === activeServiceId);
  const activeDisplayFields =
    activeConfig?.fields?.filter((f) => !(f.measurementGroup && f.measurementGroup.startsWith("shared"))) || [];

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Provide any remaining details for your selected services. Measurements are collected once and applied automatically.
        </AlertDescription>
      </Alert>

      {/* Service Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {serviceConfigs.map((config) => {
          const isActive = config.serviceId === activeServiceId;
          const isComplete = isServiceComplete(config.serviceId);
          
          return (
            <button
              key={config.serviceId}
              onClick={() => setActiveServiceId(config.serviceId)}
              className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover-elevate'
              }`}
              data-testid={`tab-service-${config.serviceId}`}
            >
              {config.serviceName}
              {isComplete && <span className="ml-2">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Active Service Fields */}
      {activeConfig && (
        <div className="space-y-4 p-4 rounded-lg border border-border">
          <h3 className="font-medium text-lg">{activeConfig.serviceName}</h3>
          
          {activeDisplayFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No additional details needed for this service.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {activeDisplayFields.map((field) => {
              const currentData = serviceData[activeConfig.serviceId] || {};
              const fieldValue = currentData[field.name] || "";

              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={`${activeConfig.serviceId}-${field.name}`}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                    {field.unit && <span className="text-muted-foreground text-sm ml-1">({field.unit})</span>}
                  </Label>

                  {field.type === "select" ? (
                    <Select
                      value={fieldValue}
                      onValueChange={(value) => onChange(activeConfig.serviceId, field.name, value)}
                    >
                      <SelectTrigger
                        id={`${activeConfig.serviceId}-${field.name}`}
                        data-testid={`select-${activeConfig.serviceId}-${field.name}`}
                      >
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={`${activeConfig.serviceId}-${field.name}`}
                      data-testid={`textarea-${activeConfig.serviceId}-${field.name}`}
                      placeholder={field.placeholder}
                      value={fieldValue}
                      onChange={(e) => onChange(activeConfig.serviceId, field.name, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={`${activeConfig.serviceId}-${field.name}`}
                      data-testid={`input-${activeConfig.serviceId}-${field.name}`}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={fieldValue}
                      onChange={(e) => {
                        if (field.type === "number") {
                          const parsed = parseFloat(e.target.value);
                          const value = Number.isFinite(parsed) ? parsed : undefined;
                          onChange(activeConfig.serviceId, field.name, value);
                        } else {
                          onChange(activeConfig.serviceId, field.name, e.target.value);
                        }
                      }}
                    />
                  )}

                  {field.helpText && (
                    <p className="text-sm text-muted-foreground">{field.helpText}</p>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function validateServiceData(
  selectedServices: string[],
  serviceData: Record<string, Record<string, any>>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const serviceId of selectedServices) {
    const config = getServiceFieldConfig(serviceId);
    if (!config) continue;

    const data = serviceData[serviceId] || {};

    for (const field of config.fields) {
      if (field.required) {
        const value = data[field.name];
        if (value === undefined || value === null || value === "") {
          errors.push(`${config.serviceName}: ${field.label} is required`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
