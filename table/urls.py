from django.urls import path
from . import views 

app_name = 'table'

urlpatterns = [
    path('', views.index, name='index'),  
    path('addnew/', views.SNJCreateView.as_view(), name='addnew'),  
    path('edit/<int:pk>/', views.SNJUpdateView.as_view(), name='edit'),  
    path('delete/<int:id>/', views.destroy, name='destroy'),  
    
]

urlpatterns += [
    path('ajax/load_ajax_form', views.load_ajax_form, name='load_ajax_form'), 
]
