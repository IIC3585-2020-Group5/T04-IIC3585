# Generated by Django 3.0.6 on 2020-05-08 19:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pwatweet', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Comments',
            new_name='Comment',
        ),
        migrations.RenameModel(
            old_name='Likes',
            new_name='Like',
        ),
    ]
