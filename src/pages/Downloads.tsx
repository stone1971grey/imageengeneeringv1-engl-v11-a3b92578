import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RegularNavigation from "@/components/RegularNavigation";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Search,
  SlidersHorizontal,
  X,
  FileDown,
  Info,
  Link as LinkIcon,
  Monitor,
  Apple,
  Terminal as OsLinuxIcon,
  Download as DownloadIcon,
  MessageCircle,
} from "lucide-react";

// Data model
export type DownloadItem = {
  id: string;
  title: string;
  product: string; // e.g. "Arcturus"
  category:
    | "software"
    | "firmware"
    | "manual"
    | "datasheet"
    | "whitepaper"
    | "api"
    | "release";
  version?: string;
  date: string; // ISO string
  languages: ("de" | "en")[];
  os?: ("windows" | "mac" | "linux")[];
  size?: string; // "124 MB"
  filetype: "pdf" | "zip" | "exe" | "dmg" | "msi" | "other";
  description?: string;
  url: string;
  checksumSha256?: string;
};

// Mock data (can be replaced with API later)
const MOCK_ITEMS: DownloadItem[] = [
  {
    id: "1",
    title: "Vega Software Suite",
    product: "Vega",
    category: "software",
    version: "v2.4.1",
    date: "2025-05-30",
    languages: ["en", "de"],
    os: ["windows", "mac"],
    size: "124 MB",
    filetype: "exe",
    description: "Komplette Suite für Bildverarbeitung mit Vega.",
    url: "#",
    checksumSha256: "8e4fa1...a12",
  },
  {
    id: "2",
    title: "Arcturus Firmware",
    product: "Arcturus",
    category: "firmware",
    version: "v1.9.0",
    date: "2025-07-01",
    languages: ["en"],
    os: ["linux"],
    size: "36 MB",
    filetype: "zip",
    description: "Firmware-Update für Arcturus Kameraplattform.",
    url: "#",
    checksumSha256: "4b90aa...c77",
  },
  {
    id: "3",
    title: "iQ‑Analyzer‑X Handbuch",
    product: "iQ‑Analyzer‑X",
    category: "manual",
    version: "v1.4",
    date: "2025-03-18",
    languages: ["de", "en"],
    size: "18 MB",
    filetype: "pdf",
    description: "Benutzerhandbuch für iQ‑Analyzer‑X.",
    url: "#",
  },
  {
    id: "4",
    title: "TE294 Datenblatt",
    product: "TE294",
    category: "datasheet",
    date: "2024-12-10",
    languages: ["en"],
    size: "2.3 MB",
    filetype: "pdf",
    description: "Technische Daten und Spezifikationen",
    url: "#",
  },
  {
    id: "5",
    title: "Arcturus API Dokumentation",
    product: "Arcturus",
    category: "api",
    version: "2025.2",
    date: "2025-06-22",
    languages: ["en"],
    size: "—",
    filetype: "other",
    description: "REST & SDK Referenz.",
    url: "#",
  },
  {
    id: "6",
    title: "Vega Whitepaper: HDR Processing",
    product: "Vega",
    category: "whitepaper",
    date: "2025-02-08",
    languages: ["en"],
    size: "6.1 MB",
    filetype: "pdf",
    description: "Technische Grundlagen HDR‑Pipeline.",
    url: "#",
  },
  {
    id: "7",
    title: "Release Notes: Vega 2.4",
    product: "Vega",
    category: "release",
    version: "2.4",
    date: "2025-05-30",
    languages: ["en", "de"],
    size: "—",
    filetype: "other",
    description: "Änderungen, Fixes und bekannte Probleme.",
    url: "#",
  },
  {
    id: "8",
    title: "Arcturus Installer macOS",
    product: "Arcturus",
    category: "software",
    version: "v1.8.3",
    date: "2025-04-10",
    languages: ["en"],
    os: ["mac"],
    size: "112 MB",
    filetype: "dmg",
    description: "macOS Installer für Arcturus Tools.",
    url: "#",
  },
];

const CATEGORY_LABEL: Record<DownloadItem["category"], string> = {
  software: "Software",
  firmware: "Firmware",
  manual: "Handbücher",
  datasheet: "Datenblätter",
  whitepaper: "Whitepaper",
  api: "API‑Dokumentation",
  release: "Release Notes",
};

