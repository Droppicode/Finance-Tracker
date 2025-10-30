"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api import views

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'investments', views.InvestmentViewSet, basename='investment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/process-statement/', views.ProcessStatementView.as_view(), name='process_statement'),
    path('api/profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('api/profile-picture-proxy/', views.ProfilePictureProxyView.as_view(), name='profile_picture_proxy'),
    path('api/investments/search/', views.InvestmentSearchView.as_view(), name='investment_search'),
    path('api/investments/quote/', views.InvestmentQuoteView.as_view(), name='investment_quote'),
    path('api/', include(router.urls)),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/google/', views.GoogleLogin.as_view(), name='google_login'),
    path('accounts/', include('allauth.urls')),
]
