from rest_framework import serializers
from .models import Product, ForecastEntry

class ForecastEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastEntry
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    forecasts = ForecastEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'