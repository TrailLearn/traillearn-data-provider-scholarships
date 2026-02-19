"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ExternalLink,
  GraduationCap,
  Calendar,
  Globe2,
  Link2,
} from "lucide-react";
import { TrustBadge } from "@/components/trust-badge";
import type { Scholarship } from "@/lib/types";

const RESOURCE_LINKS = [
  {
    id: "ajinomoto",
    label: "Bourse Ajinomoto",
    description: "Alimentation, nutrition, santé.",
    url: "https://ajischolarship.com/",
  },
  {
    id: "isdb",
    label: "Bourse Banque Islamique de Développement (IsDB)",
    description: "Sciences de la vie et de la santé.",
    url: "https://urlr.me/bVynrq",
  },
  {
    id: "cbh-graduate-school",
    label: "Bourse CBH Graduate School",
    description: "Chimie, biologie, santé.",
    url: "https://grad-chembiohealth.univ-grenoble-alpes.fr/",
  },
  {
    id: "eiffel-biology-health",
    label: "Bourse Eiffel",
    description: "Biologie, santé et filières connexes (liste sur LeBoursier).",
    url: "https://leboursier.net",
  },
  {
    id: "esop-eth",
    label: "Bourse ESOP — ETH Zurich",
    description: "Pharmacie, sciences pharmaceutiques.",
    url: "https://urlr.me/7pheMc",
  },
  {
    id: "idil",
    label: "Bourse IDIL",
    description:
      "Chimie pour la santé et la nutrition, modélisation biologique, capteurs pour la santé, sciences pour la santé humaine.",
    url: "https://urlr.me/czRAZG",
  },
  {
    id: "kau-biomedical",
    label: "Bourse King Abdulaziz University",
    description: "Génie biomédical.",
    url: "https://kau.edu.sa/en/page/scholarship",
  },
  {
    id: "mopga",
    label: "Bourse MOPGA",
    description:
      "Santé humaine, animale et environnementale (One Health) – Campus France.",
    url: "https://www.campusfrance.org/fr/mopga-2026",
  },
  {
    id: "panafrican-paulesi",
    label: "Bourse Pan African University (PAULESI)",
    description:
      "Santé de la reproduction, vaccins, médecine aviaire, plantes médicinales.",
    url: "https://www.au-pau.org/submission/fr/",
  },
  {
    id: "sophie-germain",
    label: "Bourse Sophie Germain",
    description: "Data science appliquée à la santé.",
    url: "https://urlr.me/TjCqYp",
  },
  {
    id: "tiger-amu",
    label: "Bourse TIGER — Aix-Marseille Université",
    description: "Santé publique (bourses PMI d’Aix-Marseille Université).",
    url: "https://univ-amu.fr/fr/public/bourses-pmi-daix-marseille-universite",
  },
  {
    id: "turkiye-burslari",
    label: "Bourse Turkiye Burslari",
    description: "Programmes de master Turquie (incluant santé et sciences).",
    url: "https://shorturl.at/gIL7f",
  },
  {
    id: "uemoa",
    label: "Bourse UEMOA",
    description: "Élevage et santé animale.",
    url: "https://leboursier.net/bourse-uemoa/",
  },
  {
    id: "unige",
    label: "Bourse Université de Genève",
    description: "Excellence master fellowships en pharmacie.",
    url: "https://www.unige.ch/.../masters/excellencemasterfellowships",
  },
  {
    id: "ares",
    label: "Bourses ARES (Belgique)",
    description:
      "Santé publique, risques sanitaires, politiques et systèmes de santé, qualité des médicaments.",
    url: "https://www.ares-ac.be/fr/bourses",
  },
  {
    id: "graduate-lille",
    label: "Graduate Programmes Lille",
    description: "Bourses en Biologie-Santé.",
    url: "https://graduate-programmes.univ-lille.fr/bourses...",
  },
  {
    id: "jj-wbgsp",
    label: "Joint Japan / World Bank Graduate Scholarship",
    description: "Santé, nutrition, population.",
    url: "https://worldbank.org/en/programs/scholarships/jj-wbgsp",
  },
  {
    id: "labex-gral",
    label: "Bourse Labex GRAL",
    description: "Health Engineering.",
    url: "https://shorturl.at/4Url7",
  },
  {
    id: "msca",
    label: "Marie Skłodowska-Curie Actions",
    description: "Bourses de recherche en sciences de la santé.",
    url: "https://marie-sklodowska-curie-actions.ec.europa.eu/",
  },
  {
    id: "smarts-up",
    label: "Bourse SMARTS-UP — Université Paris Cité",
    description: "Santé, sciences de la vie, sciences du médicament.",
    url: "https://tinyurl.com/48vzdtne",
  },
  {
    id: "mcf-aub",
    label: "Mastercard — American University of Beirut",
    description: "Bourses en sciences de la santé.",
    url: "https://www.aub.edu.lb/mcf/Pages/default.aspx",
  },
  {
    id: "mcf-knust",
    label: "Mastercard — KNUST",
    description: "Sciences de la santé.",
    url: "https://mcf.knust.edu.gh/scholarship-application/",
  },
  {
    id: "mcf-makerere",
    label: "Mastercard — Université de Makerere",
    description: "Santé publique.",
    url: "https://mastercardfoundation.mak.ac.ug/",
  },
  {
    id: "mcf-rwanda",
    label: "Mastercard — Université du Rwanda",
    description: "Santé publique.",
    url: "https://mcfsp.ur.ac.rw/",
  },
  {
    id: "mcf-gaston-berger",
    label: "Mastercard — Université Gaston Berger",
    description: "Programmes en santé.",
    url: "https://urlr.me/Xpb9Tc",
  },
  {
    id: "mcf-mcgill",
    label: "Mastercard — Université McGill",
    description:
      "Nutrition humaine, sécurité alimentaire, santé publique et domaines connexes.",
    url: "https://urlr.me/2TWdes",
  },
  {
    id: "mcf-edinburgh",
    label: "Mastercard — University of Edinburgh",
    description: "Santé mondiale.",
    url: "https://global.ed.ac.uk/mastercard-foundation",
  },
  {
    id: "mcf-ughe",
    label: "Mastercard — University of Global Health Equity",
    description:
      "Santé publique, professions de santé, éthique médicale.",
    url: "https://tinyurl.com/5n7n7pe3",
  },
  {
    id: "mcf-oxford",
    label: "Mastercard — University of Oxford",
    description: "Programmes de master en santé.",
    url: "https://tinyurl.com/4npwjj5d",
  },
  {
    id: "mcf-toronto",
    label: "Mastercard — University of Toronto",
    description:
      "Administration de la santé, santé au travail et environnementale, ingénierie biomédicale, biotechnologie, informatique de la santé, etc.",
    url: "https://tinyurl.com/yue5p2ws",
  },
  {
    id: "mcf-usiu",
    label: "Mastercard — USIU-Africa",
    description: "Épidémiologie, biostatistiques, pharmacie.",
    url: "https://usiu.ac.ke/mastercard-foundation-scholars-program/",
  },
];

