
import React, { Component, ErrorInfo, ReactNode } from 'react';

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
        errorInfo: null
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
                <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#FEF2F2', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h1 style={{ color: '#DC2626', fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>Something went wrong</h1>
                        <p style={{ color: '#4B5563', marginBottom: '20px' }}>The application encountered a critical error and could not load.</p>

                        <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '8px', overflow: 'auto', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
                            <p style={{ color: '#DC2626', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '8px' }}>
                                {this.state.error?.toString()}
                            </p>
                            <pre style={{ color: '#374151', fontSize: '12px', fontFamily: 'monospace' }}>
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            style={{ padding: '10px 20px', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'medium' }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
