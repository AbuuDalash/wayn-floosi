'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface Transaction {
  id: string;
  amount: string;
  currency: string;
  type: string;
  category: string;
  merchant: string | null;
  description: string | null;
  date: string;
  source: string;
  isDuplicate: boolean;
}

const CATEGORIES = [
  'مطاعم وكافيهات', 'مواد غذائية', 'نقل ومواصلات', 'ترفيه واشتراكات',
  'فواتير وخدمات', 'صحة وطب', 'تسوق وملابس', 'تعليم',
  'مصرفية وتحويلات', 'رياضة', 'إيجار وسكن', 'أخرى',
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAmount(amount: string, type: string) {
  const n = parseFloat(amount).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return type === 'INCOME' ? `+${n}` : `-${n}`;
}

export default function TransactionsClient() {
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(searchParams.get('action') === 'add');
  const [showImportModal, setShowImportModal] = useState(searchParams.get('action') === 'import');
  const [filter, setFilter] = useState({ type: '', category: '', search: '' });

  const [newTx, setNewTx] = useState({
    amount: '', type: 'EXPENSE', category: '', merchant: '', description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchTx = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (filter.type) params.set('type', filter.type);
    if (filter.category) params.set('category', filter.category);
    if (filter.search) params.set('search', filter.search);

    const res = await fetch(`/api/transactions?${params}`);
    const data = await res.json();
    if (res.ok) {
      setTransactions(data.transactions);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchTx(1); }, [fetchTx]);

  const handleSave = async () => {
    setSaveError('');
    if (!newTx.amount || parseFloat(newTx.amount) <= 0) {
      setSaveError('أدخل مبلغًا صحيحًا');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newTx,
        date: new Date(newTx.date).toISOString(),
        currency: 'SAR',
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setShowAddModal(false);
      setNewTx({ amount: '', type: 'EXPENSE', category: '', merchant: '', description: '',
        date: new Date().toISOString().slice(0, 10) });
      fetchTx(1);
    } else {
      setSaveError(data.error || 'حدث خطأ');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذه العملية؟')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    fetchTx(pagination.page);
  };

  const handleImport = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/transactions/import-csv', { method: 'POST', body: fd });
    const data = await res.json();
    alert(data.message || (res.ok ? 'تم الاستيراد' : 'فشل الاستيراد'));
    if (res.ok) { setShowImportModal(false); fetchTx(1); }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>العمليات المالية</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary text-sm">📁 استيراد CSV</button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">➕ إضافة عملية</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="بحث..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="input flex-1 min-w-40"
        />
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="input w-auto">
          <option value="">كل الأنواع</option>
          <option value="EXPENSE">مصروف</option>
          <option value="INCOME">دخل</option>
          <option value="TRANSFER">تحويل</option>
        </select>
        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="input w-auto">
          <option value="">كل الفئات</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>جاري التحميل...</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">💳</p>
            <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>لا توجد عمليات بعد</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>أضف عملية يدويًا أو استورد ملف CSV</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  {['التاريخ', 'الجهة / الوصف', 'الفئة', 'المصدر', 'المبلغ', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-right"
                      style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-opacity-50"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {tx.merchant || tx.description || '—'}
                        {tx.isDuplicate && <span className="badge badge-yellow mr-2 text-xs">مكرر</span>}
                      </p>
                      {tx.merchant && tx.description && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tx.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-gray text-xs">{tx.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {tx.source === 'ANDROID_NOTIFICATION' ? '🤖 تلقائي' :
                       tx.source === 'CSV_IMPORT' ? '📁 CSV' : '✍️ يدوي'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold whitespace-nowrap"
                      style={{ color: tx.type === 'INCOME' ? 'var(--success)' : 'var(--danger)' }}>
                      {formatAmount(tx.amount, tx.type)} ر.س
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(tx.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                        style={{ color: 'var(--text-muted)' }}>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t"
            style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {pagination.total} عملية إجمالية
            </p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1}
                onClick={() => fetchTx(pagination.page - 1)}
                className="btn-secondary text-sm px-3 py-1 disabled:opacity-50">السابق</button>
              <span className="text-sm px-3 py-1" style={{ color: 'var(--text)' }}>
                {pagination.page} / {pagination.pages}
              </span>
              <button disabled={pagination.page >= pagination.pages}
                onClick={() => fetchTx(pagination.page + 1)}
                className="btn-secondary text-sm px-3 py-1 disabled:opacity-50">التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>إضافة عملية جديدة</h2>
            {saveError && <div className="text-red-600 text-sm mb-3">{saveError}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>النوع</label>
                  <select value={newTx.type} onChange={(e) => setNewTx({ ...newTx, type: e.target.value })} className="input">
                    <option value="EXPENSE">مصروف</option>
                    <option value="INCOME">دخل</option>
                    <option value="TRANSFER">تحويل</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>المبلغ (ر.س)</label>
                  <input type="number" step="0.01" min="0" value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    className="input" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>الفئة</label>
                <select value={newTx.category} onChange={(e) => setNewTx({ ...newTx, category: e.target.value })} className="input">
                  <option value="">تلقائي</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>الجهة / التاجر</label>
                <input type="text" value={newTx.merchant}
                  onChange={(e) => setNewTx({ ...newTx, merchant: e.target.value })}
                  className="input" placeholder="مثال: ماكدونالدز" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>وصف (اختياري)</label>
                <input type="text" value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="input" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text)' }}>التاريخ</label>
                <input type="date" value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  className="input" dir="ltr" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">إلغاء</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>استيراد من CSV</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              يدعم ملفات CSV بأعمدة: date, amount, type, merchant, description, category
            </p>
            <input type="file" accept=".csv,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
              className="w-full text-sm mb-4" style={{ color: 'var(--text)' }} />
            <button onClick={() => setShowImportModal(false)} className="btn-secondary w-full">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
}