const HEALTH_PRESETS = [
  { value: 0, label: "Toutes" },
  { value: 50, label: "Score ≥ 50" },
  { value: 70, label: "Score ≥ 70" },
  { value: 85, label: "Score ≥ 85" },
];

export default function ScholarshipsCataloguePage() {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [minHealthScore, setMinHealthScore] = useState<number>(0);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!supabaseUrl || !anonKey) {
      setError("Configuration Supabase manquante (URL ou clé publique).");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (minHealthScore > 0) {
          params.set("min_health_score", String(minHealthScore));
        }

        const url = `${supabaseUrl}/functions/v1/scholarships-list${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const res = await fetch(url, {
          headers: {
            apikey: anonKey as string,
            Authorization: `Bearer ${anonKey}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as Scholarship[];
        setItems(data);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        console.error("Failed to load scholarships:", e);
        setError("Impossible de charger les bourses pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [supabaseUrl, anonKey, minHealthScore]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const name = (item.name ?? "").toLowerCase();
      const url = (item.source_url ?? "").toLowerCase();

      const eligibility = (item.data as any)?.eligibility ?? {};
      const destination =
        (eligibility.destination_country ??
          eligibility.country ??
          "") as string;

      return (
        name.includes(term) ||
        url.includes(term) ||
        destination.toLowerCase().includes(term)
      );
    });
  }, [items, search]);

  const formatDate = (value: string | null) => {
    if (!value) return null;
    try {
      return new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const formatHost = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple header inspiré du layout concours */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">TrailLearn</span>
            </span>
            <span className="hidden sm:inline text-muted-foreground text-xs font-normal border-l border-border pl-2 ml-1">
              Bourses d&apos;étude
            </span>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <span className="rounded-md px-3 py-1.5 text-foreground bg-accent/60 font-medium">
              Catalogue
            </span>
            <a
              href="/developer"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              API &amp; Intégration
            </a>
            <a
              href="/queue"
              className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Console admin
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero / intro */}
        <section className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span>Catalogue des bourses vérifiées</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Parcourez les bourses d&apos;études consolidées par TrailLearn à
            partir de sources officielles et partenaires, avec un score de
            fiabilité calculé en temps réel.
          </p>
        </section>

        {/* Filtres principaux */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une bourse (nom, pays, URL)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Filtrer par fiabilité :
              </span>
              <select
                value={minHealthScore}
                onChange={(e) => setMinHealthScore(Number(e.target.value))}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                {HEALTH_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ressources externes inspirées des liens fournis */}
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">
                  Ressources externes par filière
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Ces liens complètent le catalogue TrailLearn avec des listes
                thématiques de bourses.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {RESOURCE_LINKS.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-lg border border-border bg-background/60 px-3 py-2 text-xs hover:border-primary hover:shadow-sm transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold">{r.label}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {r.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Résultats */}
        <section className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune bourse ne correspond à vos critères pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => {
                const eligibility = (item.data as any)?.eligibility ?? {};
                const destination =
                  (eligibility.destination_country ??
                    eligibility.country ??
                    null) as string | null;
                const level = (eligibility.level ??
                  eligibility.study_level ??
                  null) as string | null;
                const amount =
                  (item.data as any)?.amount ??
                  (item.data as any)?.financials?.amount ??
                  null;

                return (
                  <article
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-1">
                        <a
                          href={`/scholarships/${item.id}`}
                          className="font-semibold text-sm leading-snug hover:text-primary transition-colors"
                        >
                          {item.name}
                        </a>
                        <p className="text-[11px] text-muted-foreground break-all">
                          {formatHost(item.source_url)}
                        </p>
                      </div>
                      <TrustBadge scholarship={item} />
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground mb-3">
                      {destination && (
                        <div className="flex items-center gap-1.5">
                          <Globe2 className="h-3.5 w-3.5" />
                          <span>{destination}</span>
                        </div>
                      )}
                      {level && (
                        <div className="flex items-center gap-1.5">
                          <Link2 className="h-3.5 w-3.5" />
                          <span>{level}</span>
                        </div>
                      )}
                      {item.deadline_at && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Échéance : {formatDate(item.deadline_at) ?? "-"}
                          </span>
                        </div>
                      )}
                      {amount && (
                        <div className="flex items-center gap-1.5">
                          <span>Montant indicatif :</span>
                          <span className="font-medium text-foreground">
                            {String(amount)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        Dernière vérification :{" "}
                        {formatDate(item.last_verified_at) ?? "—"}
                      </span>
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Voir la source officielle
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


