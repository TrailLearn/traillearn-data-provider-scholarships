"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Globe2,
  Link2,
  Loader2,
  Euro,
  Info,
} from "lucide-react";
import { TrustBadge } from "@/components/trust-badge";
import type { Scholarship } from "@/lib/types";

interface ScholarshipDetail extends Scholarship {
  // allow extra fields coming from the edge function (if any)
  [key: string]: any;
}

const formatDate = (value: string | null | undefined) => {
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

const formatHost = (url: string | null | undefined) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default function ScholarshipDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [item, setItem] = useState<ScholarshipDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!id) return;
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

        const url = `${supabaseUrl}/functions/v1/scholarship-detail?id=${encodeURIComponent(
          String(id)
        )}`;

        const res = await fetch(url, {
          headers: {
            apikey: anonKey as string,
            Authorization: `Bearer ${anonKey}`,
          },
          signal: controller.signal,
        });

        if (res.status === 404) {
          setError("Cette bourse n'existe pas ou n'est plus disponible.");
          setItem(null);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as ScholarshipDetail;
        setItem(data);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        console.error("Failed to load scholarship detail:", e);
        setError("Impossible de charger le détail de cette bourse.");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [id, supabaseUrl, anonKey]);

  const eligibility = (item?.data as any)?.eligibility ?? {};
  const financials = (item?.data as any)?.financials ?? {};

  const destination =
    eligibility.destination_country ??
    eligibility.country ??
    eligibility.region ??
    null;
  const level = eligibility.level ?? eligibility.study_level ?? null;
  const gpaMin = eligibility.gpa_min ?? eligibility.gpa ?? null;

  const amount =
    (item?.data as any)?.amount ??
    financials.amount ??
    financials.max ??
    item?.data?.amount_max ??
    null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 space-y-6 text-center">
          <Info className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <h1 className="text-xl font-semibold mb-1">Bourse introuvable</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {error ??
              "Cette bourse n'existe pas ou n'est plus disponible dans le catalogue."}
          </p>
          <button
            onClick={() => router.push("/scholarships")}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <button
          onClick={() => router.push("/scholarships")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </button>

        {/* En-tête principal */}
        <section className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {item.name}
              </h1>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all"
                >
                  {formatHost(item.source_url)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <TrustBadge scholarship={item} />
              <span className="text-[11px] text-muted-foreground font-mono">
                ID: {item.id}
              </span>
            </div>
          </div>
        </section>

        {/* Cartes d'infos clés */}
        <section className="grid gap-4 sm:grid-cols-2">
          {/* Bloc dates / deadline */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              Dates clés
            </h2>
            <dl className="space-y-2 text-sm">
              {item.deadline_at && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date limite</dt>
                  <dd className="font-medium">
                    {formatDate(item.deadline_at)}
                  </dd>
                </div>
              )}
              {item.created_at && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Ajout au catalogue</dt>
                  <dd className="font-medium">
                    {formatDate(item.created_at)}
                  </dd>
                </div>
              )}
              {item.last_verified_at && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Dernière vérification
                  </dt>
                  <dd className="font-medium">
                    {formatDate(item.last_verified_at)}
                  </dd>
                </div>
              )}
              {!item.deadline_at && !item.created_at && !item.last_verified_at && (
                <p className="text-xs text-muted-foreground italic">
                  Aucune information de date disponible.
                </p>
              )}
            </dl>
          </div>

          {/* Bloc éligibilité / cible */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Globe2 className="h-4 w-4 text-primary" />
              Profil ciblé
            </h2>
            <dl className="space-y-2 text-sm">
              {destination && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Destination / Pays</dt>
                  <dd className="font-medium text-right">{destination}</dd>
                </div>
              )}
              {level && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Niveau d&apos;étude</dt>
                  <dd className="font-medium text-right">{level}</dd>
                </div>
              )}
              {gpaMin && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">GPA / Moyenne min.</dt>
                  <dd className="font-medium text-right">{gpaMin}</dd>
                </div>
              )}
              {!destination && !level && !gpaMin && (
                <p className="text-xs text-muted-foreground italic">
                  Les conditions détaillées d&apos;éligibilité ne sont pas
                  encore structurées. Référez-vous au site officiel.
                </p>
              )}
            </dl>
          </div>
        </section>

        {/* Montant et infos financières */}
        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <Euro className="h-4 w-4 text-primary" />
            Montant & infos financières
          </h2>
          {amount ? (
            <p className="text-sm">
              <span className="text-muted-foreground mr-1">
                Montant indicatif :
              </span>
              <span className="font-medium">{String(amount)}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Le montant n&apos;est pas encore structuré dans le catalogue. Il
              peut être disponible sur la page officielle.
            </p>
          )}
        </section>

        {/* Description brute / JSON pour power users */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Info className="h-4 w-4 text-primary" />
            Détails techniques (payload brut)
          </h2>
          <p className="text-xs text-muted-foreground">
            Ces données proviennent directement de la colonne JSONB{" "}
            <code className="px-1 py-0.5 rounded bg-muted text-[10px]">
              data
            </code>{" "}
            de la table <code className="px-1 py-0.5 rounded bg-muted text-[10px]">
              scholarships
            </code>
            .
          </p>
          <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto max-h-80">
            {JSON.stringify(item.data ?? {}, null, 2)}
          </pre>
        </section>

        {/* CTA vers site officiel */}
        {item.source_url && (
          <section className="pt-2 flex justify-center">
            <a
              href={item.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Consulter la page officielle de la bourse
              <ExternalLink className="h-4 w-4" />
            </a>
          </section>
        )}
      </main>
    </div>
  );
}




