import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Mail, Phone, Building, FileText, Globe, Shield } from "lucide-react";
import type { User } from "@shared/schema";

type SubcontractorWithAgreement = User;

export function AdminSubcontractorPanel() {
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<SubcontractorWithAgreement | null>(null);

  const { data: subcontractors = [], isLoading } = useQuery<SubcontractorWithAgreement[]>({
    queryKey: ["/api/admin/subcontractors"],
  });

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getFullName = (sub: SubcontractorWithAgreement) => {
    const firstName = sub.firstName || "";
    const lastName = sub.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || sub.email || "Unknown";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subcontractors</CardTitle>
          <CardDescription>Manage subcontractor accounts and agreements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Subcontractors</CardTitle>
          <CardDescription>
            Manage subcontractor accounts and view agreement status ({subcontractors.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subcontractors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subcontractors found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Agreement Status</TableHead>
                  <TableHead>Signed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcontractors.map((sub) => (
                  <TableRow
                    key={sub.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => setSelectedSubcontractor(sub)}
                    data-testid={`row-subcontractor-${sub.id}`}
                  >
                    <TableCell className="font-medium" data-testid={`text-subcontractor-name-${sub.id}`}>
                      {getFullName(sub)}
                    </TableCell>
                    <TableCell data-testid={`text-subcontractor-email-${sub.id}`}>
                      {sub.email || "N/A"}
                    </TableCell>
                    <TableCell data-testid={`text-subcontractor-company-${sub.id}`}>
                      {sub.company || "N/A"}
                    </TableCell>
                    <TableCell>
                      {sub.agreementAccepted ? (
                        <Badge variant="default" className="bg-primary" data-testid={`badge-agreement-signed-${sub.id}`}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Signed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" data-testid={`badge-agreement-pending-${sub.id}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell data-testid={`text-subcontractor-signed-date-${sub.id}`}>
                      {formatDate(sub.agreementAcceptedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubcontractor} onOpenChange={() => setSelectedSubcontractor(null)}>
        <DialogContent className="max-w-lg" data-testid="modal-subcontractor-detail">
          <DialogHeader>
            <DialogTitle>Subcontractor Details</DialogTitle>
            <DialogDescription>
              View contact information and agreement status
            </DialogDescription>
          </DialogHeader>
          {selectedSubcontractor && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" data-testid="text-detail-name">
                      {getFullName(selectedSubcontractor)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span data-testid="text-detail-email">{selectedSubcontractor.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span data-testid="text-detail-phone">{selectedSubcontractor.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span data-testid="text-detail-company">{selectedSubcontractor.company || "N/A"}</span>
                  </div>
                  {selectedSubcontractor.licenseNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span data-testid="text-detail-license">License: {selectedSubcontractor.licenseNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Agreement Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {selectedSubcontractor.agreementAccepted ? (
                      <Badge variant="default" className="bg-primary" data-testid="badge-detail-agreement-signed">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Agreement Signed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" data-testid="badge-detail-agreement-pending">
                        <Clock className="h-3 w-3 mr-1" />
                        Agreement Pending
                      </Badge>
                    )}
                  </div>

                  {selectedSubcontractor.agreementAccepted && (
                    <div className="bg-muted/50 rounded-md p-4 space-y-3 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Electronic Signature</p>
                        <p className="font-medium text-lg italic" data-testid="text-detail-signature">
                          {selectedSubcontractor.agreementSignature || "N/A"}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Date/Time Signed</p>
                          <p data-testid="text-detail-signed-datetime">
                            {formatDateTime(selectedSubcontractor.agreementAcceptedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Agreement Version</p>
                          <p data-testid="text-detail-agreement-version">
                            {selectedSubcontractor.agreementVersion || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" /> IP Address
                        </p>
                        <p className="font-mono text-sm" data-testid="text-detail-ip">
                          {selectedSubcontractor.agreementSignatureIp || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Shield className="h-3 w-3" /> User Agent
                        </p>
                        <p className="text-xs font-mono text-muted-foreground break-all" data-testid="text-detail-user-agent">
                          {selectedSubcontractor.agreementSignatureUserAgent || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
