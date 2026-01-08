import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#333' }}>
                    <h1 style={{ color: '#d32f2f' }}>Something went wrong.</h1>
                    <p>We're sorry, but the application encountered an unexpected error.</p>
                    <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px auto', maxWidth: '600px', textAlign: 'left', overflow: 'auto' }}>
                        <code style={{ color: '#d32f2f' }}>{this.state.error && this.state.error.toString()}</code>
                        <br />
                        <br />
                        <details>
                            <summary>Stack Trace</summary>
                            <pre style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{ padding: '12px 24px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            Reload Application
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            style={{ padding: '12px 24px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            Fix "Stuck" App (Clear Data)
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
