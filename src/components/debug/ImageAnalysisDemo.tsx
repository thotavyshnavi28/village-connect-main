import { useState } from 'react';
import { analyzeImage, ImageAnalysisResult } from '@/lib/imageAnalysis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ImageAnalysisDemo() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState<ImageAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeImage(url);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>AI Image Analysis Module Demo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Paste Firebase Storage Image URL or any public Image URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <Button onClick={handleAnalyze} disabled={loading || !url}>
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Analyze'}
                        </Button>
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    {result && (
                        <div className="space-y-4 mt-4 bg-muted p-4 rounded-lg">
                            <div>
                                <h3 className="font-bold">Description</h3>
                                <p className="text-sm">{result.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-bold">Objects</h3>
                                    <ul className="text-sm list-disc pl-4">
                                        {result.objects.map((obj, i) => (
                                            <li key={i}>{obj.name} ({(obj.confidence * 100).toFixed(1)}%)</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold">Labels</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {result.labels.map(label => (
                                            <span key={label} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm">
                                <span className="font-bold">Overall Confidence: </span>
                                {(result.overall_confidence * 100).toFixed(1)}%
                            </div>

                            <div className="mt-2 text-xs text-muted-foreground">
                                * Result also saved to 'imageAnalysis' Firestore collection.
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
