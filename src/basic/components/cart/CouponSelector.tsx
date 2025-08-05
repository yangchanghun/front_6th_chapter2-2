import { useCallback } from 'react';

import { Coupon } from '../../../types';
type NotificationType = 'error' | 'success' | 'warning';
type CartTotals = {
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
};
interface CouponSelectorProps {
  coupons: Coupon[];
  setSelectedCoupon: (coupon: Coupon | null) => void;
  selectedCoupon: Coupon | null;
  calculateCartTotal: () => CartTotals;
  addNotification: (message: string, type?: NotificationType) => void;
}

export default function CouponSelector({
  coupons,
  selectedCoupon,
  setSelectedCoupon,
  calculateCartTotal,
  addNotification,
}: CouponSelectorProps) {
  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = calculateCartTotal().totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === 'percentage') {
        addNotification('percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.', 'error');
        return;
      }

      setSelectedCoupon(coupon);
      addNotification('쿠폰이 적용되었습니다.', 'success');
    },
    [addNotification, calculateCartTotal]
  );
  return (
    <section className='bg-white rounded-lg border border-gray-200 p-4'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm font-semibold text-gray-700'>쿠폰 할인</h3>
        <button className='text-xs text-blue-600 hover:underline'>쿠폰 등록</button>
      </div>
      {coupons.length > 0 && (
        <select
          className='w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500'
          value={selectedCoupon?.code || ''}
          onChange={(e) => {
            const coupon = coupons.find((c) => c.code === e.target.value);
            if (coupon) applyCoupon(coupon);
            else setSelectedCoupon(null);
          }}
        >
          <option value=''>쿠폰 선택</option>
          {coupons.map((coupon) => (
            <option key={coupon.code} value={coupon.code}>
              {coupon.name} (
              {coupon.discountType === 'amount'
                ? `${coupon.discountValue.toLocaleString()}원`
                : `${coupon.discountValue}%`}
              )
            </option>
          ))}
        </select>
      )}
    </section>
  );
}
