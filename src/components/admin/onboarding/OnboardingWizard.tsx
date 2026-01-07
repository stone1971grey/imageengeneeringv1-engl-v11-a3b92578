/**
 * Tenant Onboarding Wizard
 * 
 * Interaktiver Setup-Wizard für neue Tenant-Projekte.
 * Führt durch alle Onboarding-Schritte mit Fortschrittsanzeige.
 * 
 * @version 1.8.0
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Check, ChevronRight, ChevronLeft, Rocket, 
  FolderOpen, Database, Settings, Users, 
  Globe, Zap, Shield, CheckCircle2, Circle,
  Download, Copy, ExternalLink, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// ONBOARDING PHASES
// ============================================================================

export interface OnboardingStep {
  id: string;
  label: string;
  description?: string;
  isOptional?: boolean;
  helpUrl?: string;
}

export interface OnboardingPhase {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  estimatedTime: string;
  steps: OnboardingStep[];
}

export const ONBOARDING_PHASES: OnboardingPhase[] = [
  {
    id: 'project',
    title: 'Projekt erstellen',
    description: 'Neues Lovable-Projekt anlegen und Cloud aktivieren',
    icon: Rocket,
    estimatedTime: '5 Min',
    steps: [
      { id: 'create-project', label: 'Neues Lovable-Projekt erstellen' },
      { id: 'enable-cloud', label: 'Lovable Cloud aktivieren' },
      { id: 'note-project-id', label: 'Project ID notieren' },
    ],
  },
  {
    id: 'files',
    title: 'Core-Ordner kopieren',
    description: 'Alle Basis-Komponenten und Hooks übertragen',
    icon: FolderOpen,
    estimatedTime: '20 Min',
    steps: [
      { id: 'copy-components', label: 'src/components/ kopieren' },
      { id: 'copy-hooks', label: 'src/hooks/ kopieren' },
      { id: 'copy-lib', label: 'src/lib/ kopieren' },
      { id: 'copy-contexts', label: 'src/contexts/ kopieren' },
      { id: 'copy-functions', label: 'supabase/functions/ kopieren' },
    ],
  },
  {
    id: 'config',
    title: 'Konfiguration',
    description: 'siteConfig.ts und Design-Dateien anpassen',
    icon: Settings,
    estimatedTime: '15 Min',
    steps: [
      { id: 'create-siteconfig', label: 'siteConfig.ts aus Template erstellen' },
      { id: 'update-tenant', label: 'Tenant-Informationen eintragen' },
      { id: 'set-features', label: 'Feature-Flags konfigurieren' },
      { id: 'copy-design', label: 'index.css & tailwind.config.ts kopieren' },
      { id: 'update-config-toml', label: 'config.toml Project-ID anpassen' },
    ],
  },
  {
    id: 'database',
    title: 'Datenbank',
    description: 'Schema und Storage Buckets einrichten',
    icon: Database,
    estimatedTime: '10 Min',
    steps: [
      { id: 'run-migration', label: 'SQL-Migration ausführen' },
      { id: 'create-buckets', label: 'Storage Buckets erstellen (page-images, cms-media)' },
      { id: 'verify-tables', label: 'Tabellen verifizieren' },
    ],
  },
  {
    id: 'users',
    title: 'Admin-User',
    description: 'Ersten Administrator anlegen',
    icon: Users,
    estimatedTime: '5 Min',
    steps: [
      { id: 'register-user', label: 'User registrieren' },
      { id: 'assign-admin', label: 'Admin-Rolle zuweisen (SQL)' },
      { id: 'test-login', label: 'Login testen' },
    ],
  },
  {
    id: 'verify',
    title: 'Verifizierung',
    description: 'Alle Funktionen testen',
    icon: Shield,
    estimatedTime: '10 Min',
    steps: [
      { id: 'test-dashboard', label: 'Admin-Dashboard öffnen' },
      { id: 'test-pages', label: 'Seiten-Erstellung testen' },
      { id: 'test-frontend-edit', label: 'Frontend-Editing testen', isOptional: true },
      { id: 'test-modules', label: 'Aktivierte Module prüfen' },
    ],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedPhase, setExpandedPhase] = useState<string | null>(ONBOARDING_PHASES[0].id);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spade-onboarding-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedSteps(new Set(parsed.completedSteps || []));
        setCurrentPhaseIndex(parsed.currentPhaseIndex || 0);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('spade-onboarding-progress', JSON.stringify({
      completedSteps: Array.from(completedSteps),
      currentPhaseIndex,
    }));
  }, [completedSteps, currentPhaseIndex]);

  const totalSteps = ONBOARDING_PHASES.reduce((acc, phase) => acc + phase.steps.length, 0);
  const completedCount = completedSteps.size;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const isPhaseComplete = (phase: OnboardingPhase) => {
    return phase.steps.every(step => completedSteps.has(step.id) || step.isOptional);
  };

  const getPhaseProgress = (phase: OnboardingPhase) => {
    const completed = phase.steps.filter(step => completedSteps.has(step.id)).length;
    return Math.round((completed / phase.steps.length) * 100);
  };

  const resetProgress = () => {
    setCompletedSteps(new Set());
    setCurrentPhaseIndex(0);
    localStorage.removeItem('spade-onboarding-progress');
    toast.success('Fortschritt zurückgesetzt');
  };

  const allComplete = ONBOARDING_PHASES.every(isPhaseComplete);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Tenant Onboarding Wizard
          </h2>
          <p className="text-muted-foreground mt-1">
            Interaktive Checkliste für die Einrichtung neuer Projekte
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetProgress}>
          Zurücksetzen
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Gesamtfortschritt</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} / {totalSteps} Schritte
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              ~{ONBOARDING_PHASES.reduce((acc, p) => acc + parseInt(p.estimatedTime), 0)} Min geschätzt
            </span>
            <Badge variant={allComplete ? "default" : "secondary"}>
              {progressPercent}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-4">
        {ONBOARDING_PHASES.map((phase, index) => {
          const Icon = phase.icon;
          const isComplete = isPhaseComplete(phase);
          const phaseProgress = getPhaseProgress(phase);
          const isExpanded = expandedPhase === phase.id;
          const isCurrent = index === currentPhaseIndex;

          return (
            <Card 
              key={phase.id}
              className={`transition-all ${
                isComplete 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : isCurrent 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-card border-border'
              }`}
            >
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      isComplete 
                        ? 'bg-green-500/20' 
                        : isCurrent 
                          ? 'bg-primary/20' 
                          : 'bg-muted'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Phase {index + 1}</span>
                        {phase.title}
                      </CardTitle>
                      <CardDescription>{phase.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {phase.estimatedTime}
                    </Badge>
                    <Badge variant={isComplete ? "default" : "secondary"} className="text-xs">
                      {phaseProgress}%
                    </Badge>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3 pl-14">
                    {phase.steps.map((step) => {
                      const isStepComplete = completedSteps.has(step.id);

                      return (
                        <div 
                          key={step.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isStepComplete ? 'bg-green-500/10' : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox
                            id={step.id}
                            checked={isStepComplete}
                            onCheckedChange={() => toggleStep(step.id)}
                          />
                          <label 
                            htmlFor={step.id}
                            className={`flex-1 cursor-pointer ${
                              isStepComplete ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {step.label}
                            {step.isOptional && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Optional
                              </Badge>
                            )}
                          </label>
                          {isStepComplete && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Phase Navigation */}
                  <div className="flex justify-between mt-6 pl-14">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => {
                        setCurrentPhaseIndex(index - 1);
                        setExpandedPhase(ONBOARDING_PHASES[index - 1].id);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Vorherige Phase
                    </Button>
                    <Button
                      size="sm"
                      disabled={index === ONBOARDING_PHASES.length - 1}
                      onClick={() => {
                        setCurrentPhaseIndex(index + 1);
                        setExpandedPhase(ONBOARDING_PHASES[index + 1].id);
                      }}
                    >
                      Nächste Phase
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Completion */}
      {allComplete && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-full bg-green-500/20">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-400 text-lg">
                🎉 Onboarding abgeschlossen!
              </p>
              <p className="text-muted-foreground">
                Dein Tenant-Projekt ist vollständig eingerichtet und bereit für den Einsatz.
              </p>
            </div>
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
              Zum Dashboard
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-muted/20 border-border">
        <CardHeader>
          <CardTitle className="text-base">Schnellzugriff</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="/spade-cms-install" target="_blank">
              <Download className="h-4 w-4 mr-2" />
              Dateien herunterladen
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText("INSERT INTO user_roles (user_id, role) VALUES ('DEINE_USER_UUID', 'admin');");
            toast.success('Admin-SQL kopiert!');
          }}>
            <Copy className="h-4 w-4 mr-2" />
            Admin-SQL kopieren
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
