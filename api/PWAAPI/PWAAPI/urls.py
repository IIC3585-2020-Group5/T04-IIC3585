"""PWAAPI URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from pwatweet.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path(r'posts/', get_posts),
    path(r'posts/<int:id>/', get_post),
    path(r'posts/new', new_post),
    path(r'likes/new', new_like),
    path(r'comments/new', new_comment),
    path(r'comments/<int:id>/', get_comments),
    path(r'likes/<int:id>/', get_likes),
    path(r'posts/<int:id>/liked/<str:username>/', check_like),
    path(r'notification/subscribe', new_subscription),
]
