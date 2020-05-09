from django.shortcuts import render
from .models import *
from django.http import JsonResponse, HttpResponse, HttpResponseNotFound
from django.core import serializers
import json
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count
from django.core.serializers.json import DjangoJSONEncoder
from django.db.utils import IntegrityError

# Create your views here.
def get_posts(request):
    posts = Post.objects.all().annotate(like_count=Count('likes', distinct=True)).annotate(comment_count=Count('comments', distinct=True)).values()

    serialized_queryset = json.dumps(list(posts), cls=DjangoJSONEncoder)
    return HttpResponse(serialized_queryset, content_type='application/json')


def get_post(request, id):
    try:
        post = Post.objects.get(id__exact=int(id))
    except Post.DoesNotExist:
        return HttpResponseNotFound(404)
    serialized_queryset = serializers.serialize('json', [post,])
    struct = json.loads(serialized_queryset)
    data = json.dumps(struct[0])
    return HttpResponse(data, content_type='application/json')


@csrf_exempt
def new_post(request):
    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        print(body)
        post = Post()
        post.content = body['content']
        post.username = body['username']
        post.save()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=405)


def get_comments(request, id):
    try:
        post = Post.objects.get(id__exact=int(id))
    except Post.DoesNotExist:
        return HttpResponse(status=404)
    comments = post.comments.all()
    serialized_queryset = serializers.serialize('json', list(comments))
    struct = json.loads(serialized_queryset)
    data = json.dumps(struct)
    return HttpResponse(data, content_type='application/json')


def get_likes(request, id):
    try:
        post = Post.objects.get(id__exact=int(id))
    except Post.DoesNotExist:
        return HttpResponse(status=404)
    likes = post.likes.all()
    serialized_queryset = serializers.serialize('json', list(likes))
    struct = json.loads(serialized_queryset)
    data = json.dumps(struct)
    return HttpResponse(data, content_type='application/json')


@csrf_exempt
def new_like(request):
    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        try:
            post = Post.objects.get(id__exact=int(body['post_id']))
        except Post.DoesNotExist:
            return HttpResponseNotFound(404)
        like = Like()
        like.post = post
        like.username = body['username']
        try:
            like.save()
        except IntegrityError:
            return HttpResponse(status=404) 
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=405)


@csrf_exempt
def new_comment(request):
    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        try:
            post = Post.objects.get(id__exact=int(body['post_id']))
        except Post.DoesNotExist:
            return HttpResponseNotFound(404)
        comment = Comment()
        comment.post = post
        comment.content = body['content']
        comment.username = body['username']
        comment.save()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=405)

def check_like(request, id, username):
    try:
        post = Post.objects.get(id__exact=int(id))
    except Post.DoesNotExist:
        return HttpResponse(status=404)
    try:
        like = Like.objects.get(post=post, username=username)
    except Like.DoesNotExist:
        return HttpResponse(status=404)
    return HttpResponse(status=200)