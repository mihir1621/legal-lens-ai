import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function DocumentPage({ params }: { params: { id: string } }) {
    // Mock data for demo
    const mockData = {
        summary_simple: "This agreement says you must pay rent before the 5th of every month. The owner can increase rent after 11 months.",
        key_clauses: [
            { title: "Security Deposit", explanation: "You strictly have to pay ₹50,000 as deposit.", risk: "medium" },
            { title: "Termination", explanation: "1 month notice required.", risk: "low" }
        ],
        red_flags: [
            { text: "non-refundable deposit", reason: "Standard contracts usually imply refundable deposits minus damages.", severity: "high" }
        ],
        what_it_means: [
            "You must pay rent before the 5th.",
            "You may lose deposit if you leave early without notice."
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Analysis Result</h1>
                <p className="text-muted-foreground">Document ID: {params.id}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Simple Summary */}
                <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Info className="text-primary h-5 w-5" />
                        Simple Explanation
                    </h2>
                    <p className="text-lg leading-relaxed">{mockData.summary_simple}</p>
                </div>

                {/* Risk Highlights */}
                <div className="col-span-full lg:col-span-1 rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Red Flags
                    </h2>
                    <div className="space-y-4">
                        {mockData.red_flags.map((flag, i) => (
                            <div key={i} className="p-3 bg-white/50 rounded-lg border border-destructive/10">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-destructive-foreground">{flag.text}</span>
                                    <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-destructive text-white">{flag.severity}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{flag.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Clauses */}
                <div className="col-span-full lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Key Clauses Breakdown</h2>
                    <div className="space-y-4">
                        {mockData.key_clauses.map((clause, i) => (
                            <div key={i} className="border-b last:border-0 border-border pb-4 last:pb-0">
                                <div className="flex justify-between mb-1">
                                    <h3 className="font-medium">{clause.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${clause.risk === 'high' ? 'bg-destructive/10 text-destructive' :
                                            clause.risk === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                                                'bg-green-500/10 text-green-600'
                                        }`}>{clause.risk} Risk</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{clause.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actionable Points */}
                <div className="col-span-full lg:col-span-1 rounded-xl border border-secondary/20 bg-secondary/5 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-secondary-foreground">
                        <CheckCircle className="h-5 w-5" />
                        What this means for you
                    </h2>
                    <ul className="space-y-3">
                        {mockData.what_it_means.map((point, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                                <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
