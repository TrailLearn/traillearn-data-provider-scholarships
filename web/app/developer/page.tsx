"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Key, Copy, Check, ExternalLink, Terminal, Code2 } from "lucide-react";

export default function DeveloperPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlExample = `curl -X GET "${supabaseUrl}/functions/v1/scholarships-list" \
  -H "apikey: ${anonKey}" \
  -H "Authorization: Bearer ${anonKey}"`;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto h-full">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Espace Développeur</h1>
          <p className="text-muted-foreground">
            Ressources et identifiants pour intégrer l'API TrailLearn Scholarships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Keys */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border rounded-xl p-6 bg-card shadow-sm space-y-6">
              <div className="flex items-center gap-2 font-semibold text-lg border-b pb-4">
                <Key className="h-5 w-5 text-primary" />
                Authentification
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Base URL</label>
                  <div className="flex gap-2">
                    <Input readOnly value={`${supabaseUrl}/functions/v1`} className="bg-muted/50 font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${supabaseUrl}/functions/v1`, 'url')}>
                      {copied === 'url' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Clé Publique (Anon)</label>
                  <div className="flex gap-2">
                    <Input readOnly type="password" value={anonKey} className="bg-muted/50 font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(anonKey, 'key')}>
                      {copied === 'key' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[10px] text-amber-600 font-medium">
                    ⚠️ Cette clé (Anon) est publique par conception. Elle est utilisée pour identifier votre application mais ne remplace pas une authentification utilisateur pour les actions sensibles.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-6 bg-primary/5 border-primary/10">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Code2 className="h-4 w-4" />
                    SDK Recommendation
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    Nous recommandons l'utilisation du client Supabase officiel pour une meilleure gestion de l'auth et du typage.
                </p>
                <code className="text-[10px] bg-background p-2 rounded block border">
                    npm install @supabase/supabase-js
                </code>
            </div>
          </div>

          {/* Right Column: Code & Documentation */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* cURL Quick Start */}
            <div className="border rounded-xl p-6 bg-slate-950 text-slate-50 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 font-semibold">
                  <Terminal className="h-5 w-5 text-emerald-400" />
                  Quick Start (cURL)
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-400 hover:text-white"
                    onClick={() => copyToClipboard(curlExample, 'curl')}
                >
                    {copied === 'curl' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-xs font-mono p-2 overflow-x-auto text-emerald-300">
                {curlExample}
              </pre>
            </div>

            {/* Documentation Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="/docs" 
                className="group border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all flex flex-col justify-between h-40 bg-card"
              >
                <div className="font-semibold flex items-center justify-between text-lg">
                  API Explorer
                  <ExternalLink className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Explorez interactivement tous les endpoints, visualisez les schémas de données et testez vos requêtes en direct.
                </p>
                <div className="text-xs font-bold text-primary uppercase tracking-widest mt-2">Accéder à la doc →</div>
              </a>

              <div className="border rounded-xl p-6 bg-muted/20 h-40 flex flex-col justify-between border-dashed">
                <div className="font-semibold text-muted-foreground flex items-center gap-2">
                  Webhooks
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">Bientôt</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications en temps réel lorsque de nouvelles bourses sont vérifiées ou mises à jour.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}