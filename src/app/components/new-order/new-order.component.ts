import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';

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
  orderForm: FormGroup = new FormGroup({
    customerName: new FormControl(['', Validators.required]),
    email: new FormControl(['', [Validators.required, Validators.email]]),
    products: this.formBuilder.array([])
  });
  
  availableProducts = [
    { name: 'Laptop Gaming Pro', price: 999.99, stock: 50 },
    { name: 'Smartphone X12', price: 699.99, stock: 100 }
  ];


  ngOnInit() {

    this.addProduct();
  }

  // get productosFormArray() {
  //   return this.orderForm.get('productos') as FormArray;
  // }

  addProduct() {
    const productForm = this.formBuilder.group({
      producto: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [{ value: '', disabled: true }],
      stock: [{ value: '', disabled: true }]
    });

    // Subscribe to product selection changes
    productForm.get('producto').valueChanges.subscribe(selectedProduct => {
      const product = this.availableProducts.find(p => p.name === selectedProduct);
      if (product) {
        productForm.patchValue({
          precio: product.price,
          stock: product.stock
        });
      }
    });

    this.productosFormArray.push(productForm);
  }

  removeProduct(index: number) {
    this.productosFormArray.removeAt(index);
  }

  calculateTotal(): number {
    const subtotal = this.productosFormArray.controls.reduce((total, control) => {
      const cantidad = control.get('cantidad').value || 0;
      const precio = control.get('precio').value || 0;
      return total + (cantidad * precio);
    }, 0);
    
    // Apply 10% discount
    return subtotal * 0.9;
  }

  onSubmit() {
    if (this.orderForm.valid) {
      console.log(this.orderForm.value);
      // Handle form submission
    }
  }
}
