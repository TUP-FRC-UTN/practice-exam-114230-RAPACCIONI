import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly http = inject(HttpClient);

  private url = "http://localhost:3000/";

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.url}orders`);
  }

  newOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.url}products`, order);
  }

}
