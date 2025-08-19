import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
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
  User,
  Hand,
} from "lucide-react";

// Import AI assistant avatar
import aiAssistantAvatar from "@/assets/ai-assistant-avatar.jpg";

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
  manual: "Manuals",
  datasheet: "Datasheets",
  whitepaper: "Whitepapers",
  api: "API Documentation",
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
    document.title = "Download Center | Image Engineering";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "All Downloads – Software, Manuals, API Documents and more.");
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
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="software">Software</TabsTrigger>
          <TabsTrigger value="firmware">Firmware</TabsTrigger>
          <TabsTrigger value="manual">Manuals</TabsTrigger>
          <TabsTrigger value="whitepaper">Whitepapers</TabsTrigger>
          <TabsTrigger value="api">API Docs</TabsTrigger>
          <TabsTrigger value="release">Release Notes</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} />
      </Tabs>

      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          {total} Results
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-[190px]" aria-label="Sortierung">
              <SelectValue placeholder="Sortierung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="az">A–Z</SelectItem>
              <SelectItem value="za">Z–A</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active chips */}
      {(q || cats.length || products.length || oses.length || langs.length) && (
        <div className="flex flex-wrap gap-2">
          {q && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{q}"
              <button aria-label="Remove search" onClick={() => removeChip("q", q)}>
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
          <Button variant="ghost" size="sm" onClick={clearAll} aria-label="Reset filters">
            Reset
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Main content wrapper with top margin to clear fixed navigation */}
      <div className="pt-[140px]">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="sticky top-[140px] z-40 bg-white py-6 border-b border-gray-200">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-600">Resources</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">Download Center</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </nav>

        <main className="relative z-0">
        {/* Hero */}
        <section className="bg-gray-50">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-medium mb-4 text-gray-900">
                Downloadcenter
              </h1>
              <p className="text-lg text-gray-600">
                Alle Ressourcen – Software, Handbücher, API‑Dokumente und mehr.
              </p>
            </div>
          </div>
        </section>

        {/* Content wrapper */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <aside className="w-full lg:w-80 shrink-0">
              <Card className="p-6 bg-white shadow-sm border border-gray-200">
                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label htmlFor="search" className="text-sm font-semibold mb-3 block text-gray-900">
                      Suche
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Nach Downloads suchen..."
                        value={q}
                        onChange={(e) => { setQ(e.target.value); setPage(1); }}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">
                      Kategorie
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(CATEGORY_LABEL).map(([cat, label]) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox
                            id={cat}
                            checked={cats.includes(cat as DownloadItem["category"])}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCats([...cats, cat as DownloadItem["category"]]);
                              } else {
                                setCats(cats.filter((c) => c !== cat));
                              }
                              setPage(1);
                            }}
                          />
                          <label htmlFor={cat} className="text-sm text-gray-700 cursor-pointer">
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Product Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">
                      Produkt
                    </h3>
                    <div className="space-y-2">
                      {allProducts.map((prod) => (
                        <div key={prod} className="flex items-center space-x-2">
                          <Checkbox
                            id={`product-${prod}`}
                            checked={products.includes(prod)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setProducts([...products, prod]);
                              } else {
                                setProducts(products.filter((p) => p !== prod));
                              }
                              setPage(1);
                            }}
                          />
                          <label htmlFor={`product-${prod}`} className="text-sm text-gray-700 cursor-pointer">
                            {prod}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OS Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">
                      Betriebssystem
                    </h3>
                    <div className="space-y-2">
                      {[
                        { key: "windows", label: "Windows" },
                        { key: "mac", label: "macOS" },
                        { key: "linux", label: "Linux" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`os-${key}`}
                            checked={oses.includes(key as "windows" | "mac" | "linux")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setOses([...oses, key as "windows" | "mac" | "linux"]);
                              } else {
                                setOses(oses.filter((o) => o !== key));
                              }
                              setPage(1);
                            }}
                          />
                          <label htmlFor={`os-${key}`} className="text-sm text-gray-700 cursor-pointer">
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">
                      Sprache
                    </h3>
                    <div className="space-y-2">
                      {[
                        { key: "de", label: "Deutsch" },
                        { key: "en", label: "English" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${key}`}
                            checked={langs.includes(key as "de" | "en")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setLangs([...langs, key as "de" | "en"]);
                              } else {
                                setLangs(langs.filter((l) => l !== key));
                              }
                              setPage(1);
                            }}
                          />
                          <label htmlFor={`lang-${key}`} className="text-sm text-gray-700 cursor-pointer">
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Period */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-900">
                      Zeitraum
                    </h3>
                    <Select value={period} onValueChange={(v) => { setPeriod(v); setPage(1); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Zeitraum wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">Keine Einschränkung</SelectItem>
                        <SelectItem value="6m">Letzte 6 Monate</SelectItem>
                        <SelectItem value="12m">Letztes Jahr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset Button */}
                  <Button variant="outline" className="w-full" onClick={clearAll}>
                    Alle Filter zurücksetzen
                  </Button>
                </div>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 md:border-l md:border-gray-200 md:pl-12">
              <div className="space-y-8">
                <ActiveFilters />
                
                {/* Results Grid */}
                {isLoading ? (
                  <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : pageItems.length === 0 ? (
                  <Card className="p-8 text-center bg-white border border-gray-100 shadow-sm">
                    <p className="text-lg text-gray-600">
                      Keine Treffer für die aktuelle Auswahl.
                    </p>
                    <Button variant="outline" className="mt-3" onClick={clearAll}>
                      Filter zurücksetzen
                    </Button>
                  </Card>
                ) : (
                  <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                    {pageItems.map((item) => (
                      <Card key={item.id} className="group p-6 hover:shadow-lg transition-all duration-200 bg-white border border-gray-100 shadow-sm">
                        <CardContent className="p-0">
                          <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg leading-snug text-gray-900">
                                  {item.title}
                                </h3>
                                <p className="text-sm mt-1 text-gray-600">
                                  {item.product} {item.version && `• v${item.version}`}
                                </p>
                              </div>
                              <div className="ml-3 flex items-center text-muted-foreground">
                                {FILETYPE_ICON[item.filetype]}
                              </div>
                            </div>

                            {/* Description */}
                            {item.description && (
                              <p className="text-sm leading-relaxed text-gray-600">
                                {item.description}
                              </p>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {CATEGORY_LABEL[item.category]}
                              </Badge>
                              {item.os?.map((o) => (
                                <OsChip key={o} os={o} />
                              ))}
                              {item.languages.map((lang) => (
                                <Badge key={lang} variant="outline" className="text-xs uppercase">
                                  {lang}
                                </Badge>
                              ))}
                            </div>

                            {/* Meta info */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{formatDate(item.date)}</span>
                              {item.size && <span>{item.size}</span>}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                className="flex-1 bg-[#3464e3] hover:bg-[#2851d4] text-white"
                                asChild
                              >
                                <a href={`${item.url}${cacheSuffix}`} target="_blank" rel="noopener noreferrer">
                                  <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
                                  Herunterladen
                                </a>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-[#7a933b] hover:text-[#6a7f35] hover:bg-[#7a933b]/10"
                                onClick={() => openDetails(item)}
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="fixed bottom-6 right-6 z-50">
          <div 
            onClick={() => setAiOpen(true)}
            className="group cursor-pointer bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-4 p-4 pr-6 hover-scale"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img 
                src={aiAssistantAvatar}
                alt="AI Assistant"
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            {/* Text - Hidden on mobile */}
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900">Need help?</div>
              <div className="text-xs text-gray-600">Ask our AI-Assistant</div>
            </div>
            
            {/* Chat Icon - Always visible */}
            <div className="flex-shrink-0 bg-primary text-white rounded-full p-2 group-hover:animate-pulse">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
        </div>
        </main>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!detailsItem} onOpenChange={() => setDetailsItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{detailsItem?.title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {detailsItem?.product} {detailsItem?.version && `• v${detailsItem.version}`}
            </DialogDescription>
          </DialogHeader>
          {detailsItem && (
            <div className="space-y-4">
              {detailsItem.description && (
                <p className="text-gray-700">{detailsItem.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-gray-900">Kategorie:</strong> {CATEGORY_LABEL[detailsItem.category]}
                </div>
                <div>
                  <strong className="text-gray-900">Datum:</strong> {formatDate(detailsItem.date)}
                </div>
                {detailsItem.size && (
                  <div>
                    <strong className="text-gray-900">Größe:</strong> {detailsItem.size}
                  </div>
                )}
                <div>
                  <strong className="text-gray-900">Sprachen:</strong> {detailsItem.languages.join(", ")}
                </div>
                {detailsItem.os && (
                  <div>
                    <strong className="text-gray-900">Betriebssystem:</strong> {detailsItem.os.join(", ")}
                  </div>
                )}
                {detailsItem.checksumSha256 && (
                  <div className="col-span-2">
                    <strong className="text-gray-900">SHA256:</strong> 
                    <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                      {detailsItem.checksumSha256}
                    </code>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  className="bg-[#3464e3] hover:bg-[#2851d4] text-white"
                  asChild
                >
                  <a href={`${detailsItem.url}${cacheSuffix}`} target="_blank" rel="noopener noreferrer">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Herunterladen
                  </a>
                </Button>
                <Button variant="outline" onClick={() => copyLink(detailsItem.url)}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Link kopieren
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">KI‑Assistent</DialogTitle>
            <DialogDescription className="text-gray-600">
              Lassen Sie sich bei der Suche nach Downloads helfen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Hier könnte ein intelligenter Chatbot bei der Suche nach den richtigen Downloads helfen.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Beliebte Downloads:</h4>
              <div className="space-y-2">
                {MOCK_ITEMS.slice(0, 3).map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className="justify-start w-full text-left"
                    onClick={() => setFiltersFromAI(item)}
                  >
                    {item.title}
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