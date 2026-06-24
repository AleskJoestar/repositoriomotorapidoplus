import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { partService } from '@/services/partService';
import { saleService } from '@/services/saleService';
import { Part } from '@/types/part';
import {
  Sale,
  SaleItem,
  PAYMENT_METHODS,
  PaymentMethod,
  formatCurrency,
  LOW_STOCK_THRESHOLD,
} from '@/types/sale';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { MasterAuthModal } from '@/components/MasterAuthModal';
import { useLiveClock } from '@/hooks/useLiveClock';

export const Sales: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user, accessToken } = useAuth();
  const { isMaster, canAccessReports } = usePermissions();
  const liveClock = useLiveClock();

  const [products, setProducts] = useState<Part[]>([]);
  const [sale, setSale] = useState<Sale | null>(null);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingPartId, setRemovingPartId] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [amountPaid, setAmountPaid] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [masterModal, setMasterModal] = useState<{ open: boolean; partId: number | null }>({
    open: false,
    partId: null,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  const cartItems: SaleItem[] = sale?.items ?? [];

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === Number(selectedPartId)),
    [products, selectedPartId]
  );

  const unitPrice = selectedProduct?.price ?? 0;
  const lineTotal = unitPrice * quantity;
  const cartTotal = sale?.totalAmount ?? 0;

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'DINHEIRO') return 0;
    const paid = parseFloat(amountPaid.replace(',', '.')) || 0;
    return Math.max(0, paid - cartTotal);
  }, [paymentMethod, amountPaid, cartTotal]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [partsResult, saleResult] = await Promise.allSettled([
        partService.getAllParts({ status: 'Ativo' }),
        saleService.getCurrent(),
      ]);

      if (partsResult.status === 'fulfilled') {
        setProducts(partsResult.value);
      } else {
        setToast({
          message:
            (partsResult.reason as { response?: { data?: { error?: string } } })?.response?.data
              ?.error || 'Erro ao carregar produtos',
          type: 'error',
        });
      }

      if (saleResult.status === 'fulfilled') {
        setSale(saleResult.value);
      } else {
        setSale(null);
        setToast({
          message:
            (saleResult.reason as { response?: { data?: { error?: string } } })?.response?.data
              ?.error || 'Erro ao carregar carrinho — tente novamente',
          type: 'error',
        });
      }
    } catch {
      setToast({ message: 'Erro ao carregar dados do caixa', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    loadData();
  }, [accessToken]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddToCart = async () => {
    if (!selectedPartId) {
      setToast({ message: 'Selecione um produto', type: 'error' });
      return;
    }

    const partId = Number(selectedPartId);
    if (cartItems.some((item) => item.partId === partId)) {
      setToast({ message: 'Produto já está no carrinho', type: 'error' });
      return;
    }

    setAdding(true);
    try {
      const updated = await saleService.addItem(partId, quantity);
      setSale(updated);
      setSelectedPartId('');
      setQuantity(1);
      const partsData = await partService.getAllParts({ status: 'Ativo' });
      setProducts(partsData);
      setToast({ message: 'Produto adicionado — estoque atualizado', type: 'success' });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao adicionar produto',
        type: 'error',
      });
    } finally {
      setAdding(false);
    }
  };

  const executeRemove = async (
    partId: number,
    masterCredentials?: { masterEmail: string; masterSenha: string }
  ) => {
    setRemovingPartId(partId);
    try {
      const updated = await saleService.removeItem(partId, masterCredentials);
      setSale(updated.items.length > 0 ? updated : null);
      const partsData = await partService.getAllParts({ status: 'Ativo' });
      setProducts(partsData);
      setToast({ message: 'Item removido — estoque devolvido', type: 'success' });
      setMasterModal({ open: false, partId: null });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao remover item',
        type: 'error',
      });
      throw err;
    } finally {
      setRemovingPartId(null);
    }
  };

  const handleRemoveClick = (partId: number) => {
    if (isMaster) {
      executeRemove(partId);
      return;
    }
    setMasterModal({ open: true, partId });
  };

  const handleMasterConfirm = async (email: string, senha: string) => {
    if (!masterModal.partId) return;
    await executeRemove(masterModal.partId, { masterEmail: email, masterSenha: senha });
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setToast({ message: 'Carrinho vazio', type: 'error' });
      return;
    }

    if (paymentMethod === 'DINHEIRO') {
      const paid = parseFloat(amountPaid.replace(',', '.')) || 0;
      if (paid < cartTotal) {
        setToast({ message: 'Valor pago é menor que o total da venda', type: 'error' });
        return;
      }
    }

    setCheckingOut(true);
    try {
      const payload: { paymentMethod: PaymentMethod; amountPaid?: number } = {
        paymentMethod,
      };
      if (paymentMethod === 'DINHEIRO') {
        payload.amountPaid = parseFloat(amountPaid.replace(',', '.')) || 0;
      }

      await saleService.checkout(payload);
      setSale(null);
      setCheckoutOpen(false);
      setPaymentMethod('PIX');
      setAmountPaid('');
      setToast({ message: 'Venda finalizada com sucesso', type: 'success' });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao finalizar venda',
        type: 'error',
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const availableProducts = products.filter(
    (p) => !cartItems.some((item) => item.partId === p.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Caixa — MotoRapido PLUS</h1>
            <p className="text-sm font-mono text-gray-600 mt-1">{liveClock}</p>
          </div>
          <div className="flex gap-4">
            {canAccessReports && (
              <Button variant="secondary" onClick={() => navigate('/sales/report')}>
                Relatório
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/parts')}>
              ← Estoque
            </Button>
            {user?.accessType === 'MASTER' && (
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Início
              </Button>
            )}
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Adicionar Produto</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                disabled={loading || adding}
              >
                <option value="">Selecione o produto</option>
                {availableProducts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.code} — {part.name} (Est: {part.quantity}
                    {part.quantity <= LOW_STOCK_THRESHOLD ? ' ⚠' : ''})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="number"
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                disabled={adding}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário</label>
              <input
                type="text"
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                value={formatCurrency(unitPrice)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Total</label>
              <input
                type="text"
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 font-semibold"
                value={formatCurrency(lineTotal)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddToCart} loading={adding} disabled={!selectedPartId}>
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Carrinho</h2>
            <span className="text-lg font-semibold text-green-700">
              Total: {formatCurrency(cartTotal)}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-gray-500 py-16">Carrinho vazio</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Produto</th>
                    <th className="px-6 py-3 text-center">Quantidade</th>
                    <th className="px-6 py-3 text-right">Preço Unitário</th>
                    <th className="px-6 py-3 text-right">Preço Total</th>
                    <th className="px-6 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs text-gray-500">{item.partCode}</span>
                        <br />
                        {item.partName}
                      </td>
                      <td className="px-6 py-3 text-center">{item.quantity}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-6 py-3 text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleRemoveClick(item.partId)}
                          disabled={removingPartId === item.partId}
                          className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-medium"
                          title="Remover item"
                        >
                          {removingPartId === item.partId ? '...' : 'Remover'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 border-t flex justify-end">
            <Button
              onClick={() => setCheckoutOpen(true)}
              disabled={cartItems.length === 0}
              className="min-w-[200px]"
            >
              Finalizar Venda
            </Button>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => !checkingOut && setCheckoutOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Finalizar Venda</h2>
            <p className="text-gray-600 mb-4">
              Total da venda: <strong>{formatCurrency(cartTotal)}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pagamento
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                disabled={checkingOut}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {paymentMethod === 'DINHEIRO' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Pago</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    disabled={checkingOut}
                    placeholder="0,00"
                  />
                </div>
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Troco: </span>
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setCheckoutOpen(false)}
                disabled={checkingOut}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCheckout}
                loading={checkingOut}
                disabled={
                  checkingOut ||
                  (paymentMethod === 'DINHEIRO' &&
                    (parseFloat(amountPaid.replace(',', '.')) || 0) < cartTotal)
                }
              >
                Confirmar Venda
              </Button>
            </div>
          </div>
        </div>
      )}

      <MasterAuthModal
        open={masterModal.open}
        loading={removingPartId !== null}
        onConfirm={handleMasterConfirm}
        onCancel={() => setMasterModal({ open: false, partId: null })}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
