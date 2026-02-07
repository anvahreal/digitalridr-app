
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
                    <div className="max-w-md space-y-4 rounded-xl bg-white p-8 shadow-xl">
                        <h1 className="text-2xl font-black text-red-600">Something went wrong</h1>
                        <p className="text-sm text-slate-600">
                            We encountered an unexpected error.
                        </p>
                        <div className="max-h-48 overflow-y-auto rounded bg-slate-100 p-4 text-left text-[10px] font-mono text-slate-800">
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo?.componentStack}
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => window.location.href = "/"}>Go Home</Button>
                            <Button variant="outline" onClick={() => window.location.reload()}>Reload Page</Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
