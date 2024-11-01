import { Routes } from '@angular/router';
import { NewOrderComponent } from './components/new-order/new-order.component';
import { ListOrdersComponent } from './components/list-orders/list-orders.component';

export const routes: Routes = [
    {path: 'create-order', component: NewOrderComponent},
    {path: 'orders', component: ListOrdersComponent},
    {path: '', component: NewOrderComponent}
];
