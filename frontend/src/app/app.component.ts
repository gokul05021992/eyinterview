import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastService} from './app/services/forecast.service';
import { ProductService } from './app/services/product.service';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms'; 



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  products: any[] = [];
  forecast: any[] = [];
  forecastYears: number[] = [2020,2021,2022,2023,2024,2025, 2026, 2027,2028];
  selectedYear: number = 2025;
  showAddProductModal = false;
  forecastLookup: { [key: string]: any } = {};
  monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months: string[] = [
    'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    'Jan', 'Feb', 'Mar', 'Apr'
  ];
  newProduct: any = {
    name: '',
    planner: '',
    brand: '',
    az_local_code: '',
    az_global_code: '',
    material_type: ''
  };
  showAddForecastModal = false;
  newForecast = {
    product: '',
    planner: '',
    brand: '',
    year: this.selectedYear,
    month: null,
    apo: 0,
    current: 0,
    comment: '',
    completed: false
  };

  planners: string[] = ['Alice', 'Bob'];
  brands: string[] = ['Brand A', 'Brand B'];
  localCodes: string[] = ['L001', 'L002'];
  globalCodes: string[] = ['G001', 'G002'];
  materialTypes: string[] = ['Type 1', 'Type 2'];

  selectedPlanner = '';
  selectedBrand = '';
  selectedLocalCode = '';
  selectedGlobalCode = '';
  selectedMaterialType = '';

  constructor(
    private forecastService: ForecastService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  resetFilters() {
    this.selectedPlanner = '';
    this.selectedBrand = '';
    this.selectedLocalCode = '';
    this.selectedGlobalCode = '';
    this.selectedMaterialType = '';
  }

  loadProducts() {
    this.productService.getProducts().subscribe((res) => {
      this.products = res;
      this.planners = [...new Set(res.map(p => p.planner).filter(Boolean))];
      this.brands = [...new Set(res.map(p => p.brand).filter(Boolean))];
      this.localCodes = [...new Set(res.map(p => p.az_local_code).filter(Boolean))];
      this.globalCodes = [...new Set(res.map(p => p.az_global_code).filter(Boolean))];
      this.materialTypes = [...new Set(res.map(p => p.material_type).filter(Boolean))];
    });
    this.forecastService.getForecasts().subscribe((res) => {
      this.forecast = res;
      this.forecastLookup = {};
      for (const f of res) {
        const monthStr = this.monthNames[f.month - 1]; // convert 6 → "Jun"
        const key = `${f.product}-${f.year}-${monthStr}`;
        this.forecastLookup[key] = f;
      }
    });
  }

  resetNewProduct() {
    this.newProduct = {
      name: '',
      planner: '',
      brand: '',
      az_local_code: '',
      az_global_code: '',
      material_type: ''
    };
  }

  submitNewProduct() {
    this.productService.createProduct(this.newProduct).subscribe(() => {
      this.loadProducts();
      this.showAddProductModal = false;
      this.newProduct = {
        name: '',
        planner: '',
        brand: '',
        az_local_code: '',
        az_global_code: '',
        material_type: '',
      };
    });
  }
  

  downloadExcel() {
    this.productService.downloadExcel().subscribe({
      next: (blob) => {
        const filename = 'forecast_export.xlsx';
        saveAs(blob, filename);
      },
      error: (err) => {
        console.error('Error downloading Excel file', err);
      },
    });
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== productId);
        },
        error: err => {
          console.error('Error deleting product:', err);
        }
      });
    }
  }
}
