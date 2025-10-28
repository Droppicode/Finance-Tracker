from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter # Especifica que deve usar o "adaptador" do Google do django-allauth para validar o token recebido
    callback_url = 'http://localhost:5173' # Precisa para validar a requisição
    client_class = OAuth2Client # Define o tipo de cliente de autenticação
