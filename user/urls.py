from django.urls import path
from .views import *
from django.contrib.auth.views import LogoutView

app_name = 'user'

urlpatterns = [
    path("", LoginUser.as_view()),
    
    path("login/", LoginUser.as_view(), name='login'),
    path("register/", registerUserForm, name='register'),
    path('activate/<uidb64>/<token>/', activate, name='activate'),  
    path('logout/', LogoutView.as_view(next_page='user:login'), name='logout'),
    path("error/", ErrorHandler.as_view(), name='error'),
    
    path('password_reset/', password_reset, name='password_reset'),   
    
    path("profile/", ProfileView.as_view(), name='profile'),
    path("profile/company/", CompanyView.as_view(), name='company'),
    path("profile/settings/", settings, name='settings'),

    # Инструкции
    path("profile/instructions/access_control", AccessControlView.as_view(), name='access_control'),
    path("profile/instructions/step_actions", StepActionsView.as_view(), name='step_actions'),


    # Заявки
    path("profile/applications/", ApplicationsView.as_view(), name='applications'),
    path("profile/applications-tgo/", ApplicationsTGOView.as_view(), name='applications-tgo'),
    path("profile/applications-timetable/", ApplicationsTimetableView.as_view(), name='applications-timetable'),
    path("profile/applications-humans/", ApplicationsHumansView.as_view(), name='applications-humans'),
    path("profile/applications-forum/", ApplicationsForumView.as_view(), name='applications-forum'),
    
    path('add_office/<int:company_id>/', OfficeCreateView.as_view(), name='add_office'),
    path('edit_office/<int:pk>/', OfficeUpdateView.as_view(), name='edit_office'),
    path('delete_office/<int:pk>/', OfficeDeleteView.as_view(), name='delete_office'),

    path('add_post/', PostCreateView.as_view(), name='add_post'),
    path('edit_post/<int:pk>/', PostUpdateView.as_view(), name='edit_post'),
    path('delete_post/<int:pk>/', PostDeleteView.as_view(), name='delete_post'),

    #Добавление сотрудника
    path('add_human/', HumanCreateView.as_view(), name='add_human'),
    path('edit_human/<int:pk>/', HumanUpdateView.as_view(), name='edit_human'),
    path('delete_human/<int:pk>/<int:post_id>/<int:office_id>/', HumanOfficeDelete.as_view(), name='delete_human'),
    path('check_user/', check_user, name='check_user'),
    path('full-delete_human/<int:pk>/', HumanFullDeleteView.as_view(), name='full-delete_human'),

    path("user/<int:id>/", UserView.as_view(), name='user'),
    path('user/add_human_office/<int:pk>/', Add_human_office.as_view(), name='add_human_office'),
    path('user/add_post_user/<int:pk>/<int:office_id>/', Add_post_user.as_view(), name='add_post_user'),
    path('edit_role/<int:pk>/<int:human_id>/', UpdateRoleUser.as_view(), name='edit_role'),

    
    # human удаление 
    path('human-no-active/<int:pk>/', HumanNoActiveView.as_view(), name='human-no-active'),
    path('human-is-active/<int:pk>/', HumanIsActiveView.as_view(), name='human-is-active'),


    path('get_free_email/', get_free_email, name='get_free_email'),


    
    # Импорт
    path("profile/import/", ImportSNJView.as_view(), name='import-snj'),

    path("profile/import-humans/", ImportHumanView.as_view(), name='import-humans'),
    path('profile/import-humans/create/', ImportHumanViewCreateView.as_view(), name='import-humans-create'),
    path('profile/import-humans/update/<int:pk>/', ImportHumanViewUpdateView.as_view(), name='import-humans-update'),
    path('profile/import-humans/delete/<int:pk>/', ImportHumanViewDeleteView.as_view(), name='import-humans-delete'),
    path('profile/import-humans/detail/<int:pk>/', ImportHumanDetailView.as_view(), name='import-humans-detail'),


    path("profile/import-snj/", ImportSNJView.as_view(), name='import-snj'),
    path('profile/import-snj/create/', ImportSNJViewCreateView.as_view(), name='import-snj-create'),
    path('profile/import-snj/update/<int:pk>/', ImportSNJViewUpdateView.as_view(), name='import-snj-update'),
    path('profile/import-snj/delete/<int:pk>/', ImportSNJViewDeleteView.as_view(), name='import-snj-delete'),
    path('profile/import-snj/detail/<int:pk>/', ImportSNJDetailView.as_view(), name='import-snj-detail'),

    path('import_check_input_status/<str:field_name>/<int:import_id>/', ImportCheckInputStatusView.as_view(), name='import_check_input_status'),

    # График сменности
    path("profile/shift-office/", ShiftOfficeView.as_view(), name='shift-office'),
    path("profile/shift-office/<int:pk>", ShiftOfficeDetailView.as_view(), name='shift-office-detail'),
] 
