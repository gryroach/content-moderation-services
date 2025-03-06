# thirdparty
from django.db import models
from django.utils.translation import gettext_lazy as _

MODERATION_STATUS_CHOICES = [
    ("pending", _("Pending")),
    ("approved", _("Approved")),
    ("rejected", _("Rejected")),
]


class Review(models.Model):
    user_id = models.UUIDField(null=False, verbose_name="ID пользователя")
    movie_id = models.UUIDField(null=False, verbose_name="ID фильма")
    review_id = models.UUIDField(null=False, verbose_name="ID рецензии")
    review_text = models.TextField(null=False, verbose_name="Текст рецензии")
    auto_moderation_result = models.TextField(null=True, verbose_name="Результат автомодерации")
    moderation_status = models.CharField(
        choices=MODERATION_STATUS_CHOICES, null=False, verbose_name="Статус модерации"
    )
    rejection_reason = models.TextField(null=True, verbose_name="Причина отказа")
    moderator_id = models.UUIDField(null=True, verbose_name="ID модератора")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    moderation_at = models.DateTimeField(auto_now=True, verbose_name="Дата модерации")

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")
