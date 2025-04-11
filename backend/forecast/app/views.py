from django.shortcuts import render
from rest_framework import viewsets
from .models import Product, ForecastEntry
from .serializer import ProductSerializer, ForecastEntrySerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.http import HttpResponse
import openpyxl
from .models import ForecastEntry
from openpyxl.styles import Font
from io import BytesIO
from datetime import datetime
from django.utils.timezone import now
from rest_framework.decorators import api_view
from rest_framework.response import Response


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ForecastEntryViewSet(viewsets.ModelViewSet):
    queryset = ForecastEntry.objects.all()
    serializer_class = ForecastEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['year', 'month', 'product__planner', 'product__brand', 'product__az_local_code', 'product__az_global_code', 'product__material_type']


@api_view(['GET'])
def kpi_summary(request):
    total_entries = ForecastEntry.objects.count()
    completed = ForecastEntry.objects.filter(is_completed=True).count()
    with_comments = ForecastEntry.objects.exclude(comment__isnull=True).exclude(comment__exact="").count()

    return Response({
        "total_entries": total_entries,
        "completed_entries": completed,
        "entries_with_comments": with_comments,
    })


def export_forecast_to_excel(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Forecast Data"

    headers = ["Product", "Planner", "Brand", "Year", "Month", "APO", "Current", "Comment", "Completed"]
    ws.append(headers)

    for col in range(1, len(headers) + 1):
        ws.cell(row=1, column=col).font = Font(bold=True)

    queryset = ForecastEntry.objects.select_related('product').all()

    for entry in queryset:
        ws.append([
            entry.product.name,
            entry.product.planner,
            entry.product.brand,
            entry.year,
            entry.month,
            entry.apo_value,
            entry.current_value,
            entry.comment,
            "Yes" if entry.is_completed else "No"
        ])

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = f'attachment; filename=forecast_export_{now().date()}.xlsx'

    wb.save(response)
    return response