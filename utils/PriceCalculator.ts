import { SelectedCustomization } from '@/types';

export class PriceCalculator {
  static calculateCustomizationPrice(customizations: SelectedCustomization[]): number {
    return customizations.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  static calculateTotalPrice(
    basePrice: number, 
    quantity: number, 
    customizations: SelectedCustomization[]
  ): number {
    const customizationPrice = this.calculateCustomizationPrice(customizations);
    return (basePrice + customizationPrice) * quantity;
  }

  static formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }
}
