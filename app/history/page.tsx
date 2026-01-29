import Link from 'next/link';
import { FileText, Clock, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
    const history = [
        { id: '1', title: 'Rental Agreement - Bandra Flat', date: '2023-10-24', risk: 'Medium' },
        { id: '2', title: 'HDFC Personal Loan Policy', date: '2023-11-02', risk: 'High' },
        { id: '3', title: 'Freelance Design Contract', date: '2023-11-15', risk: 'Low' },
    ];

    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold mb-8">Your Analysis History</h1>
            <div className="space-y-4">
                {history.map((item) => (
                    <Link
                        key={item.id}
                        href={`/document/${item.id}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium">{item.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{item.date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.risk === 'High' ? 'bg-destructive/10 text-destructive' :
                                    item.risk === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                                        'bg-green-500/10 text-green-600'
                                }`}>
                                {item.risk} Risk
                            </span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
