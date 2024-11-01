import { Component, inject, OnInit } from '@angular/core';
import { Order } from '../../models/order';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-orders',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './list-orders.component.html',
  styleUrl: './list-orders.component.css'
})
export class ListOrdersComponent implements OnInit{

  private readonly service = inject(OrderService)
  // creamos una lista para manejar los datos
  listOrders: Order[] = [];
  searchTerm: string = '';

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
    this.service.getAllOrders().subscribe({
      next: (data: Order[]) => this.listOrders = data,
      error : (err) => console.log(err),
      complete : () => console.log("complete")
    })
  }

  // metodo para filtrar por el nombe y por el email
  filteredOrders() {
    return this.listOrders.filter(order =>
      order.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Método para obtener la cantidad total de ítems en una orden
  getTotalItems(order: Order): number {
    return order.products.reduce((total, product) => total + (product.quantity || 0), 0);
  }
}
