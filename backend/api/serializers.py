from rest_framework import serializers
from dj_rest_auth.serializers import UserDetailsSerializer
from .models import Transaction, Category, UserProfile, Investment
from django.urls import reverse

class CustomUserDetailsSerializer(UserDetailsSerializer):
    profile_picture = serializers.SerializerMethodField()
    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + ('profile_picture',)
    def get_profile_picture(self, obj):
        try:
            social_account = obj.socialaccount_set.get(provider='google')
            picture_url = social_account.extra_data.get('picture')
            if picture_url:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(reverse('profile_picture_proxy') + f'?url={picture_url}')
            return None
        except Exception:
            return None

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')

class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    class Meta:
        model = Transaction
        fields = ('id', 'user', 'date', 'description', 'amount', 'type', 'category', 'category_id')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('theme', 'start_date', 'end_date', 'filtered_categories')

class InvestmentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Investment
        fields = (
            'id', 'user', 'name', 'symbol', 'quantity', 'price', 'type', 'currency', 'purchase_date', 'notes'
        )
