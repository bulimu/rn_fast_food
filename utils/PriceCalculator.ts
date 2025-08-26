import { CartCustomization } from '@/types';

export class PriceCalculator {
  static calculateCustomizationPrice(customizations: CartCustomization[]): number {
    return customizations.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1)); // Default quantity to 1 if undefined
    }, 0);
  }

  static calculateTotalPrice(
    basePrice: number, 
    quantity: number, 
    customizations: CartCustomization[]
  ): number {
    const customizationPrice = this.calculateCustomizationPrice(customizations);
    return (basePrice + customizationPrice) * quantity;
  }

  static formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
