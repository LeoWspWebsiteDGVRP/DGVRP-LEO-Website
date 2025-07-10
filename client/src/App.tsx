import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CitationForm from "@/pages/citation-form";
import Selection from "@/pages/selection";
import ArrestForm from "@/pages/arrest-form";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Selection} />
      <Route path="/home" component={Home} />
      <Route path="/citation" component={CitationForm} />
      <Route path="/arrest" component={ArrestForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="dark">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
