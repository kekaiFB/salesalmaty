from django.urls import include, path
from .views import *

app_name = 'permission'

urlpatterns = [
    path("<slug:user>/", index, name='index'),
    path("", index, name='index'),
]