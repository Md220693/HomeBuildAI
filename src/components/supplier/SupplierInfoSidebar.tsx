import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface SupplierInfoSidebarProps {
  className?: string;
}

export function SupplierInfoSidebar({ className }: SupplierInfoSidebarProps) {
  return (
    <>
      {/* Desktop Version - Sempre visibile */}
      <aside className={cn("hidden lg:block", className)}>
        <Card className="sticky top-6 shadow-lg">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Come Funziona
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">Registrati</span> al nostro portale <span className="font-medium text-primary">HomeBuildAI.it</span> per avere accesso a lead edilizi ultraprofilati
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">Inserisci i tuoi dati</span>, i dati della tua azienda e le aree in cui operate
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm leading-relaxed">
                    Dopo la registrazione avrai <span className="font-semibold">accesso alla tua dashboard</span>, nella quale avrai modo di acquistare i lead che ti forniamo e visualizzare lo storico di acquisto
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-6">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 text-center space-y-2">
                <TrendingUp className="h-8 w-8 mx-auto text-primary" />
                <p className="font-bold text-sm">
                  Diventa partner di HomeBuildAI
                </p>
                <p className="text-sm text-muted-foreground">
                  ed accendi il tuo business!
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-xs text-muted-foreground">Lead qualificati con capitolato</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-xs text-muted-foreground">Risparmia tempo e risorse</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-xs text-muted-foreground">Clienti realmente interessati</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Mobile Version - Collapsible Sheet */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <FileText className="h-5 w-5 mr-2" />
              Come funziona
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Come Funziona
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6 overflow-y-auto h-[calc(80vh-100px)]">
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">Registrati</span> al nostro portale <span className="font-medium text-primary">HomeBuildAI.it</span> per avere accesso a lead edilizi ultraprofilati
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">Inserisci i tuoi dati</span>, i dati della tua azienda e le aree in cui operate
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm leading-relaxed">
                      Dopo la registrazione avrai <span className="font-semibold">accesso alla tua dashboard</span>, nella quale avrai modo di acquistare i lead che ti forniamo e visualizzare lo storico di acquisto
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t pt-6">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 text-center space-y-2">
                  <TrendingUp className="h-8 w-8 mx-auto text-primary" />
                  <p className="font-bold text-sm">
                    Diventa partner di HomeBuildAI
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ed accendi il tuo business!
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 pt-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-xs text-muted-foreground">Lead qualificati con capitolato</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-xs text-muted-foreground">Risparmia tempo e risorse</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-xs text-muted-foreground">Clienti realmente interessati</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
