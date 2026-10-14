export const USERS = {
  standard: {
    username: process.env.SAUCEDEMO_USERNAME || 'standard_user',
    password: process.env.SAUCEDEMO_PASSWORD || 'secret_sauce',
  },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  performanceGlitch: { username: 'performance_glitch_user', password: 'secret_sauce' },
  error: { username: 'error_user', password: 'secret_sauce' },
  visual: { username: 'visual_user', password: 'secret_sauce' },
};

export type ProductKey =
  | 'backpack'
  | 'bikeLight'
  | 'boltTShirt'
  | 'fleeceJacket'
  | 'onesie'
  | 'redTShirt';

export const PRODUCTS: Record<ProductKey, { dataTestKey: string; name: string; price: number }> = {
  backpack: { dataTestKey: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { dataTestKey: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { dataTestKey: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { dataTestKey: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  onesie: { dataTestKey: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: 7.99 },
  redTShirt: { dataTestKey: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
};

export const ALL_PRODUCT_KEYS = Object.keys(PRODUCTS) as ProductKey[];

export const TAX_RATE = 0.08;

export function money(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function calculateTotals(productKeys: ProductKey[]) {
  const subtotal = productKeys.reduce((sum, key) => sum + PRODUCTS[key].price, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

export const VALID_CHECKOUT_INFO = {
  firstName: 'John',
  lastName: 'Doe',
  postalCode: '12345',
};

export const EXPECTED_TEXT = {
  paymentInfo: 'SauceCard #31337',
  shippingInfo: 'Free Pony Express Delivery',
  completeHeader: 'Thank you for your order!',
};
