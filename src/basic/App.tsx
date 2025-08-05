import { useState, useCallback, useEffect } from 'react';

import { CartItem, Coupon, Product } from '../types';
import Header from './components/Header';
import AdminPage from './components/pages/AdminPage';
import CartPage from './components/pages/CartPage';
import UIToast from './components/ui/UIToast';
import { useCart } from './hooks/useCart';
import { useCoupons } from './hooks/useCouponts';
import { useProducts } from './hooks/useProducts';
import { getMaxApplicableDiscount } from './utils/discount';
export interface ProductWithUI extends Product {
  description?: string;
  isRecommended?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning';
}

const App = () => {
  const { products, setProducts } = useProducts();
  const { coupons, setCoupons } = useCoupons();
  const { cart, setCart } = useCart();

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'coupons'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchProductName, setSearchProductName] = useState('');

  // Admin

  // 쿠폰 입력폼

  // 숫자포매팅
  const formatPrice = (price: number, productId?: string): string => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product && getRemainingStock(product) <= 0) {
        return 'SOLD OUT';
      }
    }

    if (isAdmin) {
      return `${price.toLocaleString()}원`;
    }

    return `₩${price.toLocaleString()}`;
  };

  const hasBulkPurchase = cart.some((item) => item.quantity >= 10);

  // 계산기
  const calculateItemTotal = (item: CartItem): number => {
    const { price } = item.product;
    const { quantity } = item;
    const discount = getMaxApplicableDiscount(item, hasBulkPurchase);

    return Math.round(price * quantity * (1 - discount));
  };

  // 재교 확인
  const getRemainingStock = (product: Product): number => {
    const cartItem = cart.find((item) => item.product.id === product.id);
    const remaining = product.stock - (cartItem?.quantity || 0);

    return remaining;
  };

  // 알림추가
  const addNotification = useCallback(
    (message: string, type: 'error' | 'success' | 'warning' = 'success') => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    []
  );

  const [totalItemCount, setTotalItemCount] = useState(0);

  // 카트 아이템 수 계산
  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);
  // products설정
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // 쿠폰 설정
  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);
  // 장바구니 설정
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // 검색시
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchProductName(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 재고 추가

  // 주문 완료
  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, 'success');
    setCart([]);
    setSelectedCoupon(null);
  }, [addNotification]);

  // 상품추가

  // 상품 수정

  // 상품삭제

  // 쿠폰 추가

  // 수정버튼클릭시

  // 상품 필터링
  const filteredProducts = searchProductName
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchProductName.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(searchProductName.toLowerCase()))
      )
    : products;

  return (
    <div className='min-h-screen bg-gray-50'>
      {notifications.length > 0 && (
        <UIToast notifications={notifications} setNotifications={setNotifications} />
      )}
      <Header
        isAdmin={isAdmin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cart={cart}
        totalItemCount={totalItemCount}
        setIsAdmin={setIsAdmin}
      />

      <main className='max-w-7xl mx-auto px-4 py-8'>
        {isAdmin ? (
          <AdminPage
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            products={products}
            formatPrice={formatPrice}
            addNotification={addNotification}
            coupons={coupons}
            setProducts={setProducts}
            setCoupons={setCoupons}
            selectedCoupon={selectedCoupon}
            setSelectedCoupon={setSelectedCoupon}
          />
        ) : (
          <CartPage
            products={products}
            filteredProducts={filteredProducts}
            searchProductName={searchProductName}
            cart={cart}
            calculateItemTotal={calculateItemTotal}
            getRemainingStock={getRemainingStock}
            formatPrice={formatPrice}
            coupons={coupons}
            selectedCoupon={selectedCoupon}
            setSelectedCoupon={setSelectedCoupon}
            completeOrder={completeOrder}
            setCart={setCart}
            addNotification={addNotification}
          />
        )}
      </main>
    </div>
  );
};

export default App;
