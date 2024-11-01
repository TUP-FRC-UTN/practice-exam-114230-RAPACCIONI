import { Product } from "./product";

export class Order {
    id?: number;
    customerName: string = '';
    email: string = '';
    products: Product[] = [];
    total: number = 0;
    orderCode: string = '';
    timestamp: Date | undefined;
}
