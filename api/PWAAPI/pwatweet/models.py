from django.db import models

# Create your models here.

class Post(models.Model):
    content = models.TextField(null=False, blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    username = models.TextField(null=False, blank=False)

    def __str__(self):
        return f"{self.username}: {self.content} @ {self.timestamp}"


class Comment(models.Model):
    post = models.ForeignKey('Post', related_name='comments', on_delete=models.SET_NULL, blank=True, null=True)
    content = models.TextField(null=False, blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    username = models.TextField(null=False, blank=False)

    def __str__(self):
        return f"{self.username}: {self.content} To {self.post.id} @ {self.timestamp}"


class Like(models.Model):
    username = models.TextField(null=False, blank=False, unique=True)
    post = models.ForeignKey('Post', related_name='likes', on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return f"{self.username}: Like To {self.post.id}"

