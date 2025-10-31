from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = (('user', 'name'),)

    def __str__(self):
        return self.name

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10) # credit or debit
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f'{self.description} - {self.amount}'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    theme = models.CharField(max_length=10, default='dark')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    filtered_categories = models.JSONField(default=list, null=True, blank=True)

    def __str__(self):
        return self.user.username
    
# Investment model
class Investment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    symbol = models.CharField(max_length=20)
    quantity = models.DecimalField(max_digits=20, decimal_places=5)
    price = models.DecimalField(max_digits=20, decimal_places=5)
    currency = models.CharField(max_length=10, default="USD")
    purchase_date = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=32, blank=True, default="")

    def __str__(self):
        return f"{self.symbol} ({self.quantity}) @ {self.price}"

    
        type = models.CharField(max_length=32, blank=True, default="")
