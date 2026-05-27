import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackPixelPageView } from "@/lib/pixel";
import NotFound from "@/pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useRef } from "react";
import { Redirect, Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BreakdownOptin from "./pages/BreakdownOptin";
import FreeTraining from "./pages/FreeTraining";
import HarjinderBreakdown from "./pages/HarjinderBreakdown";
import Terms from "./pages/Terms";
import ThankYou from "./pages/ThankYou";
import Training from "./pages/Training";


function Router() {
  return (
    <Switch>
      <Route path="/">{() => <Redirect to="/free-training" />}</Route>
      <Route path="/free-training" component={FreeTraining} />
      <Route path="/training" component={Training} />
      <Route path="/breakdown-harjinder">{() => <BreakdownOptin clientSlug="harjinder" clientName="Harjinder" headline={<>How Harjinder Made <span className="relative inline-block"><span className="relative z-10">£27,830 in 30 Days</span><svg className="absolute -bottom-1 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5.5C20 2 40 7 60 4.5C80 2 100 6.5 120 3.5C140 1 160 6 180 4C190 3 197 5.5 199 4.5" stroke="#EAB308" strokeWidth="3" strokeLinecap="round"/></svg></span> Tutoring Chemistry Online</>} pronoun="his" videoSrc="/breakdowns/harjinder-preview.mp4" />}</Route>
      <Route path="/harjinder-breakdown" component={HarjinderBreakdown} />
      <Route path="/thankyou" component={ThankYou} />
      <Route path="/terms" component={Terms} />
      {/* Anything else: send the visitor to the opt-in instead of a 404 */}
      <Route>{() => <Redirect to="/free-training" />}</Route>
    </Switch>
  );
}

// Meta Pixel auto-fires PageView once from the snippet in index.html on
// initial load. For SPA navigation we manually fire PageView on every
// subsequent route change, skipping the first render to avoid a duplicate.
function PixelRouteTracker() {
  const [location] = useLocation();
  const firstMount = useRef(true);
  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    trackPixelPageView();
  }, [location]);
  return null;
}

// Wouter doesn't reset scroll position on SPA navigation; without this, a
// visitor who scrolls to a CTA at the bottom of /free-training and submits
// the opt-in form lands on /training at the same scroll offset. Snap to top
// on every route change.
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <PixelRouteTracker />
          <Router />
          <Analytics />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
