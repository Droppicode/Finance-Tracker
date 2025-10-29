from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch, MagicMock
from rest_framework import status
import io

class ProcessStatementViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('process_statement')

    @patch('api.services.extract_transactions_from_text')
    @patch('api.services.extract_text_from_pdf')
    def test_process_statement_success(self, mock_extract_text, mock_extract_transactions):
        # Create a dummy PDF file in memory
        pdf_file = io.BytesIO(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000059 00000 n\n0000000112 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF")
        pdf_file.name = 'test.pdf'

        # Mock the service functions
        mock_extract_text.return_value = "dummy text"
        mock_extract_transactions.return_value = [
            {"date": "2023-10-26", "description": "Test Supermarket", "amount": 100.00}
        ]

        # Make the POST request
        response = self.client.post(self.url, {'statement': pdf_file}, format='multipart')

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [{"date": "2023-10-26", "description": "Test Supermarket", "amount": 100.00}])

        # Assert that the mocks were called
        mock_extract_text.assert_called_once()
        mock_extract_transactions.assert_called_once_with("dummy text")

    def test_process_statement_no_file(self):
        # Make the POST request without a file
        response = self.client.post(self.url, {}, format='multipart')

        # Assert the response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data, {'error': 'No statement file found'})