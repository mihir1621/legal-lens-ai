export default function ComparePage() {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Compare Contracts</h1>
            <p className="text-muted-foreground mb-8">Upload two documents to see a side-by-side comparison of risks and terms.</p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] hover:bg-muted/30 transition-colors cursor-pointer group">
                    <span className="bg-primary/10 text-primary rounded-full px-4 py-1 text-sm font-medium mb-4 group-hover:bg-primary group-hover:text-white transition-colors">Contract A</span>
                    <p className="text-muted-foreground">Upload First Document</p>
                </div>
                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] hover:bg-muted/30 transition-colors cursor-pointer group">
                    <span className="bg-secondary/10 text-secondary-foreground rounded-full px-4 py-1 text-sm font-medium mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">Contract B</span>
                    <p className="text-muted-foreground">Upload Second Document</p>
                </div>
            </div>
        </div>
    );
}
