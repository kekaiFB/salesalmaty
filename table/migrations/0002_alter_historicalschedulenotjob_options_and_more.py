# Generated by Django 4.2.5 on 2024-01-27 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('table', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='historicalschedulenotjob',
            options={'get_latest_by': ('history_date', 'history_id'), 'ordering': ('-history_date', '-history_id'), 'verbose_name': 'Версия', 'verbose_name_plural': 'historical 7 Данные продаж'},
        ),
        migrations.AlterModelOptions(
            name='reason',
            options={'ordering': ['title'], 'verbose_name': 'Продук', 'verbose_name_plural': '5 Продукт'},
        ),
        migrations.AlterModelOptions(
            name='schedulenotjob',
            options={'verbose_name': 'Данные продажи', 'verbose_name_plural': '7 Данные продаж'},
        ),
        migrations.RemoveField(
            model_name='reason',
            name='character_code',
        ),
        migrations.AlterField(
            model_name='reason',
            name='digital_code',
            field=models.CharField(max_length=10, verbose_name='Продукт'),
        ),
        migrations.AlterField(
            model_name='reason',
            name='title',
            field=models.CharField(max_length=150, verbose_name='Описание'),
        ),
    ]
