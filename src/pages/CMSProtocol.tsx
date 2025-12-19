import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const CMSProtocol = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <Navigation />
      </div>
      
      <section className="pt-32 pb-16 px-4 print:pt-8 print:pb-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-6 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Als PDF drucken
            </Button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-8 print:border-0 print:p-0">
            <article className="prose prose-lg max-w-none print:prose-sm">
              <h1 className="text-3xl font-bold text-black mb-2">CMS Development Backlog & Optimierungsprotokoll</h1>
              <p className="text-gray-600 mb-6">
                <strong>Erstellt:</strong> 2025-12-19 | <strong>Status:</strong> Analyse abgeschlossen | <strong>Projekt:</strong> Image Engineering CMS
              </p>
              
              <hr className="my-8" />

              <h2 className="text-2xl font-bold text-black mt-8 mb-4">Übersicht</h2>
              <p className="text-gray-700">
                Dieses Dokument dokumentiert die technische Analyse des CMS-Systems und identifiziert Optimierungspotenziale für zukünftige Entwicklung.
              </p>

              <hr className="my-8" />

              <h2 className="text-2xl font-bold text-black mt-8 mb-4">1. AdminDashboard.tsx - Monolithische Struktur</h2>
              
              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Problem</h3>
              <p className="text-gray-700">
                Die Datei <code className="bg-gray-100 px-1 rounded">AdminDashboard.tsx</code> enthält ~5000+ Zeilen Code mit:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Sämtliche Editor-Logik</li>
                <li>State-Management für alle Segment-Typen</li>
                <li>UI-Rendering für Admin-Oberfläche</li>
                <li>Authentifizierung und Autorisierung</li>
              </ul>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Aufwandsschätzung</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Schritt</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Aufwand</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Risiko</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">Editors extrahieren</td><td className="border border-gray-300 px-4 py-2 text-black">Medium</td><td className="border border-gray-300 px-4 py-2 text-black">Niedrig</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">Shared Hooks erstellen</td><td className="border border-gray-300 px-4 py-2 text-black">Medium</td><td className="border border-gray-300 px-4 py-2 text-black">Niedrig</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">State-Management entkoppeln</td><td className="border border-gray-300 px-4 py-2 text-black">Hoch</td><td className="border border-gray-300 px-4 py-2 text-black">Mittel</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">AdminDashboard auf Router reduzieren</td><td className="border border-gray-300 px-4 py-2 text-black">Hoch</td><td className="border border-gray-300 px-4 py-2 text-black">Hoch</td></tr>
                    <tr className="font-semibold"><td className="border border-gray-300 px-4 py-2 text-black">Gesamt</td><td className="border border-gray-300 px-4 py-2 text-black" colSpan={2}>15-25 Iterationen</td></tr>
                  </tbody>
                </table>
              </div>

              <hr className="my-8" />

              <h2 className="text-2xl font-bold text-black mt-8 mb-4">2. Hardcodierte Segment-Typen</h2>
              
              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Problem</h3>
              <p className="text-gray-700">
                Neue Segment-Typen erfordern Änderungen in mehreren Dateien:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">AdminDashboard.tsx</code> - Switch-Case für Editor</li>
                <li><code className="bg-gray-100 px-1 rounded">DynamicCMSPage.tsx</code> - Switch-Case für Renderer</li>
                <li><code className="bg-gray-100 px-1 rounded">CreateCMSPageDialog.tsx</code> - Dropdown-Optionen</li>
              </ul>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Lösungsvorschlag: Plugin-Registry</h3>
              <p className="text-gray-700">Vorteile:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Neue Segmente: 1 Datei erstellen + Registry-Eintrag</li>
                <li>Zentrale Konfiguration</li>
                <li>Einfachere Tests</li>
                <li>Potenzial für DB-basierte Plugin-Definition</li>
              </ul>
              <p className="text-gray-700 mt-4"><strong>Geschätzter Aufwand:</strong> 8-12 Iterationen</p>

              <hr className="my-8" />

              <h2 className="text-2xl font-bold text-black mt-8 mb-4">3. Priorisierte Roadmap</h2>
              
              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Phase 1: Quick Wins</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Plugin-Registry für Segment-Typen erstellen</li>
                <li><code className="bg-gray-100 px-1 rounded">useAdminAuth</code> Hook extrahieren</li>
                <li>Dokumentation des CMS-Kerns</li>
              </ul>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Phase 2: Modularisierung</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Weitere Hooks extrahieren</li>
                <li>AdminDashboard State aufteilen</li>
                <li>Editor-Komponenten standardisieren</li>
              </ul>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Phase 3: Architektur</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>AdminDashboard als reiner Router</li>
                <li>Vollständige Plugin-Architektur</li>
                <li>CMS-Template für neue Projekte</li>
              </ul>

              <hr className="my-8" />

              <h2 className="text-2xl font-bold text-black mt-8 mb-4">4. Business-Analyse: Modulares CMS als Plattform</h2>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Business-Vorteile für Lovable-Projekte</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Vorteil</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Kernaussage</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Wertbeitrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">80% schnellere Lieferung</td><td className="border border-gray-300 px-4 py-2 text-black">CMS kopieren statt bauen</td><td className="border border-gray-300 px-4 py-2 text-black">Zeit = Geld</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">Konsistente Qualität</td><td className="border border-gray-300 px-4 py-2 text-black">Ein Bug-Fix für alle</td><td className="border border-gray-300 px-4 py-2 text-black">Weniger Risiko</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">Niedrige Wartung</td><td className="border border-gray-300 px-4 py-2 text-black">Zentrale Pflege</td><td className="border border-gray-300 px-4 py-2 text-black">50% Kostenreduktion</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Business-Vorteile für Endkunden</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Vorteil</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Kernaussage</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Wertbeitrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">Self-Service</td><td className="border border-gray-300 px-4 py-2 text-black">Kunden helfen sich selbst</td><td className="border border-gray-300 px-4 py-2 text-black">0€ Content-Kosten</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">No-Code-Anpassung</td><td className="border border-gray-300 px-4 py-2 text-black">Config statt Code</td><td className="border border-gray-300 px-4 py-2 text-black">Agilität</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 text-black">Enterprise-ready</td><td className="border border-gray-300 px-4 py-2 text-black">Compliance-Features</td><td className="border border-gray-300 px-4 py-2 text-black">Größere Deals</td></tr>
                  </tbody>
                </table>
              </div>

              <hr className="my-8" />

              <h2 className="text-2xl font-bold text-black mt-8 mb-4">5. Projekt-Gesamtbewertung</h2>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Executive Summary</h3>
              <p className="text-gray-700">
                Das Image Engineering CMS ist ein <strong>solides, produktionsreifes System</strong> mit hohem Potenzial als wiederverwendbares Template für B2B-Websites mit komplexen Content-Anforderungen.
              </p>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Bewertung nach Dimensionen</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Dimension</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Bewertung</th>
                      <th className="border border-gray-300 px-4 py-2 text-left text-black">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Professionalität</td><td className="border border-gray-300 px-4 py-2 text-black">Sehr gut</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐ (4/5)</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Umsetzung</td><td className="border border-gray-300 px-4 py-2 text-black">Gut bis sehr gut</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐ (4/5)</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Innovation</td><td className="border border-gray-300 px-4 py-2 text-black">Gut</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐ (3/5)</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Ausbaufähigkeit</td><td className="border border-gray-300 px-4 py-2 text-black">Exzellent</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐⭐ (5/5)</td></tr>
                    <tr><td className="border border-gray-300 px-4 py-2 font-medium text-black">Business-Grundlage</td><td className="border border-gray-300 px-4 py-2 text-black">Exzellent</td><td className="border border-gray-300 px-4 py-2 text-black">⭐⭐⭐⭐⭐ (5/5)</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-black mt-6 mb-3">Empfehlungen</h3>
              <p className="text-gray-700"><strong>Sofort umsetzbar:</strong></p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>AdminDashboard refactoring → bessere Wartbarkeit</li>
                <li>Plugin-Registry → einfachere Erweiterung</li>
                <li>Dokumentation → Onboarding für neue Entwickler</li>
              </ul>

              <p className="text-gray-700 mt-4"><strong>Mittelfristig (bei 3+ Projekten):</strong></p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Vollständige Modularisierung (~40-60 Iterationen)</li>
                <li>Template-Erstellung für neue Projekte</li>
                <li>Enterprise-Features (Audit-Log, Staging, Approvals)</li>
              </ul>

              <hr className="my-8" />

              <h2 className="text-2xl font-bold text-black mt-8 mb-4">Fazit</h2>
              <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-700 my-4">
                Das Image Engineering CMS ist eine exzellente Basis für B2B-Content-Projekte. Mit gezielter Modularisierung (~40-60 Iterationen) kann es zu einer wiederverwendbaren Plattform werden, die Projektlieferzeiten um 80% reduziert und als SaaS monetarisierbar ist.
              </blockquote>

              <hr className="my-8" />
              <p className="text-sm text-gray-500 italic">
                Dieses Dokument dient als Referenz für zukünftige Entwicklungsentscheidungen.
              </p>
            </article>
          </div>
        </div>
      </section>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default CMSProtocol;
