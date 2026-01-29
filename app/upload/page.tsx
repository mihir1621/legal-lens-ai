import DragDropUpload from '@/components/DragDropUpload';

export default function UploadPage() {
    return (
        <div className="container mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Analyze Your Contract</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Upload your rental agreement, service contract, or any legal document. We'll extract the key clauses and potential risks in seconds.
                </p>
            </div>
            <DragDropUpload />
        </div>
    );
}
