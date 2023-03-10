# Generated by Django 4.1.3 on 2022-12-06 05:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_auto_20220222_0232'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dynamicmix',
            name='separator',
            field=models.CharField(choices=[('spleeter', 'Spleeter'), ('d3net', 'D3Net'), ('demucs', (('htdemucs', 'Demucs v4'), ('htdemucs_ft', 'Demucs v4 Fine-tuned'), ('hdemucs_mmi', 'Demucs v3 MMI'), ('mdx', 'Demucs v3'), ('mdx_extra', 'Demucs v3 Extra'), ('mdx_q', 'Demucs v3 Quantized'), ('mdx_extra_q', 'Demucs v3 Extra Quantized'), ('demucs', 'Demucs'), ('demucs48_hq', 'Demucs HQ'), ('demucs_extra', 'Demucs Extra'), ('demucs_quantized', 'Demucs Quantized'), ('tasnet', 'Tasnet'), ('tasnet_extra', 'Tasnet Extra'), ('light', 'Demucs Light'), ('light_extra', 'Demucs Light Extra'))), ('xumx', 'X-UMX')], default='spleeter', max_length=20),
        ),
        migrations.AlterField(
            model_name='staticmix',
            name='separator',
            field=models.CharField(choices=[('spleeter', 'Spleeter'), ('d3net', 'D3Net'), ('demucs', (('htdemucs', 'Demucs v4'), ('htdemucs_ft', 'Demucs v4 Fine-tuned'), ('hdemucs_mmi', 'Demucs v3 MMI'), ('mdx', 'Demucs v3'), ('mdx_extra', 'Demucs v3 Extra'), ('mdx_q', 'Demucs v3 Quantized'), ('mdx_extra_q', 'Demucs v3 Extra Quantized'), ('demucs', 'Demucs'), ('demucs48_hq', 'Demucs HQ'), ('demucs_extra', 'Demucs Extra'), ('demucs_quantized', 'Demucs Quantized'), ('tasnet', 'Tasnet'), ('tasnet_extra', 'Tasnet Extra'), ('light', 'Demucs Light'), ('light_extra', 'Demucs Light Extra'))), ('xumx', 'X-UMX')], default='spleeter', max_length=20),
        ),
    ]
