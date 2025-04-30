from django.urls import path
from django.contrib import admin
from .views import ProductListView, assistant_query, analyze_shifts

urlpatterns = [
    path('admin/', admin.site.urls),
    path('product/', ProductListView.as_view(), name='product-list'),
    path('assistant-query/', assistant_query, name='assistant-query'),
    path('analyze/', analyze_shifts, name='analyze-shifts'),
]
