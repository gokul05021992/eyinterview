from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ForecastEntryViewSet,export_forecast_to_excel

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'forecast-entries', ForecastEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('export/excel/', export_forecast_to_excel, name='export-forecast-excel')
]