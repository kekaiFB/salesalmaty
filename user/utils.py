from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from table.models import Company, Office, Human
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.core.exceptions import PermissionDenied

menu = [{'title': "Моя страница", 'url_name': 'user:profile'},
        {'title': "Штат", 'url_name': 'user:company'},
        # {'title': "График сменности", 'url_name': 'user:shift-office'},
        # {'title': "Импорт", 'url_name': 'user:import-snj'},
        # {'title': "Заявки", 'url_name': 'user:applications'},
        {'title': "Настройки", 'url_name': 'user:settings'},
        # {'title': "Разграничение доступа", 'url_name': 'user:access_control'},
        # {'title': "Пошаговые действия", 'url_name': 'user:step_actions'},
]


class AdminRolePermissionMixin(PermissionRequiredMixin):
    def has_permission(self):
        user = self.request.user

        if user.groups.filter(name__in=['Администратор']).exists():
            return True
        return False

    def handle_no_permission(self):
        raise PermissionDenied


class BossOrAdminRolePermissionMixin(PermissionRequiredMixin):
    def has_permission(self):
        user = self.request.user

        if user.groups.filter(name__in=['Начальник', 'Администратор']).exists():
            return True
        return False

    def handle_no_permission(self):
        raise PermissionDenied



class MyModel(LoginRequiredMixin):    
    def get_user_context(self, **kwargs):
        context = kwargs
        context['menu'] = menu
        context['prev_url'] = self.request.META.get('HTTP_REFERER')

        if "user" is self.request.session:
            if self.request.session['user']['username'] != str(self.request.user):
                add_user_context(self.request)  
        else:
            add_user_context(self.request)  


                
        # context['name_company'] = self.request.session['user']['name_company']
        # context['id_company'] = self.request.session['user']['name_company_id']
        # context['user_groups'] = self.request.session['user']['user_groups']
        # context['request_user_id'] = self.request.session['user']['request_user_id']
        # context['request_human_id'] = self.request.session['user']['request_human_id']
        # context['applications'] = self.request.session['user']['applications']
        # context['applications_tgo'] = self.request.session['user']['applications_tgo']
        # context['applications_timetable'] = self.request.session['user']['applications_timetable']
        # context['applications_humans'] = self.request.session['user']['applications_humans']

        context_keys = [
            'name_company', 'name_company_id', 'user_groups',
            'request_user_id', 'request_human_id',
            #  'applications', 'applications_tgo', 'applications_timetable', 'applications_humans', 'applications_forum'
        ]

        for key in context_keys:
            context[key] = self.request.session['user'][key]
        context['id_company'] = context['name_company_id'] 
        return context
    

def add_user_context(request):
    user_groups = [group.name for group in request.user.groups.select_related()] 

    # Заявки
    # application = 0
    # applications_tgo = 0
    # applications_timetable = 0
    # applications_humans = 0
    # applications_forum = 0

    if user_groups:
        if 'Администратор' in user_groups:
            name_company = [(Company.id, Company.__str__(), Human.objects.filter(user=request.user)[0].id) for Company in Company.objects.filter(leader=request.user)]
            offices_company = [office.title for office in Office.objects.filter(сompany__id = name_company[0][0]).select_related()]  #офисы нашей компании 
            
            # applications_tgo += Operation.objects.select_related('company').filter(company = name_company[0][0], is_active=False).count() 
            # applications_tgo += Ressource.objects.select_related('office__сompany', 'office').filter(office__сompany = name_company[0][0], is_active=False).count()
            # applications_tgo += TGO.objects.select_related().filter(author__leader_user__id = name_company[0][0], is_active=False).count()

            # applications_timetable += TimetableList.objects.select_related().filter(author__leader_user__id = name_company[0][0], is_active=False).count()
            # applications_timetable += Flight.objects.select_related().filter(company__id = name_company[0][0], is_active=False).count()
            
            # applications_humans += Human.objects.select_related().filter(office__сompany_id = name_company[0][0], is_active=False).count()
            
            # applications_forum += Question.objects.select_related().filter(author__leader_user__id = name_company[0][0], is_active=False).count()
        else:
            name_company = [(elem.сompany_id, elem.сompany.title, elem.humans.get(user=request.user).id) for elem in  Office.objects.filter(humans__user=request.user).select_related('сompany')]
            offices_company = [office.title for office in Office.objects.filter(сompany__id = name_company[0][0], humans__user = request.user).select_related()]  #офис сотрудника
  
        # application = applications_tgo + applications_timetable + applications_humans + applications_forum
        # if application == 0:
        #     application = ''
        #     applications_tgo = ''
        #     applications_timetable = ''
        #     applications_humans = ''
        #     applications_forum = ''

        request.session['user'] = {
            'username': str(request.user),
            'name_company': name_company[0][1]
            , 'name_company_id': name_company[0][0]
            , 'offices_company': offices_company
            , 'user_groups': user_groups
            , 'request_user_id': int(request.user.id)
            , 'request_human_id': name_company[0][2]
            , 'prev_url': request.META.get('HTTP_REFERER')
            # , 'applications': application
            # , 'applications_tgo': applications_tgo
            # , 'applications_timetable': applications_timetable
            # , 'applications_humans': applications_humans
            # , 'applications_forum': applications_forum
        } 

class MySuccesURL(LoginRequiredMixin):
    def get_success_url(self):
        return reverse_lazy('user:company')


class SuccessHumanViewURL(LoginRequiredMixin):
    def get_success_url(self):
        return reverse_lazy('user:user', kwargs={'id': self.request.resolver_match.kwargs['pk']})