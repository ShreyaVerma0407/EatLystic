// src/ErrorBoundary.jsx

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    // Update state to render fallback UI on error
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log the error information (can also send to an error logging service)
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  render() {
    // Fallback UI for when an error is caught
    if (this.state.hasError) {
      return <div>Something went wrong while loading liked recipes.</div>;
    }

    return this.props.children; // Render the children components as usual
  }
}

export default ErrorBoundary;
