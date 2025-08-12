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

  // State synced with URL
  const [q, setQ] = useState<string>(searchParams.get("q") || "");
  const [cats, setCats] = useState<DownloadItem["category"][]>(
    (searchParams.get("cat")?.split(",").filter(Boolean) as DownloadItem["category"][]) || []
  );
  const [products, setProducts] = useState<string[]>(
    searchParams.get("product")?.split(",").filter(Boolean) || []
  );
  const [oses, setOses] = useState<("windows" | "mac" | "linux")[]>(
    (searchParams.get("os")?.split(",").filter(Boolean) as ("windows" | "mac" | "linux")[]) || []
  );
  const [langs, setLangs] = useState<("de" | "en")[]>(
    (searchParams.get("lang")?.split(",").filter(Boolean) as ("de" | "en")[]) || []
  );
  const [period, setPeriod] = useState<string>(searchParams.get("period") || "latest");
  const [sort, setSort] = useState<string>(searchParams.get("sort") || "newest");
  const [page, setPage] = useState<number>(Number(searchParams.get("page") || 1));

  // Dialogs
  const [detailsItem, setDetailsItem] = useState<DownloadItem | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  // Derived options
  const allProducts = useMemo(() => {
    const set = new Set(MOCK_ITEMS.map((i) => i.product));
    return Array.from(set);
  }, []);

  // Sync URL on change
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (cats.length) sp.set("cat", cats.join(","));
    if (products.length) sp.set("product", products.join(","));
    if (oses.length) sp.set("os", oses.join(","));
    if (langs.length) sp.set("lang", langs.join(","));
    if (sort && sort !== "newest") sp.set("sort", sort);
    if (period && period !== "latest") sp.set("period", period);
    if (page !== 1) sp.set("page", String(page));
    setSearchParams(sp, { replace: true });
  }, [q, cats, products, oses, langs, sort, period, page, setSearchParams]);

  // SEO
  useEffect(() => {
    document.title = "Downloadcenter | Image Engineering";
    const metaDesc = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    if (metaDesc) metaDesc.setAttribute("content", "Alle Downloads – Software, Handbücher, API‑Dokumente und mehr.");
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Alle Downloads – Software, Handbücher, API‑Dokumente und mehr.";
      document.head.appendChild(m);
    }

    if (!canonical) {
      const linkEl = document.createElement("link");
      linkEl.setAttribute("rel", "canonical");
      linkEl.setAttribute("href", window.location.href);
      document.head.appendChild(linkEl);
    }
  }, []);

  // JSON-LD (basic, for first few items)
  useEffect(() => {
    const scriptId = "downloads-jsonld";
    const el = document.getElementById(scriptId);
    if (el) el.remove();

    const items = filtered.slice(0, 3).map((i) => {
      if (i.category === "software" || i.category === "firmware") {
        return {
          "@type": "SoftwareApplication",
          name: i.title,
          applicationCategory: i.category,
          operatingSystem: (i.os || []).join(", ") || "—",
          softwareVersion: i.version || "",
          url: i.url,
        };
      }
      return {
        "@type": "TechArticle",
        headline: i.title,
        datePublished: i.date,
        inLanguage: i.languages.join(","),
        url: i.url,
      };
    });

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items,
    });
    document.head.appendChild(script);
  });

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
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

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
    navigator.clipboard.writeText(url).then(() =>
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

  // OS chip component
  const OsChip = ({ os }: { os: "windows" | "mac" | "linux" }) => (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
      {os === "windows" && <Monitor className="h-3.5 w-3.5" aria-hidden />}
      {os === "mac" && <Apple className="h-3.5 w-3.5" aria-hidden />}
      {os === "linux" && <OsLinuxIcon className="h-3.5 w-3.5" aria-hidden />}
      <span className="capitalize">{os}</span>
    </span>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RegularNavigation />

      <header className="border-b">
        <div className="container mx-auto px-6 py-6">
          <Breadcrumb aria-label="Breadcrumb">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Startseite</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Ressourcen</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Downloadcenter</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b">
          <div className="container mx-auto px-6 py-10 flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Downloadcenter</h1>
              <p className="mt-3 text-muted-foreground">
                Finden Sie Software, Handbücher, Datenblätter, API‑Dokumente und Release Notes – gefiltert nach Produkt, Kategorie, Version und Betriebssystem.
              </p>
            </div>
            <div className="hidden md:block">
              <Button variant="secondary" onClick={() => setAiOpen(true)} aria-label="KI‑Assistenz öffnen">
                <DownloadIcon className="h-4 w-4 mr-2" /> KI‑Assistenz
              </Button>
            </div>
          </div>
        </section>

        {/* Layout */}
        <section className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
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
                </DrawerContent>
              </Drawer>
            </div>

            {/* Desktop filters */}
            <div className="hidden md:block">
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
          </aside>

          {/* Content */}
          <section className="md:col-span-8 lg:col-span-9 space-y-5">
            {/* Top tabs */}
            <Tabs
              value={cats.length === 1 ? cats[0] : "all"}
              onValueChange={(v) => setCats(v === "all" ? [] : ([v] as any))}
            >
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="all">Alle</TabsTrigger>
                <TabsTrigger value="software">Software</TabsTrigger>
                <TabsTrigger value="firmware">Firmware</TabsTrigger>
                <TabsTrigger value="manual">Handbücher</TabsTrigger>
                <TabsTrigger value="whitepaper">Whitepaper</TabsTrigger>
                <TabsTrigger value="api">API‑Docs</TabsTrigger>
                <TabsTrigger value="release">Release Notes</TabsTrigger>
              </TabsList>
              <TabsContent value={cats.length === 1 ? cats[0] : "all"} />
            </Tabs>

            {/* Header row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
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
                    Suche: “{q}”
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

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pageItems.map((item) => (
                <Card key={item.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-semibold leading-6">
                          {item.title}
                        </CardTitle>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary">{item.product}</Badge>
                          <Badge>{CATEGORY_LABEL[item.category]}</Badge>
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        {FILETYPE_ICON[item.filetype]}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-3">
                    <p className="line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {item.version && <span>Version {item.version}</span>}
                      <span>•</span>
                      <span>{formatDate(item.date)}</span>
                      {item.os && item.os.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {item.os.map((o) => (
                              <OsChip key={o} os={o} />
                            ))}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>Sprache: {item.languages.map((l) => l.toUpperCase()).join(", ")}</span>
                      {item.size && (
                        <>
                          <span>•</span>
                          <span>{item.size}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="uppercase">{item.filetype}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button size="sm" onClick={() => openDetails(item)} variant="outline">
                        <Info className="h-4 w-4 mr-2" /> Details
                      </Button>
                      <Button size="sm" onClick={() => copyLink(item.url)} variant="ghost">
                        <LinkIcon className="h-4 w-4 mr-2" /> Link kopieren
                      </Button>
                      <Button size="sm" asChild>
                        <a href={item.url} aria-label={`Download ${item.title}`}>
                          <FileDown className="h-4 w-4 mr-2" /> Download
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty state */}
            {total === 0 && (
              <div className="text-center py-14">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Info className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Keine Downloads gefunden</h3>
                <p className="text-muted-foreground mt-1">Passen Sie Ihre Filter an oder starten Sie die KI‑Assistenz.</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={clearAll}>Filter zurücksetzen</Button>
                  <Button onClick={() => setAiOpen(true)}>KI‑Assistenz öffnen</Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">
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
          </section>
        </section>
      </main>

      {/* Details Modal */}
      <Dialog open={!!detailsItem} onOpenChange={(o) => !o && setDetailsItem(null)}>
        <DialogContent aria-labelledby="details-title">
          {detailsItem && (
            <div>
              <DialogHeader>
                <DialogTitle id="details-title">{detailsItem.title}</DialogTitle>
                <DialogDescription>
                  Produkt: {detailsItem.product} • {CATEGORY_LABEL[detailsItem.category]}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3 text-sm">
                {detailsItem.description && <p>{detailsItem.description}</p>}
                {detailsItem.category === "release" && (
                  <div className="space-y-1">
                    <div className="font-medium">Changelog / Release Notes</div>
                    <p>• Verbesserte Stabilität und Performance.\
• Kleinere Bugfixes.</p>
                  </div>
                )}
                {detailsItem.checksumSha256 && (
                  <div className="space-y-1">
                    <div className="font-medium">SHA‑256</div>
                    <code className="block rounded bg-muted p-2 text-xs break-all">
                      {detailsItem.checksumSha256}
                    </code>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(detailsItem.checksumSha256!)}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" /> Checksum kopieren
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild>
                    <a href={detailsItem.url} aria-label={`Download ${detailsItem.title}`}>
                      <FileDown className="h-4 w-4 mr-2" /> Download
                    </a>
                  </Button>
                  <Button variant="outline">Zur Produktseite</Button>
                  <Button variant="outline">Zur Dokumentation</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KI Assistant Floating Button */}
      <Button
        className="fixed bottom-5 right-5 shadow-lg"
        onClick={() => setAiOpen(true)}
        aria-label="KI‑Assistenz öffnen"
      >
        <DownloadIcon className="h-4 w-4 mr-2" /> KI‑Assistenz
      </Button>

      {/* KI Assistant Dialog */}
      <AiAssistantDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        items={MOCK_ITEMS}
        onPick={setFiltersFromAI}
      />

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
        <label className="mb-2 block text-sm font-medium">Suche</label>
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
        <div className="mb-2 text-sm font-medium">Kategorien</div>
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
        <div className="mb-2 text-sm font-medium">Produkte</div>
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
        <div className="mb-2 text-sm font-medium">Betriebssystem</div>
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
        <div className="mb-2 text-sm font-medium">Sprachen</div>
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
        <div className="mb-2 text-sm font-medium">Version/Zeitraum</div>
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

// AI Assistant Dialog (mocked)
function AiAssistantDialog({
  open,
  onOpenChange,
  items,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: DownloadItem[];
  onPick: (item: DownloadItem) => void;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; results?: DownloadItem[] }[]>([
    {
      role: "assistant",
      content:
        "Ich helfe beim Finden des richtigen Downloads. Beschreiben Sie, was Sie brauchen (Produkt/OS/Version).",
    },
  ]);
  const [input, setInput] = useState("");

  const submit = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: "user" as const, content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    // Fake response using simple filter
    const term = text.toLowerCase();
    const results = items.filter(
      (i) =>
        i.title.toLowerCase().includes(term) ||
        i.product.toLowerCase().includes(term) ||
        (i.version || "").toLowerCase().includes(term)
    );
    const reply = {
      role: "assistant" as const,
      content: results.length
        ? `Ich habe ${results.length} passende Downloads gefunden:`
        : "Ich habe nichts Passendes gefunden. Versuchen Sie andere Begriffe (z. B. Produkt oder OS).",
      results: results.slice(0, 3),
    };
    setTimeout(() => setMessages((m) => [...m, reply]), 400);
  };

  const suggestions = ["Arcturus", "Vega", "iQ‑Analyzer‑X", "TE294"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" aria-labelledby="ai-title">
        <DialogHeader>
          <DialogTitle id="ai-title">KI‑Assistenz</DialogTitle>
          <DialogDescription>
            Ich helfe beim Finden des richtigen Downloads. Beschreiben Sie, was Sie brauchen (Produkt/OS/Version).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => submit(s)}>
              {s}
            </Button>
          ))}
        </div>

        <div className="mt-4 h-64 overflow-auto rounded border p-3 space-y-3 bg-background">
          {messages.map((m, idx) => (
            <div key={idx} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : ""}`}>
              <div
                className={`inline-block rounded-lg px-3 py-2 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {m.content}
              </div>
              {m.results && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {m.results.map((r) => (
                    <Card key={r.id} className="border-dashed">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium line-clamp-1">{r.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 text-xs text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-2">
                          {r.version && <span>v{r.version}</span>}
                          {r.os && r.os.length > 0 && (
                            <span className="flex items-center gap-1">
                              {r.os.map((o) => (
                                <span key={o} className="capitalize">{o}</span>
                              ))}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <Button asChild size="sm">
                            <a href={r.url}>
                              <FileDown className="h-3.5 w-3.5 mr-1" /> Download
                            </a>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onPick(r)}>
                            Im Downloadcenter anzeigen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          className="mt-4 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="z. B. ‘Vega Software für Windows, neueste Version’"
            aria-label="KI Eingabe"
          />
          <Button type="submit">Senden</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
