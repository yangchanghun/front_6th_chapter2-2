import { getMaxApplicableDiscount } from './discount';
import { CartItem } from '../../types';
import { Product } from '../../types';
export const calculateItemTotal = (item: CartItem, cart: CartItem[]): number => {
  const hasBulkPurchase = cart.some((item) => item.quantity >= 10);

  const { price } = item.product;
  const { quantity } = item;
  const discount = getMaxApplicableDiscount(item, hasBulkPurchase);

  return Math.round(price * quantity * (1 - discount));
};

// 재교 확인
export const getRemainingStock = (product: Product, cart: CartItem[]): number => {
  const cartItem = cart.find((item) => item.product.id === product.id);
  const remaining = product.stock - (cartItem?.quantity || 0);

  return remaining;
};
