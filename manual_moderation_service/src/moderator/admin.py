# thirdparty
from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("review_id", "moderation_status", "staff_id", "created_at", "moderation_at")
    list_filter = ("moderation_status",)
