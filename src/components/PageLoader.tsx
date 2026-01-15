import { Loader2 } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};

export default PageLoader;
