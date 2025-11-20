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
}

export function ServiceFieldsRenderer({
  selectedServices,
  serviceData,
  onChange,
}: ServiceFieldsRendererProps) {
  if (selectedServices.length === 0) {
    return null;
  }

  // Get configs for all selected services
  const serviceConfigs = selectedServices
    .map(id => getServiceFieldConfig(id))
    .filter((config): config is ServiceFieldConfig => config !== undefined);

  if (serviceConfigs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please provide service-specific details below. These help us generate an accurate quote.
        </AlertDescription>
      </Alert>

      {serviceConfigs.map((config) => {
        const currentData = serviceData[config.serviceId] || {};

        return (
          <div key={config.serviceId} className="space-y-4 rounded-lg border border-border p-4">
            <h3 className="font-medium text-lg">{config.serviceName}</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {config.fields.map((field) => {
                const fieldValue = currentData[field.name] || "";

                return (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={`${config.serviceId}-${field.name}`}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                      {field.unit && <span className="text-muted-foreground text-sm ml-1">({field.unit})</span>}
                    </Label>

                    {field.type === "select" ? (
                      <Select
                        value={fieldValue}
                        onValueChange={(value) => onChange(config.serviceId, field.name, value)}
                      >
                        <SelectTrigger
                          id={`${config.serviceId}-${field.name}`}
                          data-testid={`select-${config.serviceId}-${field.name}`}
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
                        id={`${config.serviceId}-${field.name}`}
                        data-testid={`textarea-${config.serviceId}-${field.name}`}
                        placeholder={field.placeholder}
                        value={fieldValue}
                        onChange={(e) => onChange(config.serviceId, field.name, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`${config.serviceId}-${field.name}`}
                        data-testid={`input-${config.serviceId}-${field.name}`}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={fieldValue}
                        onChange={(e) => {
                          if (field.type === "number") {
                            // For number fields, parse to actual number (not string)
                            const parsed = parseFloat(e.target.value);
                            const value = Number.isFinite(parsed) ? parsed : undefined;
                            onChange(config.serviceId, field.name, value);
                          } else {
                            onChange(config.serviceId, field.name, e.target.value);
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
          </div>
        );
      })}
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
