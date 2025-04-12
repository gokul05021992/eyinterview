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
  isEditingForecast: boolean = false;  
  showAddForecastModal = false;
  forecastLookup: { [key: string]: any } = {};
  monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  months: string[] = [
    'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    'Jan', 'Feb', 'Mar', 'Apr'
  ];
  selectedMonth = this.months[0];
  newProduct: any = {
    name: '',
    planner: '',
    brand: '',
    az_local_code: '',
    az_global_code: '',
    material_type: ''
  };  
  newForecast = {
    id: undefined, 
    product: 0,
    planner: '',
    brand: '',
    year: this.selectedYear,
    month: 0,
    apo_value: 0,
    current_value: 0,
    comment: '',
    is_completed: false
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

  submitNewForecast() {
    if (this.isEditingForecast && this.newForecast.id) {
      // PUT request for updating forecast using ID
      this.forecastService.updateForecast(this.newForecast.id, this.newForecast).subscribe(() => {
        this.showAddForecastModal = false;
        this.isEditingForecast = false;
        this.loadProducts(); // Refresh data
      });
    } else {
      // POST request for creating forecast
      this.forecastService.createForecast(this.newForecast).subscribe(() => {
        this.loadProducts(); // Reload products and forecasts
        this.showAddForecastModal = false;
        this.newForecast = {
          id:undefined,
          product: 0,
          planner: '',
          brand: '',
          year: this.selectedYear,
          month: 0,
          apo_value: 0,
          current_value: 0,
          comment: '',
          is_completed: false
        };
      });
    }
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

  openEditForecastModal(product: any) {
    const month = this.selectedMonth || this.months[0]; // Match abbreviation
    const forecastKey = `${product.id}-${this.selectedYear}-${month}`;
  
    console.log('Trying to edit forecast for key:', forecastKey);
    console.log('All forecast keys:', Object.keys(this.forecastLookup));
  
    const forecast = this.forecastLookup[forecastKey];
  
    if (forecast) {
      this.newForecast = { ...forecast,id: forecast.id  };
      this.isEditingForecast = true;
      this.showAddForecastModal = true;
    } else {
      alert('No forecast data available for selected month.');
      this.showAddForecastModal = false;
    }
  }
  
  
}
