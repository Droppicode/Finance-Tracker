from rest_framework import serializers
from dj_rest_auth.serializers import UserDetailsSerializer

class CustomUserDetailsSerializer(UserDetailsSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta(UserDetailsSerializer.Meta):
        fields = UserDetailsSerializer.Meta.fields + ('profile_picture',)

    def get_profile_picture(self, obj):
        try:
            # Assumes the user has a social account and it has extra_data with a picture
            social_account = obj.socialaccount_set.get(provider='google')
            return social_account.extra_data.get('picture')
        except Exception:
            return None
