import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Search, Filter, Download, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentLog {
  id: string;
  supplier_id: string;
  supplier_name: string;
  lead_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at: string;
  lead_type: 'shared' | 'exclusive';
  transaction_fee: number;
  net_amount: number;
}

const AdminPaymentLogs = () => {
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockPayments: PaymentLog[] = [
    {
      id: '1',
      supplier_id: 'sup-1',
      supplier_name: 'Edil Roma SRL',
      lead_id: 'lead-1',
      amount: 50.00,
      payment_method: 'stripe',
      payment_status: 'completed',
      stripe_payment_intent_id: 'pi_1234567890',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:31:15Z',
      lead_type: 'shared',
      transaction_fee: 2.50,
      net_amount: 47.50
    },
    {
      id: '2',
      supplier_id: 'sup-2',
      supplier_name: 'Costruzioni Milano SpA',
      lead_id: 'lead-2',
      amount: 200.00,
      payment_method: 'stripe',
      payment_status: 'completed',
      stripe_payment_intent_id: 'pi_0987654321',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T14:21:30Z',
      lead_type: 'exclusive',
      transaction_fee: 8.00,
      net_amount: 192.00
    },
    {
      id: '3',
      supplier_id: 'sup-3',
      supplier_name: 'Renovations Napoli',
      lead_id: 'lead-3',
      amount: 75.00,
      payment_method: 'stripe',
      payment_status: 'failed',
      stripe_payment_intent_id: 'pi_1122334455',
      created_at: '2024-01-13T16:45:00Z',
      updated_at: '2024-01-13T16:46:00Z',
      lead_type: 'shared',
      transaction_fee: 0,
      net_amount: 0
    },
    {
      id: '4',
      supplier_id: 'sup-1',
      supplier_name: 'Edil Roma SRL',
      lead_id: 'lead-4',
      amount: 100.00,
      payment_method: 'stripe',
      payment_status: 'pending',
      stripe_payment_intent_id: 'pi_5566778899',
      created_at: '2024-01-12T09:15:00Z',
      updated_at: '2024-01-12T09:15:00Z',
      lead_type: 'shared',
      transaction_fee: 0,
      net_amount: 0
    },
    {
      id: '5',
      supplier_id: 'sup-4',
      supplier_name: 'Casa Bella Firenze',
      lead_id: 'lead-5',
      amount: 150.00,
      payment_method: 'stripe',
      payment_status: 'refunded',
      stripe_payment_intent_id: 'pi_9988776655',
      created_at: '2024-01-11T11:30:00Z',
      updated_at: '2024-01-11T15:20:00Z',
      lead_type: 'exclusive',
      transaction_fee: -6.00,
      net_amount: -144.00
    }
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, dateRange]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPayments(mockPayments);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i pagamenti"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const searchLower = searchTerm.toLowerCase();
        return (
          payment.supplier_name.toLowerCase().includes(searchLower) ||
          payment.lead_id.toLowerCase().includes(searchLower) ||
          payment.stripe_payment_intent_id?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.payment_status === statusFilter);
    }

    if (dateRange !== "all") {
      const now = new Date();
      let dateThreshold: Date;
      
      switch (dateRange) {
        case 'today':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          dateThreshold = new Date(0);
      }
      
      filtered = filtered.filter(payment => new Date(payment.created_at) >= dateThreshold);
    }

    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'In Attesa', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'completed': { label: 'Completato', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'failed': { label: 'Fallito', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      'refunded': { label: 'Rimborsato', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportPayments = () => {
    // Generate CSV data
    const csvHeaders = ['Data', 'Fornitore', 'Lead ID', 'Importo', 'Status', 'Tipo', 'Commissione', 'Netto'];
    const csvData = filteredPayments.map(payment => [
      formatDate(payment.created_at),
      payment.supplier_name,
      payment.lead_id,
      payment.amount.toString(),
      payment.payment_status,
      payment.lead_type,
      payment.transaction_fee.toString(),
      payment.net_amount.toString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pagamenti_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export completato",
      description: "I dati sono stati esportati in formato CSV"
    });
  };

  const getTotals = () => {
    const filtered = filteredPayments.filter(p => p.payment_status === 'completed');
    return {
      totalTransactions: filtered.length,
      totalAmount: filtered.reduce((sum, p) => sum + p.amount, 0),
      totalFees: filtered.reduce((sum, p) => sum + p.transaction_fee, 0),
      totalNet: filtered.reduce((sum, p) => sum + p.net_amount, 0)
    };
  };

  const totals = getTotals();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totals.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Transazioni Completate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totals.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Volume Totale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totals.totalFees)}</div>
            <p className="text-xs text-muted-foreground">Commissioni</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totals.totalNet)}</div>
            <p className="text-xs text-muted-foreground">Ricavi Netti</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Log Pagamenti
          </CardTitle>
          <CardDescription>
            Storico completo di tutti i pagamenti e transazioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtri */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per fornitore, lead ID, transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="pending">In Attesa</SelectItem>
                <SelectItem value="completed">Completato</SelectItem>
                <SelectItem value="failed">Fallito</SelectItem>
                <SelectItem value="refunded">Rimborsato</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutto il periodo</SelectItem>
                <SelectItem value="today">Oggi</SelectItem>
                <SelectItem value="week">Ultima settimana</SelectItem>
                <SelectItem value="month">Ultimo mese</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadPayments} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
            <Button variant="outline" onClick={exportPayments}>
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
          </div>

          {/* Tabella */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornitore</TableHead>
                  <TableHead>Lead ID</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Commissione</TableHead>
                  <TableHead>Netto</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Caricamento...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nessun pagamento trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-sm">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.supplier_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.lead_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.payment_status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.lead_type === 'exclusive' ? 'default' : 'secondary'}>
                          {payment.lead_type === 'exclusive' ? 'Esclusivo' : 'Condiviso'}
                        </Badge>
                      </TableCell>
                      <TableCell className={payment.transaction_fee < 0 ? 'text-red-600' : ''}>
                        {formatCurrency(payment.transaction_fee)}
                      </TableCell>
                      <TableCell className={`font-medium ${
                        payment.net_amount > 0 ? 'text-green-600' : 
                        payment.net_amount < 0 ? 'text-red-600' : ''
                      }`}>
                        {formatCurrency(payment.net_amount)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {payment.stripe_payment_intent_id && (
                          <span title={payment.stripe_payment_intent_id}>
                            {payment.stripe_payment_intent_id.slice(0, 12)}...
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentLogs;