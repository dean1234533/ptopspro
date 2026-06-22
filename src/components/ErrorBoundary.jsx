import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 px-6 text-center">
          <p className="text-lg font-bold text-white">Something went wrong</p>
          <p className="text-sm text-gray-400">{this.state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
