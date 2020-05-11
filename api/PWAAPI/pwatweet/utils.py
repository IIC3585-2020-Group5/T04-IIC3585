from .models import *
from pywebpush import webpush, WebPushException
from django.conf import settings
from decouple import config

def send_notification(message):
    subscribers = NotificationSubscription.objects.all()
    for sub in subscribers:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }},
                data=message,
                vapid_private_key=config('VAPID_PRIVATE_KEY'),
                vapid_claims={
                        "sub": "mailto:whe1@uc.cl",
                    }
            )
        except WebPushException as ex:
            print("I'm sorry, Dave, but I can't do that: {}", repr(ex))
            sub.delete()
            # Mozilla returns additional information in the body of the response.
            if ex.response and ex.response.json():
                extra = ex.response.json()
                print("Remote service replied with a {}:{}, {}",
                    extra.code,
                    extra.errno,
                    extra.message
                    )