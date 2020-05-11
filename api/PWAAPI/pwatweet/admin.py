from django.contrib import admin
from .models import Post, Like, Comment, NotificationSubscription

# Register your models here.
class PostAdmin(admin.ModelAdmin):
    readonly_fields = ('timestamp',)

class CommentAdmin(admin.ModelAdmin):
    readonly_fields = ('timestamp',)

admin.site.register(Post, PostAdmin)
admin.site.register(Like)
admin.site.register(NotificationSubscription)
admin.site.register(Comment, CommentAdmin)