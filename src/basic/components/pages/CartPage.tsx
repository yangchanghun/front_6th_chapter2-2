import { useCallback } from 'react';

import { CartItem, Coupon } from '../../../types';
import { ProductWithUI } from '../../App';
import CartItemList from '../cart/CartItemList';
import CouponSelector from '../cart/CouponSelector';
import EmptyCart from '../cart/EmptyCart';
import ProductList from '../cart/ProductList';
type NotificationType = 'error' | 'success' | 'warning';

type CartPageProps = {
  products: ProductWithUI[];
  filteredProducts: ProductWithUI[];
  searchProductName: string;
  cart: CartItem[];
  calculateItemTotal: (item: CartItem) => number;
  getRemainingStock: (product: ProductWithUI) => number;
  formatPrice: (price: number, productId?: string) => string;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  setSelectedCoupon: (coupon: Coupon | null) => void;
  completeOrder: () => void;
  addNotification: (message: string, type?: NotificationType) => void;
};

export default function CartPage({
  products,
  filteredProducts,
  searchProductName,
  getRemainingStock,
  formatPrice,
  calculateItemTotal,
  cart,
  coupons,
  selectedCoupon,
  setSelectedCoupon,
  completeOrder,
  setCart,
  addNotification,
}: CartPageProps) {
  const calculateCartTotal = (): {
    totalBeforeDiscount: number;
    totalAfterDiscount: number;
  } => {
    let totalBeforeDiscount = 0;
    let totalAfterDiscount = 0;

    cart.forEach((item) => {
      const itemPrice = item.product.price * item.quantity;
      totalBeforeDiscount += itemPrice;
      totalAfterDiscount += calculateItemTotal(item);
    });

    if (selectedCoupon) {
      if (selectedCoupon.discountType === 'amount') {
        totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
      } else {
        totalAfterDiscount = Math.round(
          totalAfterDiscount * (1 - selectedCoupon.discountValue / 100)
        );
      }
    }

    return {
      totalBeforeDiscount: Math.round(totalBeforeDiscount),
      totalAfterDiscount: Math.round(totalAfterDiscount),
    };
  };

  const totals = calculateCartTotal();

  const addToCart = useCallback(
    (product: ProductWithUI) => {
      const remainingStock = getRemainingStock(product);
      if (remainingStock <= 0) {
        addNotification('재고가 부족합니다!', 'error');
        return;
      }

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;

          if (newQuantity > product.stock) {
            addNotification(`재고는 ${product.stock}개까지만 있습니다.`, 'error');
            return prevCart;
          }

          return prevCart.map((item) =>
            item.product.id === product.id ? { ...item, quantity: newQuantity } : item
          );
        }

        return [...prevCart, { product, quantity: 1 }];
      });

      addNotification('장바구니에 담았습니다', 'success');
    },
    [cart, addNotification, getRemainingStock]
  );

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='lg:col-span-3'>
        {/* 상품 목록 */}
        <ProductList
          filteredProducts={filteredProducts}
          products={products}
          searchProductName={searchProductName}
          getRemainingStock={getRemainingStock}
          addToCart={addToCart}
          formatPrice={formatPrice}
        />
      </div>

      <div className='lg:col-span-1'>
        <div className='sticky top-24 space-y-4'>
          <section className='bg-white rounded-lg border border-gray-200 p-4'>
            <h2 className='text-lg font-semibold mb-4 flex items-center'>
              <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                />
              </svg>
              장바구니
            </h2>
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              <CartItemList
                cart={cart}
                calculateItemTotal={calculateItemTotal}
                getRemainingStock={getRemainingStock}
                addNotification={addNotification}
                setCart={setCart}
                products={products}
              />
            )}
          </section>

          {cart.length > 0 && (
            <>
              <CouponSelector
                coupons={coupons}
                selectedCoupon={selectedCoupon}
                setSelectedCoupon={setSelectedCoupon}
                calculateCartTotal={calculateCartTotal}
                addNotification={addNotification}
              />

              <section className='bg-white rounded-lg border border-gray-200 p-4'>
                <h3 className='text-lg font-semibold mb-4'>결제 정보</h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>상품 금액</span>
                    <span className='font-medium'>
                      {totals.totalBeforeDiscount.toLocaleString()}원
                    </span>
                  </div>
                  {totals.totalBeforeDiscount - totals.totalAfterDiscount > 0 && (
                    <div className='flex justify-between text-red-500'>
                      <span>할인 금액</span>
                      <span>
                        -{(totals.totalBeforeDiscount - totals.totalAfterDiscount).toLocaleString()}
                        원
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between py-2 border-t border-gray-200'>
                    <span className='font-semibold'>결제 예정 금액</span>
                    <span className='font-bold text-lg text-gray-900'>
                      {totals.totalAfterDiscount.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <button
                  onClick={completeOrder}
                  className='w-full mt-4 py-3 bg-yellow-400 text-gray-900 rounded-md font-medium hover:bg-yellow-500 transition-colors'
                >
                  {totals.totalAfterDiscount.toLocaleString()}원 결제하기
                </button>

                <div className='mt-3 text-xs text-gray-500 text-center'>
                  <p>* 실제 결제는 이루어지지 않습니다</p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
