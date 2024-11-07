import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/order';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly http = inject(HttpClient);

  private url = "http://localhost:3000/";

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.url}products`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.url}orders`);
  }

  getOrderByEmail(email: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.url}orders?email=${email}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.url}orders`, order);
  }

}
