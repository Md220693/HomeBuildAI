import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

  
    this.setState({
      error,
      errorInfo,
    });

  
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <AlertTriangle className="h-16 w-16 text-destructive" />
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Qualcosa è andato storto
                </h1>
                <p className="text-muted-foreground">
                  Si è verificato un errore imprevisto. Ci scusiamo per l'inconveniente.
                </p>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <div className="w-full text-left">
                  <details className="bg-muted p-4 rounded-lg">
                    <summary className="cursor-pointer font-semibold text-sm mb-2">
                      Dettagli dell'errore (solo in sviluppo)
                    </summary>
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <strong>Errore:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-destructive">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 whitespace-pre-wrap text-muted-foreground">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={this.handleReset} variant="default" size="lg">
                  Torna alla Home
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="lg"
                >
                  Ricarica Pagina
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Se il problema persiste, contatta il supporto:{' '}
                <a 
                  href="mailto:support@buildhomeai.com" 
                  className="text-primary hover:underline"
                >
                  support@buildhomeai.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


