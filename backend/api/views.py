from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from . import services
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
            transactions = services.extract_transactions_from_text(text)
            return Response(transactions, status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Error processing statement")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
