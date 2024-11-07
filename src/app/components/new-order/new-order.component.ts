import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators, ValueChangeEvent } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Product } from '../../models/product';
import { Order } from '../../models/order';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-new-order',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './new-order.component.html',
  styleUrl: './new-order.component.css'
})
export class NewOrderComponent implements OnInit{

  private readonly service = inject(OrderService);
  private readonly formBuilder = inject(FormBuilder);

  total = 0;
  hasDiscount = false;
  products: Product[] = [];
 
  orderForm: FormGroup = new FormGroup({
    customerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email], [this.emailOrderLimitValidator()]),

    products: new FormArray([], [Validators.required, this.uniqueProductValidator])
  });

  ngOnInit() {
    this.loadProducts();
  }

  // validacion sincronica personalizada de que no existan duplicados
  uniqueProductValidator(productsArray: FormArray): ValidationErrors | null {
    const selectedProductIds = productsArray.controls.map(control => control.get('productId')?.value as Number);
    const hasDuplicates = selectedProductIds.some((id, index) => selectedProductIds.indexOf(id) !== index);
    return hasDuplicates ? {duplicateProduct: true} : null;
  }

  // validacion asincrona del email
  emailOrderLimitValidator(): AsyncValidatorFn { 
    return (control: AbstractControl) : Observable<ValidationErrors | null> => {
      if(!control.value){
        return of(null)
      }

      return this.service.getOrderByEmail(control.value).pipe(
        tap((orders) => {
          console.log("Ordenes obtenidas: ", orders)
        }),
        map(orders => {
          // obtnemos la fecha actul
          const now = new Date();
          // filtramos los pedidos de las ultimas 24 hs
          const recentOrders = orders.filter(order => {
            const orderDate = order.timestamp ? new Date(order.timestamp) : new Date();
            const differenceInMilliseconds = now.getTime() - orderDate.getTime();
            console.log("diferencia en milisegundos ", differenceInMilliseconds);

            // convertimos la fecha a hora 
            const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
            console.log("diferencia en horas ", differenceInHours);

            return differenceInHours <= 24;
          })

          // si hay mas de 3 pedidos
          if(recentOrders.length >= 3){
            console.log("Error al validar el limite de pedidos", recentOrders);
            return {errorPedido: true};
          }

          return null;
          
        }),
        catchError((error) => {
          console.log("Error al validar el pedido", error);
          return of(null)
        })
      )
    }
  }

  get productsFromArray() {
    return this.orderForm.get('products') as FormArray;
  }

  addProduct() {
    const productForm: FormGroup = new FormGroup({
      productId: new FormControl(''),
      quantity: new FormControl(1),
      price: new FormControl(0),
      stock: new FormControl(0)
    });

    productForm.get('productId')?.valueChanges.subscribe(id => {
      const product = this.products.find(p => p.id === id)

      if(product) {
        // actualizar el precio y el stok cuando se selecciona un producto
        productForm.patchValue({
          price: product.price,
          stock: product.stock
        }, { emitEvent: false })

        // actualizar los validadores de cantidad con el valor del stock 
        const quantityControl = productForm.get('quantity');
        quantityControl?.setValidators([
          Validators.required, 
          Validators.min(1), 
          Validators.max(product.stock)
        ])
        quantityControl?.updateValueAndValidity();

        this.calculateTotal();
      }
    })

    productForm.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateTotal()
    })
    this.productsFromArray.push(productForm);
  }

  removeProduct(index: number) {
    this.productsFromArray.removeAt(index);
    this.calculateTotal();
  }

  onSubmit() {
    if (this.orderForm.valid) {
      console.log(this.orderForm.value);
    }
  }

  private loadProducts(): void {
    this.service.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: () => {
        alert("Error al cargar los productos!!")
      }
    })
  }

   calculateTotal(): void {
    let subtotal = 0;

    this.productsFromArray.controls.forEach(control => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;

      subtotal += quantity * price;
    })

    this.hasDiscount = subtotal > 1000;
    this.total = this.hasDiscount ? subtotal * 0.9 : subtotal;
  }
}
