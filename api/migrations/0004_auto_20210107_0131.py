# Generated by Django 3.1.4 on 2021-01-07 01:31

from django.db import migrations, models
import picklefield.fields

def convert_random_shifts(apps, schema_editor):
    StaticMix = apps.get_model('api', 'StaticMix')
    for mix in StaticMix.objects.all():
        mix.separator_args = {'random_shifts': mix.random_shifts}
        mix.save()

    DynamicMix = apps.get_model('api', 'DynamicMix')
    for mix in DynamicMix.objects.all():
        mix.separator_args = {'random_shifts': mix.random_shifts}
        mix.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20201229_0321'),
    ]

    operations = [
        migrations.AddField(
            model_name='dynamicmix',
            name='bitrate',
            field=models.IntegerField(choices=[(192, 'Mp3 192'),
                                               (256, 'Mp3 256'),
                                               (320, 'Mp3 320')],
                                      default=256),
        ),
        migrations.AddField(
            model_name='dynamicmix',
            name='separator_args',
            field=picklefield.fields.PickledObjectField(default=dict,
                                                        editable=False),
        ),
        migrations.AddField(
            model_name='staticmix',
            name='bitrate',
            field=models.IntegerField(choices=[(192, 'Mp3 192'),
                                               (256, 'Mp3 256'),
                                               (320, 'Mp3 320')],
                                      default=256),
        ),
        migrations.AddField(
            model_name='staticmix',
            name='separator_args',
            field=picklefield.fields.PickledObjectField(default=dict,
                                                        editable=False),
        ),
        migrations.AlterField(
            model_name='dynamicmix',
            name='separator',
            field=models.CharField(choices=[
                ('spleeter', 'Spleeter'),
                ('demucs',
                 (('demucs', 'Demucs'), ('demucs_extra', 'Demucs (extra)'),
                  ('light', 'Demucs Light'), ('light_extra',
                                              'Demucs Light (extra)'),
                  ('tasnet', 'Tasnet'), ('tasnet_extra', 'Tasnet (extra)'))),
                ('xumx', 'X-UMX')
            ],
                                   default='spleeter',
                                   max_length=20),
        ),
        migrations.AlterField(
            model_name='staticmix',
            name='separator',
            field=models.CharField(choices=[
                ('spleeter', 'Spleeter'),
                ('demucs',
                 (('demucs', 'Demucs'), ('demucs_extra', 'Demucs (extra)'),
                  ('light', 'Demucs Light'), ('light_extra',
                                              'Demucs Light (extra)'),
                  ('tasnet', 'Tasnet'), ('tasnet_extra', 'Tasnet (extra)'))),
                ('xumx', 'X-UMX')
            ],
                                   default='spleeter',
                                   max_length=20),
        ),
        migrations.AlterUniqueTogether(
            name='dynamicmix',
            unique_together={('source_track', 'separator', 'separator_args',
                              'bitrate')},
        ),
        migrations.AlterUniqueTogether(
            name='staticmix',
            unique_together={('source_track', 'separator', 'separator_args',
                              'bitrate', 'vocals', 'drums', 'bass', 'other')},
        ),
        migrations.RunPython(convert_random_shifts),
        migrations.RemoveField(
            model_name='dynamicmix',
            name='random_shifts',
        ),
        migrations.RemoveField(
            model_name='staticmix',
            name='random_shifts',
        ),
    ]