const FILETYPE_ICON: Record<DownloadItem["filetype"], React.ReactNode> = {
  pdf: <Info className="h-4 w-4" aria-hidden />,
  zip: <FileDown className="h-4 w-4" aria-hidden />,
  exe: <FileDown className="h-4 w-4" aria-hidden />,
  dmg: <FileDown className="h-4 w-4" aria-hidden />,
  msi: <FileDown className="h-4 w-4" aria-hidden />,
  other: <Info className="h-4 w-4" aria-hidden />,
};

function parseSizeMB(size?: string) {
  if (!size || size === "—") return 0;
  const m = size.match(/([0-9]+(?:\.[0-9]+)?)\s*MB/i);
  return m ? parseFloat(m[1]) : 0;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

const PAGE_SIZE = 9;

export default function Downloads() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State synced with URL - set "all" as default
  const [activeTab, setActiveTab] = useState<string>("all");
  const [q, setQ] = useState<string>(searchParams.get("q") || "");
  const [cats, setCats] = useState<DownloadItem["category"][]>([]);
  const [products, setProducts] = useState<string[]>(
    searchParams.get("product")?.split(",").filter(Boolean) || []
  );
  const [oses, setOses] = useState<("windows" | "mac" | "linux")[]>(
    (searchParams.get("os")?.split(",").filter(Boolean) as ("windows" | "mac" | "linux")[]) || []
  );
  const [langs, setLangs] = useState<("de" | "en")[]>(
    (searchParams.get("lang")?.split(",").filter(Boolean) as ("de" | "en")[]) || []
  );
  const [period, setPeriod] = useState<string>("latest");
  const [sort, setSort] = useState<string>("newest");
  const [page, setPage] = useState<number>(1);

  // Dialogs
  const [detailsItem, setDetailsItem] = useState<DownloadItem | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cacheSuffix = import.meta.env.DEV ? `?ts=${Date.now()}` : "";

  // Derived options
  const allProducts = useMemo(() => {
    const set = new Set(MOCK_ITEMS.map((i) => i.product));
    return Array.from(set);
  }, []);

  // SEO
  useEffect(() => {
    document.title = "Downloadcenter | Image Engineering";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Alle Downloads – Software, Handbücher, API‑Dokumente und mehr.");
  }, []);

  // Filtering
  const filtered = useMemo(() => {
    const withinPeriod = (d: string) => {
      const dt = new Date(d);
      const now = new Date();
      if (period === "latest") return true;
      if (period === "6m") {
        const past = new Date();
        past.setMonth(now.getMonth() - 6);
        return dt >= past;
      }
      if (period === "12m") {
        const past = new Date();
        past.setMonth(now.getMonth() - 12);
        return dt >= past;
      }
      return true;
    };

    return MOCK_ITEMS.filter((i) => {
      const qmatch = q
        ? (
            i.title + " " +
            i.product + " " +
            (i.version || "") + " " +
            CATEGORY_LABEL[i.category] + " " +
            (i.description || "")
          )
            .toLowerCase()
            .includes(q.toLowerCase())
        : true;
      const catOk = cats.length ? cats.includes(i.category) : true;
      const prodOk = products.length ? products.includes(i.product) : true;
      const osOk = oses.length ? (i.os || []).some((o) => oses.includes(o)) : true;
      const langOk = langs.length ? i.languages.some((l) => langs.includes(l)) : true;
      const perOk = withinPeriod(i.date);
      return qmatch && catOk && prodOk && osOk && langOk && perOk;
    }).sort((a, b) => {
      if (sort === "newest") return +new Date(b.date) - +new Date(a.date);
      if (sort === "oldest") return +new Date(a.date) - +new Date(b.date);
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      if (sort === "size") return parseSizeMB(b.size) - parseSizeMB(a.size);
      return 0;
    });
  }, [q, cats, products, oses, langs, period, sort]);

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(t);
  }, [q, cats, products, oses, langs, period, sort]);

  // Helpers
  const clearAll = () => {
    setQ("");
    setCats([]);
    setProducts([]);
    setOses([]);
    setLangs([]);
    setPeriod("latest");
    setSort("newest");
    setPage(1);
    setActiveTab("all");
  };

  const removeChip = (type: string, value: string) => {
    if (type === "q") setQ("");
    if (type === "cat") setCats((v) => v.filter((c) => c !== value));
    if (type === "product") setProducts((v) => v.filter((p) => p !== value));
    if (type === "os") setOses((v) => v.filter((o) => o !== value));
    if (type === "lang") setLangs((v) => v.filter((l) => l !== value));
    setPage(1);
  };

  const openDetails = (item: DownloadItem) => setDetailsItem(item);

  const copyLink = (url: string) => {
    const link = `${url}${cacheSuffix}`;
    navigator.clipboard.writeText(link).then(() =>
      toast({ title: "Link kopiert", description: "Der Download‑Link wurde in die Zwischenablage kopiert." })
    );
  };

  const setFiltersFromAI = (item: DownloadItem) => {
    setCats([item.category]);
    setProducts([item.product]);
    if (item.os?.length) setOses([item.os[0]] as any);
    setQ("");
    setAiOpen(false);
    setPage(1);
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "all") {
      setCats([]);
    } else {
      setCats([value as DownloadItem["category"]]);
    }
    setPage(1);
  };

  // OS chip component
  const OsChip = ({ os }: { os: "windows" | "mac" | "linux" }) => (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
      {os === "windows" && <Monitor className="h-3.5 w-3.5" aria-hidden />}
      {os === "mac" && <Apple className="h-3.5 w-3.5" aria-hidden />}
      {os === "linux" && <OsLinuxIcon className="h-3.5 w-3.5" aria-hidden />}
      <span className="capitalize">{os}</span>
    </span>
  );

  // Active Filters Component
  const ActiveFilters = () => (
    <>
      {/* Top tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">Alle</TabsTrigger>
          <TabsTrigger value="software">Software</TabsTrigger>
          <TabsTrigger value="firmware">Firmware</TabsTrigger>
          <TabsTrigger value="manual">Handbücher</TabsTrigger>
          <TabsTrigger value="whitepaper">Whitepaper</TabsTrigger>
          <TabsTrigger value="api">API‑Docs</TabsTrigger>
          <TabsTrigger value="release">Release Notes</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} />
      </Tabs>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm" style={{ color: 'hsl(var(--light-muted))' }}>
          {total} Ergebnisse
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-[190px]" aria-label="Sortierung">
              <SelectValue placeholder="Sortierung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste zuerst</SelectItem>
              <SelectItem value="oldest">Älteste zuerst</SelectItem>
              <SelectItem value="az">A–Z</SelectItem>
              <SelectItem value="za">Z–A</SelectItem>
              <SelectItem value="size">Größe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active chips */}
      {(q || cats.length || products.length || oses.length || langs.length) && (
        <div className="flex flex-wrap gap-2">
          {q && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Suche: "{q}"
              <button aria-label="Suche entfernen" onClick={() => removeChip("q", q)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          )}
          {cats.map((c) => (
            <Badge key={c} variant="secondary" className="flex items-center gap-1">
              {CATEGORY_LABEL[c]}
              <button aria-label={`${CATEGORY_LABEL[c]} entfernen`} onClick={() => removeChip("cat", c)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          {products.map((p) => (
            <Badge key={p} variant="secondary" className="flex items-center gap-1">
              {p}
              <button aria-label={`${p} entfernen`} onClick={() => removeChip("product", p)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          {oses.map((o) => (
            <Badge key={o} variant="secondary" className="flex items-center gap-1 capitalize">
              {o}
              <button aria-label={`${o} entfernen`} onClick={() => removeChip("os", o)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          {langs.map((l) => (
            <Badge key={l} variant="secondary" className="flex items-center gap-1 uppercase">
              {l}
              <button aria-label={`${l} entfernen`} onClick={() => removeChip("lang", l)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAll} aria-label="Filter zurücksetzen">
            Zurücksetzen
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--light-background))' }}>
      <RegularNavigation />

      <header className="border-b" style={{ borderColor: 'hsl(var(--light-border))' }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
          <Breadcrumb aria-label="Breadcrumb">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="hover:text-primary transition-colors">Startseite</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage style={{ color: 'hsl(var(--light-foreground))' }}>Ressourcen</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage style={{ color: 'hsl(var(--light-foreground))' }}>Downloadcenter</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="relative z-0">
        {/* Hero */}
        <section className="border-b" style={{ borderColor: 'hsl(var(--light-border))' }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: 'hsl(var(--light-foreground))' }}>Downloadcenter</h1>
              <p className="mt-3" style={{ color: 'hsl(var(--light-muted))' }}>
                Finden Sie Software, Handbücher, Datenblätter, API‑Dokumente und Release Notes – gefiltert nach Produkt, Kategorie, Version und Betriebssystem.
              </p>
            </div>
            <div className="hidden md:block">
              <Button variant="default" className="bg-gradient-primary hover:shadow-glow transition-all duration-300" onClick={() => setAiOpen(true)} aria-label="KI‑Assistenz öffnen">
                <DownloadIcon className="h-4 w-4 mr-2" /> KI‑Assistenz
              </Button>
            </div>
          </div>
        </section>

        {/* Layout */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 md:sticky md:top-20 self-start space-y-6">
            {/* Mobile trigger */}
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-full" aria-label="Filter öffnen">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="p-6">
                  <div style={{ backgroundColor: 'hsl(var(--scandi-white))', borderColor: 'hsl(var(--light-border))' }} className="rounded-xl border p-5 shadow-soft">
                    <Filters
                      q={q}
                      setQ={setQ}
                      cats={cats}
                      setCats={setCats}
                      products={products}
                      setProducts={setProducts}
                      oses={oses}
                      setOses={setOses}
                      langs={langs}
                      setLangs={setLangs}
                      period={period}
                      setPeriod={setPeriod}
                      allProducts={allProducts}
                      clearAll={clearAll}
                      hitCount={total}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Desktop filters */}
            <div className="hidden md:block">
              <Card style={{ backgroundColor: 'hsl(var(--scandi-white))', borderColor: 'hsl(var(--light-border))' }} className="p-5 shadow-soft">
                <Filters
                  q={q}
                  setQ={setQ}
                  cats={cats}
                  setCats={setCats}
                  products={products}
                  setProducts={setProducts}
                  oses={oses}
                  setOses={setOses}
                  langs={langs}
                  setLangs={setLangs}
                  period={period}
                  setPeriod={setPeriod}
                  allProducts={allProducts}
                  clearAll={clearAll}
                  hitCount={total}
                />
              </Card>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6 md:border-l md:pl-6" style={{ borderColor: 'hsl(var(--light-border))' }}>
            <div className="flex items-center justify-between gap-4 mt-6 md:mt-0">
              <div className="flex-1">
                <ActiveFilters />
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} style={{ backgroundColor: 'hsl(var(--scandi-white))', borderColor: 'hsl(var(--light-border))' }} className="shadow-soft">
                    <CardContent className="p-5">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : total === 0 ? (
              <div className="text-center py-12">
                <div style={{ backgroundColor: 'hsl(var(--scandi-white))', borderColor: 'hsl(var(--light-border))' }} className="rounded-xl border p-8 shadow-soft">
                  <p style={{ color: 'hsl(var(--light-muted))' }} className="mb-4">Keine Treffer für die aktuelle Auswahl.</p>
                  <Button onClick={clearAll} variant="outline">
                    Filter zurücksetzen
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Results Grid - 2 columns only */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  {pageItems.map((item) => (
                    <Card key={item.id} style={{ backgroundColor: 'hsl(var(--scandi-white))', borderColor: 'hsl(var(--light-border))', color: 'hsl(var(--light-foreground))' }} className="rounded-xl shadow-soft p-5 hover:shadow-gentle transition-shadow">
                      <CardHeader className="py-4 px-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold line-clamp-2" style={{ color: 'hsl(var(--light-foreground))' }}>
                              {item.title}
                            </CardTitle>
                            {item.description && (
                              <p className="text-sm mt-2 line-clamp-2" style={{ color: 'hsl(var(--light-muted))' }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div style={{ color: 'hsl(var(--light-muted))' }}>
                            {FILETYPE_ICON[item.filetype]}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-0 pb-0 space-y-3">
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: 'hsl(var(--light-muted))' }}>
                          <Badge variant="secondary" className="text-xs px-3 py-1 font-medium">
                            {CATEGORY_LABEL[item.category]}
                          </Badge>
                          <span>•</span>
                          <span>{item.product}</span>
                          {item.version && (
                            <>
                              <span>•</span>
                              <span>v{item.version}</span>
                            </>
                          )}
                        </div>

                        {/* OS and size */}
                        {(item.os?.length || item.size) && (
                          <div className="flex items-center gap-3 text-sm">
                            {item.os?.map((os) => (
                              <OsChip key={os} os={os} />
                            ))}
                            {item.size && item.size !== "—" && (
                              <span style={{ color: 'hsl(var(--light-muted))' }}>{item.size}</span>
                            )}
                          </div>
                        )}

                        {/* Date and languages */}
                        <div className="flex items-center gap-3 text-sm" style={{ color: 'hsl(var(--light-muted))' }}>
                          <span>{formatDate(item.date)}</span>
                          {item.languages.length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {item.languages.map((l) => l.toUpperCase()).join(", ")}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300">
                            <a
                              href={`${item.url}${cacheSuffix}`}
                              className="flex items-center gap-2 text-white no-underline"
                            >
                              <FileDown className="h-4 w-4" />
                              Herunterladen
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openDetails(item)} className="hover:bg-accent/50 transition-colors">
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {total > PAGE_SIZE && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm" style={{ color: 'hsl(var(--light-muted))' }}>
                      Seite {page} von {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Zurück
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Weiter
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t" style={{ borderColor: 'hsl(var(--light-border))', backgroundColor: 'hsl(var(--scandi-white))' }}>
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 text-center">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'hsl(var(--light-foreground))' }}>Mehr Downloads im Downloadcenter</h2>
            <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'hsl(var(--light-muted))' }}>
              Vollständige Software‑Pakete, detaillierte Handbücher und API‑Dokumentationen für alle Produkte.
            </p>
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <LinkIcon className="mr-2 h-5 w-5" />
              Zum Downloadcenter
            </Button>
          </div>
        </section>
      </main>

      {/* AI Assistant - Chat Window Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-glow transition-all duration-300"
            onClick={() => setAiOpen(true)}
            aria-label="KI‑Assistenz öffnen"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!detailsItem} onOpenChange={() => setDetailsItem(null)}>
        <DialogContent style={{ backgroundColor: 'hsl(var(--scandi-white))', color: 'hsl(var(--light-foreground))' }} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailsItem?.title}</DialogTitle>
            <DialogDescription style={{ color: 'hsl(var(--light-muted))' }}>Download Details</DialogDescription>
          </DialogHeader>
          {detailsItem && (
            <div className="space-y-3 text-sm">
              <div>
                <strong>Produkt:</strong> {detailsItem.product}
              </div>
              <div>
                <strong>Kategorie:</strong> {CATEGORY_LABEL[detailsItem.category]}
              </div>
              {detailsItem.version && (
                <div>
                  <strong>Version:</strong> {detailsItem.version}
                </div>
              )}
              <div>
                <strong>Datum:</strong> {formatDate(detailsItem.date)}
              </div>
              {detailsItem.size && (
                <div>
                  <strong>Größe:</strong> {detailsItem.size}
                </div>
              )}
              <div>
                <strong>Sprachen:</strong> {detailsItem.languages.map((l) => l.toUpperCase()).join(", ")}
              </div>
              {detailsItem.os && (
                <div>
                  <strong>Betriebssysteme:</strong> {detailsItem.os.map((o) => o.charAt(0).toUpperCase() + o.slice(1)).join(", ")}
                </div>
              )}
              {detailsItem.description && (
                <div>
                  <strong>Beschreibung:</strong> {detailsItem.description}
                </div>
              )}
              {detailsItem.checksumSha256 && (
                <div className="text-xs" style={{ color: 'hsl(var(--light-muted))' }}>
                  <strong>SHA256:</strong> {detailsItem.checksumSha256}
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button size="sm" asChild className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  <a href={`${detailsItem.url}${cacheSuffix}`}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Herunterladen
                  </a>
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyLink(detailsItem.url)} className="hover:bg-accent/50 transition-colors">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link kopieren
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent style={{ backgroundColor: 'hsl(var(--scandi-white))', color: 'hsl(var(--light-foreground))' }} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>KI‑Assistent</DialogTitle>
            <DialogDescription style={{ color: 'hsl(var(--light-muted))' }}>Lassen Sie sich bei der Suche helfen</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'hsl(var(--light-muted))' }}>
              Der KI‑Assistent kann Ihnen helfen, die passenden Downloads zu finden. Beschreiben Sie, was Sie suchen.
            </p>
            <div style={{ backgroundColor: 'hsl(var(--light-background))' }} className="p-4 rounded-lg">
              <p className="text-sm mb-3 font-medium" style={{ color: 'hsl(var(--light-foreground))' }}>Beispiele für häufige Anfragen:</p>
              <div className="space-y-2">
                {MOCK_ITEMS.slice(0, 3).map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start w-full h-auto p-2 hover:bg-accent/50 transition-colors"
                    onClick={() => setFiltersFromAI(item)}
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs" style={{ color: 'hsl(var(--light-muted))' }}>
                        {item.product} • {CATEGORY_LABEL[item.category]}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// Filters component (shared between desktop and drawer)
function Filters(props: {
  q: string;
  setQ: (v: string) => void;
  cats: DownloadItem["category"][];
  setCats: (v: DownloadItem["category"][]) => void;
  products: string[];
  setProducts: (v: string[]) => void;
  oses: ("windows" | "mac" | "linux")[];
  setOses: (v: ("windows" | "mac" | "linux")[]) => void;
  langs: ("de" | "en")[];
  setLangs: (v: ("de" | "en")[]) => void;
  period: string;
  setPeriod: (v: string) => void;
  allProducts: string[];
  clearAll: () => void;
  hitCount: number;
}) {
  const {
    q,
    setQ,
    cats,
    setCats,
    products,
    setProducts,
    oses,
    setOses,
    langs,
    setLangs,
    period,
    setPeriod,
    allProducts,
    clearAll,
    hitCount,
  } = props;

  const toggleInArray = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  return (
    <div className="space-y-6" aria-label="Filter">
      {/* Suche */}
      <div>
        <label className="mb-3 block text-base font-semibold" style={{ color: 'hsl(var(--light-foreground))' }}>Suche</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suche nach Name, Produkt, Version, Dateityp…"
            className="pl-9"
            aria-label="Volltextsuche"
          />
        </div>
      </div>

      {/* Kategorien */}
      <div>
        <div className="mb-3 text-base font-semibold" style={{ color: 'hsl(var(--light-foreground))' }}>Kategorien</div>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(CATEGORY_LABEL) as DownloadItem["category"][]).map((key) => (
            <label key={key} className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60">
              <Checkbox
                checked={cats.includes(key)}
                onCheckedChange={() => setCats(toggleInArray(cats, key))}
                aria-label={CATEGORY_LABEL[key]}
              />
              <span className="text-[15px] leading-5">{CATEGORY_LABEL[key]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Produkte */}
      <div>
        <div className="mb-3 text-base font-semibold" style={{ color: 'hsl(var(--light-foreground))' }}>Produkte</div>
        <div className="space-y-2">
          {allProducts.map((p) => (
            <label key={p} className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60">
              <Checkbox
                checked={products.includes(p)}
                onCheckedChange={() => setProducts(toggleInArray(products, p))}
                aria-label={p}
              />
              <span className="text-[15px] leading-5">{p}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Betriebssystem */}
      <div>
        <div className="mb-3 text-base font-semibold" style={{ color: 'hsl(var(--light-foreground))' }}>Betriebssystem</div>
        <div className="flex flex-wrap gap-2">
          {["windows", "mac", "linux"].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOses(toggleInArray(oses, o as any))}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                oses.includes(o as any)
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              aria-pressed={oses.includes(o as any)}
              aria-label={`OS ${o}`}
            >
              {o === "windows" && <Monitor className="h-4 w-4" />}
              {o === "mac" && <Apple className="h-4 w-4" />}
              {o === "linux" && <OsLinuxIcon className="h-4 w-4" />}
              <span className="capitalize">{o}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sprachen */}
      <div>
        <div className="mb-3 text-base font-semibold" style={{ color: 'hsl(var(--light-foreground))' }}>Sprachen</div>
        <div className="space-y-2">
          {[
            { v: "de", l: "Deutsch" },
            { v: "en", l: "Englisch" },
          ].map((lang) => (
            <label key={lang.v} className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted/60">
              <Checkbox
                checked={langs.includes(lang.v as any)}
                onCheckedChange={() => setLangs(toggleInArray(langs, lang.v as any))}
                aria-label={lang.l}
              />
              <span className="text-[15px] leading-5">{lang.l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Zeitraum */}
      <div>
        <div className="mb-3 text-base font-semibold" style={{ color: 'hsl(var(--light-foreground))' }}>Version/Zeitraum</div>
        <Select value={period} onValueChange={(v) => setPeriod(v)}>
          <SelectTrigger aria-label="Zeitraum">
            <SelectValue placeholder="Neueste" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Neueste</SelectItem>
            <SelectItem value="6m">Letzte 6 Monate</SelectItem>
            <SelectItem value="12m">Letzte 12 Monate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={clearAll} aria-label="Filter zurücksetzen">
          Filter zurücksetzen
        </Button>
        <Badge variant="secondary">{hitCount} Treffer</Badge>
      </div>
    </div>
  );
}