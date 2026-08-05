import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { produceApi } from '../api/produce';
import type { ProduceTransaction, TransactionStatus } from '../types/produce';

const statusBadges: Record<TransactionStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'PENDING CONFIRMATION', bg: '#fef9c3', color: '#854d0e' },
  confirmed: { label: 'CONFIRMED', bg: '#dbeafe', color: '#1e40af' },
  completed: { label: 'COMPLETED / DELIVERED', bg: '#dcfce7', color: '#166534' },
  cancelled: { label: 'CANCELLED', bg: '#fee2e2', color: '#991b1b' },
};

export const ProduceTransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<ProduceTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await produceApi.listTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleUpdateStatus = async (id: string, status: TransactionStatus) => {
    try {
      await produceApi.updateTransactionStatus(id, status);
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update transaction status');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Produce Orders & Transactions
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
          Track produce purchase requests and update order status.
        </p>

        {loading ? (
          <div>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', borderRadius: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>📋</span>
            <h3 style={{ marginTop: '12px', fontSize: '18px' }}>No Transactions Found</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Produce purchase requests will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {transactions.map((tx) => {
              const badge = statusBadges[tx.status];
              const isFarmer = user?.id === tx.farmerId;
              const isBuyer = user?.id === tx.buyerId;

              return (
                <div key={tx.id} className="glass-panel" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', backgroundColor: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                        {tx.cropName} ({tx.quantity} units)
                      </h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a' }}>
                        ₱{tx.totalPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>₱{tx.unitPrice}/unit</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px' }}>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>BUYER</p>
                      <p style={{ fontWeight: 700, margin: 0 }}>{tx.buyerName} {isBuyer && '(You)'}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>FARMER</p>
                      <p style={{ fontWeight: 700, margin: 0 }}>{tx.farmerName} {isFarmer && '(You)'}</p>
                    </div>
                  </div>

                  {tx.contactMessage && (
                    <div style={{ fontSize: '13px', color: '#334155', fontStyle: 'italic', backgroundColor: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      💬 "{tx.contactMessage}"
                    </div>
                  )}

                  {/* Actions depending on role & current status */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                    {isFarmer && tx.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(tx.id, 'confirmed')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                          Confirm Order
                        </button>
                        <button onClick={() => handleUpdateStatus(tx.id, 'cancelled')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                          Decline Request
                        </button>
                      </>
                    )}

                    {tx.status === 'confirmed' && (
                      <button onClick={() => handleUpdateStatus(tx.id, 'completed')} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#15803d', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                        Mark as Completed / Delivered
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
