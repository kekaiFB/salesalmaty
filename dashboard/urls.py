from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('admin/', admin.site.urls),

    path('',  include('user.urls')),    
    path('table/', include('table.urls')), 
    path('permission/', include('permission.urls')),
    
    path("select2/", include("django_select2.urls")),

    #Сброс пароля    
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='user/reset/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name="user/reset/password_reset_confirm.html"), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='user/reset/password_reset_complete.html'), name='password_reset_complete'),   
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)    

    
from user.views import ErrorHandler

for code in (400, 403, 404, 500):
    vars()['handler{}'.format(code)] = ErrorHandler.as_view(error_code=code)

