from django.db import models

# Create your models here.

class Product(models.Model):
    name = models.CharField(max_length=255)
    planner = models.CharField(max_length=100, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    az_local_code = models.CharField(max_length=100, blank=True, null=True)
    az_global_code = models.CharField(max_length=100, blank=True, null=True)
    material_type = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name


class ForecastEntry(models.Model):
    product = models.ForeignKey(Product, related_name='forecasts', on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()  # 1 = Jan, 12 = Dec

    apo_value = models.IntegerField(default=0)
    current_value = models.IntegerField(default=0)

    comment = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    class Meta:
        unique_together = ('product', 'year', 'month')  # Avoid duplicate forecast per product-month

    def __str__(self):
        return f"{self.product.name} - {self.month}/{self.year}"
