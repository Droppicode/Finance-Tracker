from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from . import services
from .models import Transaction, Category, UserProfile, Investment, OtherInvestment
from .serializers import TransactionSerializer, CategorySerializer, UserProfileSerializer, InvestmentSerializer, OtherInvestmentSerializer
import os
import logging
import requests
from django.http import HttpResponse
from datetime import date, timedelta
from . import brapi_api
from . import bcb_api

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:5173'
    client_class = OAuth2Client

class ProcessStatementView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if 'statement' not in request.data:
            return Response({'error': 'No statement file found'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.data['statement']
        
        try:
            text = services.extract_text_from_pdf(file)
            extracted_transactions = services.extract_transactions_from_text(text)

            created_transactions = []
            for t_data in extracted_transactions:
                category_name = t_data.pop('category', None)
                category = None
                if category_name:
                    category, _ = Category.objects.get_or_create(user=request.user, name=category_name)

                lookup_fields = {
                    'user': request.user,
                    'date': t_data.get('date'),
                    'amount': t_data.get('amount'),
                    'type': t_data.get('type'),
                }

                defaults = {
                    'description': t_data.get('description'),
                    'category': category
                }

                transaction, created = Transaction.objects.get_or_create(
                    **lookup_fields,
                    defaults=defaults
                )

                if created:
                    serializer = TransactionSerializer(transaction)
                    created_transactions.append(serializer.data)

            return Response(created_transactions, status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Error processing statement")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        today = date.today()
        if created or not profile.last_login or profile.last_login < today:
            profile.last_login = today
            profile.end_date = today
            profile.start_date = today - timedelta(days=30)
            profile.save()

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InvestmentSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        symbol = request.query_params.get('symbol')
        if not symbol:
            return Response({'error': 'Parâmetro "symbol" é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            results = brapi_api.search_symbol(symbol)
            return Response(results.get('stocks', []), status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Error searching investment symbol")
            return Response({'error': 'Erro ao buscar símbolo de investimento.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InvestmentQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        symbol = request.query_params.get('symbol', None)
        if not symbol:
            return Response({"error": "Símbolo não fornecido"}, status=400)
        
        symbol_without_suffix = symbol.replace('.SA', '')

        try:
            data = brapi_api.get_quote(symbol_without_suffix)
            quote_data = data.get('results', [{}])[0]
            return Response(quote_data)
        except Exception as e:
            logging.exception("Error getting investment quote")
            return Response({'error': 'Erro ao buscar cotação do investimento.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class IndexDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            cdi_data = bcb_api.get_cdi()
            selic_data = bcb_api.get_selic()
            ipca_data = bcb_api.get_ipca()
            igpm_data = bcb_api.get_igpm()

            data = {
                'CDI': cdi_data,
                'SELIC': selic_data,
                'IPCA': ipca_data,
                'IGPM': igpm_data,
            }
            return Response(data)
        except Exception as e:
            logging.exception("Error fetching index data")
            return Response({"error": str(e)}, status=500)

class InvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentSerializer
    queryset = Investment.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OtherInvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = OtherInvestmentSerializer
    queryset = OtherInvestment.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProfilePictureProxyView(APIView):
    def get(self, request, *args, **kwargs):
        image_url = request.query_params.get('url')
        if not image_url:
            return Response({'error': 'URL da imagem não fornecida.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.get(image_url, stream=True)
            response.raise_for_status()

            content_type = response.headers.get('Content-Type', 'application/octet-stream')
            
            http_response = HttpResponse(response.iter_content(chunk_size=8192), content_type=content_type)
            http_response['Access-Control-Allow-Origin'] = '*'
            return http_response

        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching image from {image_url}: {e}")
            return Response({'error': f'Erro ao buscar imagem: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logging.error(f"Unexpected error in ProfilePictureProxyView: {e}")
            return Response({'error': f'Erro interno do servidor: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
