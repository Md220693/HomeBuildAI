import { useSearchParams } from "react-router-dom";
import ReportDelivery from "@/components/ReportDelivery";

const Capitolato = () => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('leadId');

  if (!leadId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">ID Progetto Mancante</h1>
          <p className="text-muted-foreground">Torna alla home e ricomincia il processo.</p>
        </div>
      </div>
    );
  }

  return <ReportDelivery leadId={leadId} />;
};

export default Capitolato;