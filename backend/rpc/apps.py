from django.apps import AppConfig
from django.core.management import call_command


class RpcConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rpc'
