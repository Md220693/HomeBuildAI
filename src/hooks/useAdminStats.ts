import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalLeads: number;
  leadsGrowth: number;
  activeSuppliers: number;
  suppliersGrowth: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  loading: boolean;
  error: string | null;
}

export function useAdminStats(): AdminStats {
  const [stats, setStats] = useState<AdminStats>({
    totalLeads: 0,
    leadsGrowth: 0,
    activeSuppliers: 0,
    suppliersGrowth: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    conversionRate: 0,
    conversionGrowth: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Date calculations
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total leads
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        // Leads this month
        const { count: thisMonthLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thisMonthStart.toISOString());

        // Leads last month
        const { count: lastMonthLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', thisMonthStart.toISOString());

        // Active suppliers
        const { count: activeSuppliers } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true })
          .eq('attivo', true)
          .eq('onboarding_completato', true);

        // Suppliers this month
        const { count: thisMonthSuppliers } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true })
          .eq('attivo', true)
          .eq('onboarding_completato', true)
          .gte('created_at', thisMonthStart.toISOString());

        // Suppliers last month
        const { count: lastMonthSuppliers } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact', head: true })
          .eq('attivo', true)
          .eq('onboarding_completato', true)
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', thisMonthStart.toISOString());

        // Monthly revenue (this month)
        const { data: thisMonthPayments } = await supabase
          .from('supplier_payments')
          .select('amount')
          .eq('payment_status', 'completed')
          .gte('created_at', thisMonthStart.toISOString());

        // Monthly revenue (last month)
        const { data: lastMonthPayments } = await supabase
          .from('supplier_payments')
          .select('amount')
          .eq('payment_status', 'completed')
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', thisMonthStart.toISOString());

        // Purchased leads for conversion rate (this month)
        const { count: purchasedLeads } = await supabase
          .from('supplier_leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'purchased')
          .gte('purchased_at', thisMonthStart.toISOString());

        // Purchased leads last month
        const { count: lastMonthPurchasedLeads } = await supabase
          .from('supplier_leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'purchased')
          .gte('purchased_at', lastMonthStart.toISOString())
          .lt('purchased_at', thisMonthStart.toISOString());

        // Calculate values
        const monthlyRevenue = thisMonthPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
        const lastMonthRevenue = lastMonthPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
        
        const conversionRate = thisMonthLeads && thisMonthLeads > 0 ? (purchasedLeads || 0) / thisMonthLeads * 100 : 0;
        const lastConversionRate = lastMonthLeads && lastMonthLeads > 0 ? (lastMonthPurchasedLeads || 0) / lastMonthLeads * 100 : 0;

        // Calculate growth percentages
        const leadsGrowth = lastMonthLeads && lastMonthLeads > 0 ? 
          ((thisMonthLeads || 0) - lastMonthLeads) / lastMonthLeads * 100 : 0;
        
        const suppliersGrowth = lastMonthSuppliers && lastMonthSuppliers > 0 ? 
          ((thisMonthSuppliers || 0) - lastMonthSuppliers) / lastMonthSuppliers * 100 : 0;
        
        const revenueGrowth = lastMonthRevenue > 0 ? 
          (monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100 : 0;
        
        const conversionGrowth = lastConversionRate > 0 ? 
          (conversionRate - lastConversionRate) : 0;

        setStats({
          totalLeads: totalLeads || 0,
          leadsGrowth: Math.round(leadsGrowth * 10) / 10,
          activeSuppliers: activeSuppliers || 0,
          suppliersGrowth: Math.round(suppliersGrowth * 10) / 10,
          monthlyRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          conversionRate: Math.round(conversionRate * 10) / 10,
          conversionGrowth: Math.round(conversionGrowth * 10) / 10,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Errore nel caricamento delle statistiche'
        }));
      }
    }

    fetchStats();
  }, []);

  return stats;
}