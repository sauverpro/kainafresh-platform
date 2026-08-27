/**
 * ============================================================================
 * KainaFresh Organic Platform — Universal Glassmorphic Page Loader
 * ============================================================================
 * 
 * Renders a brand-tailored full screen loading overlay featuring:
 * 1. Pulsing logo header with brand colors.
 * 2. Rotating dual-accent spinner ring (#076935 Forest Green & #F39927 Golden Amber).
 * 3. Dynamic progress feedback message.
 */

// Import CSS stylesheet for animations and glassmorphism overlay
import './PageLoader.css';

/**
 * Props definition interface for PageLoader component.
 * Allows customization of the status message displayed below the loader ring.
 */
interface PageLoaderProps {
  // Optional custom text displayed while data is being fetched from MariaDB
  text?: string;
}

/**
 * PageLoader Functional Component.
 * @param text - Customizable loading message string with default fallback.
 */
export default function PageLoader({ text = "Retrieving fresh data..." }: PageLoaderProps) {
  return (
    // Fixed position full-screen backdrop overlay container
    <div className="page-loader-overlay">
      
      {/* Brand logo container */}
      <div className="page-loader-brand">
        <span className="loader-logo-text">
          Kaina<span className="loader-logo-accent">Fresh</span>
        </span>
      </div>

      {/* Rotating CSS dual-color spinner ring */}
      <div className="loader-spinner-ring"></div>

      {/* Dynamic contextual status text */}
      <span className="loader-text">{text}</span>
    </div>
  );
}
