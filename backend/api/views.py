from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, viewsets
from . import services
from .models import Transaction, Category, UserProfile
from .serializers import TransactionSerializer, CategorySerializer, UserProfileSerializer
import os
import logging

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:5173'
    client_class = OAuth2Client

class ProcessStatementView(APIView):
    parser_classes = (MultiPartParser, FormParser)

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
                
                t_data['category_id'] = category.id if category else None
                
                serializer = TransactionSerializer(data=t_data)
                if serializer.is_valid():
                    serializer.save(user=request.user)
                    created_transactions.append(serializer.data)
                else:
                    # Handle serializer errors if necessary
                    logging.error(f"Error saving transaction: {serializer.errors}")

            return Response(created_transactions, status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Error processing statement")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    queryset = Transaction.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileView(APIView):
    def get(self, request, *args, **kwargs):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
