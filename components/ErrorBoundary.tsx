import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen mission-gradient flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card rounded-[48px] p-10 text-center space-y-8 border-2 border-red-500/20 shadow-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full"></div>
              <div className="relative w-24 h-24 bg-red-500/10 rounded-[32px] mx-auto flex items-center justify-center border border-red-500/20">
                <i className="fas fa-triangle-exclamation text-5xl text-red-500"></i>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
                Etwas ist<br />
                <span className="text-red-500">schiefgelaufen</span>
              </h2>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                Die Anwendung ist auf einen unerwarteten Fehler gestoßen. Bitte lade die
                Seite neu oder kontaktiere den Support.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-5 bg-red-500 hover:bg-red-600 text-white font-black rounded-[28px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
            >
              <i className="fas fa-rotate-right"></i>
              Anwendung neu laden
            </button>

            <div className="flex items-center justify-center gap-3 text-red-500/40 text-[10px] font-black uppercase tracking-[0.3em]">
              <i className="fas fa-shield-halved text-[8px]"></i>
              Mission Erde Support
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
