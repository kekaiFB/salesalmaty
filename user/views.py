# Импорты стандартных библиотек
import os
import sys
import io
from collections import defaultdict
from io import BytesIO
from django.contrib.auth.tokens import default_token_generator


# Импорты Django
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.contrib.auth.decorators import permission_required
from django.db import transaction
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic.base import TemplateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import get_user_model
from django.core.mail import BadHeaderError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.models import User
from django.db.models.query_utils import Q
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.contrib.auth.tokens import default_token_generator
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from table.models import Import, ShiftOffice
from django.shortcuts import get_object_or_404


# Импорты из ваших приложений
from .forms import *
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from .utils import *

# Импорты из других приложений
from table.models import Company, Human, Office, Post
from bootstrap_modal_forms.generic import (
    BSModalCreateView,
    BSModalDeleteView,
    BSModalUpdateView,
    BSModalReadView
)
from django.db import connection
from django.views.generic import ListView, DetailView
from table.models import *
from django.db.models import Prefetch
import pandas as pd
from django.http import JsonResponse
import json


import pandas as pd
from django.db import transaction
from itertools import zip_longest
from datetime import datetime
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
import random

# Функция для генерации случайных символов
def generate_random_string(length=3):
    characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return ''.join(random.choice(characters) for i in range(length))


def my_current_site(request):
    return get_current_site(request).domain


def registerUserForm(request):
    if request.user.is_authenticated:
            return redirect('user:profile')
    
    if request.method == 'POST':
        if request.POST.get('company'):
            company = request.POST.get('company')
            if Company.objects.filter(title=company).exists():
                messages.error(request, 'Такая компания уже зарегистрирована')
                form = RegisterUserForm()
            else: 
                form = RegisterUserForm(request.POST)
                if form.is_valid():
                    with transaction.atomic():
                        user = form.save(commit=False)
                        # user.is_active = False
                        user.is_active = True
                        user.username = user.email
                        user.save()

                        #Создаем компанию
                        Company.objects.create(title=company, leader=user)
                        
                        g = Group.objects.get(name='Администратор')
                        g.user_set.add(user)

                        #Создаем сотрудника
                        Human.objects.create(user=user,  groups='Администратор', date_start = datetime.today().strftime('%Y-%m-%d'))

                        # mail_subject = 'Активируйте учетную запись'
                        # message = render_to_string('user/user/acc_active_email.html', {
                        #     'user': user,
                        #     'domain': my_current_site(request),
                        #     'uid':urlsafe_base64_encode(force_bytes(user.pk)),
                        #     'token': default_token_generator.make_token(user),                
                        # })
                        # to_email = form.cleaned_data.get('email')
                        # email = EmailMessage(mail_subject, message, to=[to_email])
                        # email.content_subtype = 'html' 
                        # email.send()

                        # message = 'Проверьте электронную почту чтобы завершить регистрацию'
                        message = 'Вы успешно зарегистрированы'
                    return render(request, 'user/user/message.html', {'message': message})
    else:
        form = RegisterUserForm()
    return render(request, 'user/user/register.html', {'form': form})
 

class LoginUser(LoginView):
    form_class = LoginForm
    template_name = 'user/user/login.html'
    success_message = 'Успешный вход в учетную запись!'
    extra_context = dict(success_url=reverse_lazy('user:profile'))

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = "Авторизация"
        return context

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('user:profile')
        add_user_context(self.request)
        return super(LoginUser, self).dispatch(request, *args, **kwargs)


class ErrorHandler(TemplateView):
    error_code = 404
    template_name = 'user/user/error.html'

    def dispatch(self, request, *args, **kwargs):
        return self.get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = self.error_code
        context['error_code'] = self.error_code
        context['kwargs'] = self.kwargs
        return context

    def render_to_response(self, context, **response_kwargs):
        """ Return correct status code """
        response_kwargs = response_kwargs or {}
        response_kwargs.update(status=self.error_code)
        return super().render_to_response(context, **response_kwargs)
    

def activate(request, uidb64, token):  
    User = get_user_model()  
    uid = force_str(urlsafe_base64_decode(uidb64))  
    user = User.objects.get(pk=uid)  
    
    if user is not None and account_activation_token.check_token(user, token):  
        user.is_active = True  
        user.save()
        message = 'Спасибо за подтверждение по электронной почте. Теперь вы можете войти в свою учетную запись.'
        return render(request, 'user/user/message.html', {'message': message})
    else:
        message = 'Ссылка активации недействительна!'
        return render(request, 'user/user/message.html', {'message': message})  


def password_reset(request):
	if request.method == "POST":
		password_reset_form = PasswordResetForm(request.POST)
		if password_reset_form.is_valid():
			data = password_reset_form.cleaned_data['email']
			associated_users = User.objects.filter(Q(email=data))
			if associated_users.exists():
				for user in associated_users:
					mail_subject = "Сброс пароля на " + str(my_current_site(request))
					email_template_name = "user/reset/password_reset_email.html"
					c = {                 
                    "email":user.email,
                    'domain': my_current_site(request),
                    "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                    "user": user,
                    'token': default_token_generator.make_token(user),
                    'protocol': 'http',
					}
					email = render_to_string(email_template_name, c)
					try:
						EmailMessage(mail_subject, email, to=[user.email]).send()
					except BadHeaderError:
						return HttpResponse('Непредвинденная ошибка')
					return redirect('password_reset_done')
	password_reset_form = PasswordResetForm()
	return render(request=request, template_name="user/reset/password_reset.html", context={"form":password_reset_form})


@login_required
def settings(request):
    if request.method == 'POST':

        #Обновляем ФИО
        if request.POST.get("initials"):
            Human.objects.filter(user__username=request.user).update(initials=request.POST.get("initials"))

        #Обновляем название компании
        elif request.session['user']['name_company']:
            if 'Администратор' in request.session['user']['user_groups']:
                Company.objects.filter(id = request.session['user']['name_company_id']).update(title=request.POST.get("name_company"))
                add_user_context(request)
        #Обновляем пароль
        else: 
            form = SetPasswordForm(request.user, request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, "Ваш пароль был изменен")
                return redirect('user:login')
            else:
                for error in list(form.errors.values()):
                    messages.error(request, error)

    form = SetPasswordForm(request.user)
    human = Human.objects.filter(user=request.user)

    context = {
         'form_password_change': form
         , 'menu': menu
         , 'title': 'Настройки'
         , 'human': human
         }
    context['name_company'] = request.session['user']['name_company']
    context['id_company'] = request.session['user']['name_company_id']
    context['user_groups'] = request.session['user']['user_groups']
    context['request_user_id'] = request.session['user']['request_user_id']
    context['request_human_id'] = request.session['user']['request_human_id']  
    context['offices_company'] = request.session['user']['offices_company']
    # context['applications'] = request.session['user']['applications']
    # context['applications_tgo'] = request.session['user']['applications_tgo']
    # context['applications_timetable'] = request.session['user']['applications_timetable']
    # context['applications_humans'] = request.session['user']['applications_humans']
    # context['applications_forum'] = request.session['user']['applications_forum']

    return render(request, 'user/profile/settings.html', context = context)


# ---------------------------------Профиль----------------------
class ProfileView(MyModel, TemplateView):
    template_name = 'user/profile/profile.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Моя страница'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        posts = Post.objects.filter(humans__id = self.request.session['user']['request_human_id']).select_related()
        context['posts'] = posts

        human = Human.objects\
            .get(user_id = self.request.session['user']['request_user_id'])\
            .history\
            .select_related('user', 'status', 'author_update',)\
            .order_by('history_id')\
            .prefetch_related(
                Prefetch(
                'user__groups', 
                queryset=Group.objects.select_related(),
                ),
            )\
            .distinct()

        context['human'] = human

        
        # Получаем все объекты Human
        humans = Human.objects.all()

        # # Для каждого объекта Human
        # for human in humans:
        #     user_str = str('Пользователь ') + str(human.user)
        #     try:
        #         # Получаем все объекты Office, которые связаны с объектом Human через связь ManyToMany 
        #         offices = human.office.all()
        #         # Если у пользователя нет привязки к офису
        #         if not offices.exists():
        #             print(f"{user_str} не принадлежит ни к одному офису.")
        #             continue
        #         # Для каждого объекта Office
        #         for office in offices:
        #             # Если офис не принадлежит ни к одной компании
        #             if not office.сompany:
        #                 print(f"{user_str} принадлежит Офису: {office.title}, который не принадлежит ни к одной компании.")
        #                 continue
        #             print(f"{user_str} принадлежит Офису: {office.title}, который является частью Компании: {office.сompany.title}")
        #     except ObjectDoesNotExist:
        #         # Если офиса или компании не существует, продолжаем со следующим пользователем
        #         print(f"Произошла проблема с пользователем: {user_str}")
        #         continue
        return context


class CompanyView(MyModel, TemplateView):
    template_name = 'user/profile/company/company.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Штат'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        if 'Администратор' in self.request.session['user']['user_groups']:
            offices = Office.objects.filter(сompany__id = self.request.session['user']['name_company_id']).select_related()
            context['office'] = offices 


            posts = Post.objects.filter(office__сompany__id = self.request.session['user']['name_company_id']).select_related()
            context['posts'] = posts


            human = Human.objects\
                                .filter(office__сompany__id = self.request.session['user']['name_company_id'])\
                                .select_related('user')\
                                .prefetch_related(
                                    Prefetch(
                                    'user__groups', 
                                    queryset=Group.objects.select_related(),
                                    ),
                                )\
                                .prefetch_related(
                                    Prefetch(
                                    'post', 
                                    queryset=posts
                                    ),
                                )\
                                .prefetch_related(
                                    Prefetch(
                                    'office', 
                                    queryset=offices
                                    ),
                                ).distinct()
            context['human'] = list(human)

        else:
            offices = Office.objects.filter(humans__user__id = self.request.session['user']['request_user_id']).select_related()
            context['office'] = offices 
            
            posts = Post.objects.filter(office_id__in = [office.id for office in offices]).select_related()
            context['posts'] = posts


            human = Human.objects\
                                .filter(office__in = [office.id for office in offices])\
                                .select_related('user')\
                                .prefetch_related(
                                    Prefetch(
                                    'user__groups', 
                                    queryset=Group.objects.select_related(),
                                    ),
                                )\
                                .prefetch_related(
                                    Prefetch(
                                    'post', 
                                    queryset=posts
                                    ),
                                )\
                                .prefetch_related(
                                    Prefetch(
                                    'office', 
                                    queryset=offices
                                    ),
                                ).distinct()
            context['human'] = list(human)
        return context



# ---------------------------------Подразделения----------------------
class OfficeCreateView(MyModel, MySuccesURL, BSModalCreateView):
    template_name = 'user/edit_data/create_office.html'
    form_class = OfficeModelForm

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context()
        context = dict(list(context.items()) + list(c_def.items()))
        return context


class OfficeUpdateView(MyModel, MySuccesURL, BSModalUpdateView):
    model = Office
    template_name = 'user/edit_data/update_office.html'
    form_class = OfficeModelForm

class OfficeDeleteView(MyModel, MySuccesURL, BSModalDeleteView):
    model = Office
    template_name = 'table_tgo/edit_data/delete.html'
# -------------------------------------------------------------------


# ---------------------------------Должности----------------------
class PostCreateView(MyModel, MySuccesURL, BSModalCreateView):
    template_name = 'user/edit_data/create.html'
    form_class = PostModelForm

class PostUpdateView(MyModel, MySuccesURL, BSModalUpdateView):
    model = Post
    template_name = 'user/edit_data/update.html'
    form_class = PostModelForm

class PostDeleteView(MyModel, MySuccesURL, BSModalDeleteView):
    model = Post
    template_name = 'table_tgo/edit_data/delete.html'
    
# -------------------------------------------------------------------

def get_or_none(classmodel, **kwargs):
    try:
        return classmodel.objects.get(**kwargs)
    except classmodel.DoesNotExist:
        return None

# ---------------------------------Сотрудники----------------------
class HumanCreateView(PermissionRequiredMixin, MyModel, MySuccesURL, BSModalCreateView):
    permission_required = "table.add_human"
    template_name = 'user/edit_data/create_human.html'
    form_class = HumanModelForm
    
    def form_valid(self, form):
        self.instance = form.save(commit=False)
 
        user = get_or_none(User, username= self.request.POST.get('email'))
        if not user:
            with transaction.atomic():
                raw_password = User.objects.make_random_password(8)
                user = User.objects.create_user(username= self.request.POST.get('email'),
                                                email= self.request.POST.get('email'),
                                                password=raw_password)
            
                g = Group.objects.get(id=self.request.POST.get('group'))
                g.user_set.add(user)

                mail_subject = 'Polyslot.ru '
                message = render_to_string('user/user/email_create_user.html', {
                    'user': user,
                    'password': raw_password,
                    'role': g.name,
                    'domain': my_current_site(self.request),
                    'initials': self.request.POST.get('initials'),
                    
                })
                to_email = self.request.POST.get('email')
                email = EmailMessage(mail_subject, message, to=[to_email])
                email.content_subtype = 'html' 
                email.send()
        else:
            self.instance.user = user
            self.instance.author_update = self.request.user
            if self.instance.sur_name is None:
                self.instance.sur_name = ''
            self.instance.groups = Group.objects.get(id=self.request.POST.get('group')).name

        return super().form_valid(form)


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@login_required
@csrf_exempt
def check_user(request):
    email = 0 if not request.POST.get('email')   else request.POST.get('email')  
    
    if User.objects.filter(email=email).exists():
        message = 'Email занят'
        return JsonResponse({"message": message}, status=403)
    else:
        message = 'Email свободен'
        return JsonResponse({"message": message}, status=200)

class HumanDeleteView(MyModel, MySuccesURL, BSModalDeleteView):
    model = Human
    template_name = 'user/edit_data/delete_human.html'


@login_required
@csrf_exempt
def get_free_email(request):
    try:
        # Получите количество пользователей, используя метод count() модели User
        user_count = User.objects.count()

        current_date = datetime.now().strftime('%Y%m%d')
        email = f'test{user_count}{current_date}{generate_random_string()}@test.ru'

        # Создайте словарь с результатом
        response_data = {
            'test_email': email
        }

        return JsonResponse(response_data, status=200)
    except Exception as e:
        error_message = str(e)
        print(error_message)
        return JsonResponse({'error': 'Ошибка сервера, закройте вкладку и потворите попытку, если вам нужен тестовый email'}, status=500)
    


#Обновить сотрудника
class HumanUpdateView(MyModel, BSModalUpdateView):
    model = Human
    template_name = 'user/edit_data/update_human.html'
    form_class = HumanUpdateModelForm
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context()
        context = dict(list(context.items()) + list(c_def.items()))
        context['id_human_update'] = self.kwargs['pk']
        return context
    
    def form_valid(self, form):
        self.instance = form.save(commit=False)
        self.instance.author_update = self.request.user
        
        if self.instance.sur_name is None:
                self.instance.sur_name = ''
        return super().form_valid(form)
    
    
    def get_success_url(self):
        if 'profile' in str(self.request.META.get('HTTP_REFERER')):
            return reverse_lazy('user:profile')
        else:
            return reverse_lazy('user:user', kwargs={'id': self.kwargs['pk']})
    

#Профиль юзера
class UserView(MyModel, TemplateView):
    template_name = 'user/profile/company/employee/user.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Страница пользователя' 
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        office = Office.objects.filter(humans__id=self.kwargs['id']).select_related('сompany')[0]

        # Если такой пользователь есть в нашем подразделении
        if len(office.humans.filter(id=self.kwargs['id'])) != 0:
            human = Human.objects\
                .get(id = self.kwargs['id'])\
                .history\
                .select_related('user', 'status', 'author_update',)\
                .order_by('history_id')\
                .distinct()

            context['human'] = human[1:]


            
            if 'Администратор' in self.request.session['user']['user_groups']:
                posts = Post.objects.filter(office__сompany__leader = self.request.user).select_related()
            else:
                posts = Post.objects.filter(office__сompany = office.сompany).select_related()
            context['posts'] = posts
        return context


class Add_post_user(PermissionRequiredMixin, MyModel, BSModalUpdateView):
    permission_required = "table.add_company"
    model = Human
    template_name = 'user/edit_data/update.html'
    form_class = UserPostUpdateForm

    #url параметры в форму
    def get_form_kwargs(self):
        kwargs = super(Add_post_user, self).get_form_kwargs()
        kwargs['initial'] = ({
                'office_id': self.kwargs['office_id']
            })
        return kwargs
    
    def form_valid(self, form):
        self.instance = form.save(commit=False)
        self.instance.author_update = self.request.user
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('user:user', kwargs={'id': self.request.resolver_match.kwargs['pk']})
    

class UpdateRoleUser(MyModel, BSModalUpdateView):
    model = User
    template_name = 'user/edit_data/update_role.html'
    form_class = UserRoleUpdateForm
    
    def form_valid(self, form):
        add_user_context(self.request)
        self.instance = form.save(commit=False)
        
        groups = ''
        for group in form.cleaned_data['groups']:
            groups += group.name + ' '
            
        h = Human.objects.get(user_id=self.instance.id)
        if h.groups != groups:
            h.groups = groups
            h.save()
        return super().form_valid(form)
    
    def get_success_url(self):
        add_user_context(self.request)
        if 'profile' in self.request.session['user']['prev_url']:
            return reverse_lazy('user:profile')
        return reverse_lazy('user:user', kwargs={'id': self.request.resolver_match.kwargs['human_id']})
    

class Add_human_office(MyModel, BSModalUpdateView):
    model = Human
    template_name = 'user/edit_data/update_office.html'
    form_class = UserOfficeCreateForm

    def form_valid(self, form):
        self.instance = form.save(commit=False)
        self.instance.author_update = self.request.user
        return super().form_valid(form)
    
    # параметры в форму
    def get_form_kwargs(self):
        kwargs = super(Add_human_office, self).get_form_kwargs()
        kwargs['initial'] = ({
                'request_user_id': self.request.session['user']['request_user_id']
            })
        return kwargs
    
    
    def get_success_url(self):
        return reverse_lazy('user:user', kwargs={'id': self.request.resolver_match.kwargs['pk']})
    

class HumanOfficeDelete(MyModel, BSModalReadView):
    model = Human
    template_name = 'user/edit_data/delete_human_office.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        human = Human.objects.filter(id = self.request.resolver_match.kwargs['pk']).select_related()[0]

        if human.office.select_related().count() == 1:
            if human.post.select_related().count() == 1:
                if self.request.user == human.user:
                    context['message'] = 'Нельзя удалить собственный аккаунт, обратитесь за помощью в поддержку. Это сделано в целях предотвращения случайного удаления'
                    context['status'] = 1
                else:
                    context['message'] = 'Это полностью удалит сотрудника и всю связанную с ним информацию, после рассмотрения заявки администратором'
                    context['status'] = 1
            else:  
                context['message'] = 'Это приведет к снятию сотрудника с данной должности'
                context['status'] = 2
        else: 
            if human.post.filter(office__id = self.request.resolver_match.kwargs['office_id']).select_related().count() != 1:
                context['message'] = 'Это приведет к снятию сотрудника с данной должности'
                context['status'] = 3
            else:  
                context['message'] = 'Это приведет к снятию сотрудника с данного подразделения'
                context['status'] = 4
        
        context['post_id'] = self.request.resolver_match.kwargs['post_id']
        context['office_id'] = self.request.resolver_match.kwargs['office_id']
        context['human'] = human
        return context
    
    def post(self, request, *args, **kwargs):
        human = Human.objects.filter(id = request.POST.get("human")).select_related()[0]
        if human:
            if int(request.POST.get("status")) == 1 or int(request.POST.get("status")) == 2:
                if int(request.POST.get("status")) == 1:
                    human.is_active = False
                    human.save()
                    return HttpResponseRedirect(self.get_success_url())
                elif  int(request.POST.get("status")) == 2:   
                    human.post.remove( human.post.get(id = request.POST.get("post_id")))
                    human.author_update = self.request.user
                    human.save()
                    return HttpResponseRedirect(self.get_success_url())
            elif int(request.POST.get("status")) == 3 or int(request.POST.get("status")) == 4: 
                if int(request.POST.get("status")) == 3:
                    human.post.remove( human.post.get(id = request.POST.get("post_id")))
                    human.author_update = self.request.user
                    human.save()
                    return HttpResponseRedirect(self.get_success_url())
                elif int(request.POST.get("status")) == 4:  
                    human.post.remove( human.post.get(id = request.POST.get("post_id")))
                    human.office.remove( human.office.get(id = request.POST.get("office_id")))
                    human.author_update = self.request.user
                    human.save()
                    return HttpResponseRedirect(self.get_success_url())
            return HttpResponseRedirect(reverse_lazy('user:company'))
        # except Exception as e:
        #     print(e)
        #     if int(request.POST.get("status")) == 1:
        #         return HttpResponseRedirect(reverse_lazy('user:company'))
        #     else:
        #         print('status', request.POST.get("status"))
        return HttpResponseRedirect(self.get_success_url())

    def get_success_url(self):
        return reverse_lazy('user:user', kwargs={'id': self.request.resolver_match.kwargs['pk']})
    
    


# ---------------------------------Инструкции----------------------
class AccessControlView(MyModel, TemplateView):
    template_name = 'user/profile/instructions/access_control.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Разграничение доступа'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        context['data'] = [
            {'Абсентеизм': {
                'Администратор': 'Полный доступ',
                'Начальник': 'Полный доступ по своему подразделению',
                'Редактор абсентеизма': 'Только чтение и изменение пропусков',
                'Сотрудник': 'Только чтение',
                },
            },
            {'ТГО': {
                'Администратор': 'Полный доступ, полное изменение операций',
                'Начальник': 'Полный доступ по своему подразделению на все, кроме операций. При желании удалить ресурс, ТГО или Технологию, заявка уйдет администратору для дальнейшего рассмотрения и удаления',
                'Редактор ТГО': 'Создание и редактирование ТГО и технологий. При желании удалить ТГО или Технологию, заявка уйдет администратору для дальнейшего рассмотрения и удаления',
                'Сотрудник': 'Только чтение',
                },
            },
            {'Профиль': {
                'Администратор': 'Полный доступ',
                'Начальник': 'Полный доступ по своему подразделению, кроме удаления сотрудников. При желании удалить сотрудника, заявка уйдет администратору для дальнейшего рассмотрения и удаления',
                'Редактор ТГО': 'Создание и редактирование ТГО и технологий',
                'Сотрудник': 'Только чтение',
                },
            },
            {'Расписание': {
                'Администратор': 'Полный доступ, кроме справочников имеющих постоянные данные (Авиакомпании, Флот, Страны, Города, Аэоропрты, Типы рейсов, Типы стран и тп.)',
                'Начальник': 'Только чтение',
                'Редактор МВЛ(ВВЛ, ЕЭАС)': 'Просмотр и использование рейсов созданных другими компаниями. Создание и редактирование рейсов соответствующих типу страны у роли пользователя. Например редактор МВЛ может редактировать только рейсы, где тип страны МВЛ. Если пользователь одновременно "редакторв МВЛ" и "редактор МВЛ", его права суммируются. То же самое для расписания, кроме просмотра расписаний, у каждой компании свое расписание . При желании удалить рейс или плановое расписание, заявка уйдет администратору для дальнейшего рассмотрения и удаления',
                'Сотрудник': 'Только чтение',
                'Дополнительно': 'При создании рейса, подгружаются только авиакомпании, у которых в наличии есть флот. При создании расписания, подгружаются только авиакомпании у которых есть рейсы',
                },
            },
        ]
        return context
class StepActionsView(MyModel, TemplateView):
    template_name = 'user/profile/instructions/step_actions.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Пошаговые действия'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        
        
        
        context['data'] = [
            {'Профиль': 'Для начала в разделе Штат, нужно создать подразделения, и соответствующих сотрудников.' },
            {'ТГО': 'Далее только администратор может добавить соответствующие операции. За этим следует добавление ресурсов, и уже после создание ТГО, Технологий, для разного вида самолетов.'},
            {'Расписание': 'Создание расписание начинается с создания рейсов, и после, соответствующего расписания. К каждому расписанию можно прикрпеить существующее ТГО, подходящее по всем ограничениям (настраивается в ТГО).' },
            {'Аналитика': 'После создания расписания, с действующими ТГО, можно посмотреть для них аналитику.' },    
            {'Распределение ресурсов': 'Так же, после создания расписания, с действующими ТГО, мы можем посмотреть в профиле "Раздел распределение ресурсов, всю информацию, необходимую с расписанием, и связанным с ним ресусрами.' },
            {'Абсентеизм': 'Этот раздел является независимым от остальных, и добавляется по желанию.'},

        ]


        return context







# ---------------------------------Заявки----------------------
class ApplicationsView(MyModel, TemplateView):
    template_name = 'user/profile/application/application.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Заявки'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        # context['operation'] = Operation.objects.select_related('company').filter(company = self.request.session['user']['name_company_id'], is_active=False).order_by('time_update')

        return context


class ApplicationsTGOView(MyModel, TemplateView):
    template_name = 'user/profile/application/application-tgo.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Заявки - ТГО'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))


        # Получаем ID компании из сессии пользователя
        company_id = self.request.session['user']['name_company_id']

        # Создаём фильтры для запроса
        leader_filter = Q(author__leader_user__id=company_id)
        office_filter = Q(author__humans_user__office__сompany__id=company_id)
        filters = leader_filter | office_filter

        context['operation'] = Operation.objects.select_related('company').filter(company = company_id, is_active=False).order_by('time_update')
        context['ressource'] = Ressource.objects.select_related('office__сompany', 'office').filter(office__сompany = company_id, is_active=False).order_by('time_update')

        

        # Получаем объекты TGO
        context['tgo'] = TGO.objects.filter(filters).filter(is_active=False).distinct()
        return context 


class ApplicationsTimetableView(MyModel, TemplateView):
    template_name = 'user/profile/application/application-timetable.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Заявки - Расписание'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        # Получаем ID компании из сессии пользователя
        company_id = self.request.session['user']['name_company_id']

        # Создаём фильтры для запроса
        leader_filter = Q(author__leader_user__id=company_id)
        office_filter = Q(author__humans_user__office__сompany__id=company_id)
        filters = leader_filter | office_filter

        context['timetableList'] = TimetableList.objects.filter(filters).filter(is_active=False)
        context['flight'] = Flight.objects.select_related().filter(company__id = company_id, is_active=False)

        return context


class ApplicationsHumansView(MyModel, TemplateView):
    template_name = 'user/profile/application/application-humans.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Заявки - Сотрудники'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        context['humans']= Human.objects.select_related().filter(office__сompany_id  = self.request.session['user']['name_company_id'], is_active=False)
        return context
    

class HumanNoActiveView(MyModel, SuccessHumanViewURL, BSModalUpdateView, ):
    model = Human
    template_name = 'table_tgo/edit_data/is_active/no-active.html'
    form_class = HumanNoActiveForm

    def form_valid(self, form):
        instance = form.save(commit=False)
        instance.is_active = False
        return super().form_valid(form)
    
class HumanIsActiveView(MyModel,  SuccessHumanViewURL, BSModalUpdateView, ):
    model = Human
    template_name = 'table_tgo/edit_data/is_active/is-active.html'
    form_class = HumanNoActiveForm
    
    def form_valid(self, form):
        instance = form.save(commit=False)
        instance.is_active = True
        return super().form_valid(form)

class HumanFullDeleteView(MyModel, BSModalDeleteView):
    model = Human
    template_name = 'user/edit_data/delete_human.html'
    success_url = reverse_lazy('user:applications-humans')


class ApplicationsForumView(MyModel, TemplateView):
    template_name = 'user/profile/application/application-forum.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Заявки - Вопросы'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))



        # Получаем ID компании из сессии пользователя
        company_id = self.request.session['user']['name_company_id']

        # Создаём фильтры для запроса
        leader_filter = Q(author__leader_user__id=company_id)
        office_filter = Q(author__humans_user__office__сompany__id=company_id)
        filters = leader_filter | office_filter

        context['forum']= Question.objects.select_related().filter(filters).filter(is_active=False)
        return context





# ---------------------------------Импорт----------------------
class ImportView(MyModel, BossOrAdminRolePermissionMixin, TemplateView):
    template_name = 'user/profile/import/importList.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Импорт'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))


        modules = [
                {'title': "Импорт сотруников", 'url_name': 'user:import-humans', 'perm': ['Администратор'] , },
                {'title': "Импорт абсентеизма", 'url_name': 'user:import-snj', 'perm': ['Администратор', 'Начальник'], },
        ]
        modules = [module for module in modules if any(role in self.request.session['user']['user_groups'] for role in module['perm'])]
        context['import_modules'] = modules

        return context


class ImportHumanView(MyModel, AdminRolePermissionMixin, TemplateView):
    template_name = 'user/profile/import/import-human.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Импорт сотрудников'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        # Создайте Q-объект для общих фильтров
        common_filter = Q(
            Q(author__leader_user__id=self.request.session['user']['name_company_id']) |
            Q(author__humans_user__office__сompany__id=self.request.session['user']['name_company_id'])
        )
        context['importList'] = Import.objects.filter(import_name = 'humans').filter(common_filter)
        # фильтрация по компаниям
        return context

class ImportHumanViewCreateView(MyModel, AdminRolePermissionMixin, BSModalCreateView):
    template_name = 'table_tgo/edit_data/create.html'
    form_class = ImportHumanViewModelForm
    success_url = reverse_lazy('user:import-humans')

class ImportHumanViewUpdateView(MyModel, AdminRolePermissionMixin, BSModalUpdateView):
    model = Import
    template_name = 'table_tgo/edit_data/update.html'
    form_class = ImportHumanViewModelForm
    success_url = reverse_lazy('user:import-humans')

class ImportHumanViewDeleteView(MyModel, AdminRolePermissionMixin, BSModalDeleteView):
    model = Import
    template_name = 'table_tgo/edit_data/delete.html'
    success_url = reverse_lazy('user:import-humans')    


class ImportHumanDetailView(MyModel, AdminRolePermissionMixin, TemplateView):
    template_name = 'user/profile/import/import-human-detal.html'
    
    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        pk = self.kwargs.get('pk')
        self.my_import = get_object_or_404(Import, pk=pk)

    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = str(self.my_import.title)
        c_def = self.get_user_context(title='Импорт штата - ' + title)
        context = dict(list(context.items()) + list(c_def.items()))

        context['import'] = self.my_import  
        return context


    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')

        if action == 'delete_file':
            if self.my_import.input_file:
                self.my_import.input_file.delete()  # Физически удаляем файл
                self.my_import.input_file = None  
                self.my_import.output_file.delete()  # Физически удаляем файл
                self.my_import.output_file = None  
                self.my_import.importsnjstatusfield.delete()  
                self.my_import.save()
                return JsonResponse({'status': 'success'})


        # Получение загруженного файла
        uploaded_file = request.FILES.get('file')

        if uploaded_file is None:
            return JsonResponse({'error': 'Не был получен файл.'}, status=400)  # Bad Request

        self.my_import.input_file = uploaded_file
        self.my_import.save()

        # Отправляем ответ, что файл был успешно загружен
        return JsonResponse({'message': 'Файл успешно загружен и сохранен в объекте Import.'})



class ImportSNJView(MyModel, BossOrAdminRolePermissionMixin, TemplateView):
    template_name = 'user/profile/import/import-snj.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'Импорт'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))

        # Создайте Q-объект для общих фильтров для компании
        common_filter = Q(
            Q(author__leader_user__id=self.request.session['user']['name_company_id']) |
            Q(author__humans_user__office__сompany__id=self.request.session['user']['name_company_id'])
        )

        context['importList'] = Import.objects.filter(import_name = 'snj').filter(common_filter)

        example_file = ImportExample.objects.first()
        if example_file:       
            context['example_file_import'] = example_file.input_file
        return context


    def post(self, request, *args, **kwargs):
        # Получение загруженного файла
        uploaded_file = request.FILES.get('file')

        if uploaded_file is None:
            return JsonResponse({'error': 'Не был получен файл.'}, status=400)  # Bad Request

        ImportExample.objects.create(input_file = uploaded_file)

        # Отправляем ответ, что файл был успешно загружен
        return JsonResponse({'message': 'Файл успешно загружен и сохранен в объекте Import.'})



class ImportSNJViewCreateView(MyModel, BossOrAdminRolePermissionMixin, BSModalCreateView):
    template_name = 'table_tgo/edit_data/create.html'
    form_class = ImportSNJViewModelForm
    success_url = reverse_lazy('user:import-snj')

class ImportSNJViewUpdateView(MyModel, BossOrAdminRolePermissionMixin, BSModalUpdateView):
    model = Import
    template_name = 'table_tgo/edit_data/update.html'
    form_class = ImportSNJViewModelForm
    success_url = reverse_lazy('user:import-snj')

class ImportSNJViewDeleteView(MyModel, BossOrAdminRolePermissionMixin, BSModalDeleteView):
    model = Import
    template_name = 'table_tgo/edit_data/delete.html'
    success_url = reverse_lazy('user:import-snj')    


class ImportSNJDetailView(MyModel, BossOrAdminRolePermissionMixin, TemplateView):
    template_name = 'user/profile/import/import-snj-detal.html'
    
    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        pk = self.kwargs.get('pk')
        self.my_import = get_object_or_404(Import.objects.select_related('importsnjstatusfield'), pk=pk)
        self.wb, self.filename = '', ''

        if self.my_import.author != request.user:
            return HttpResponseRedirect(reverse_lazy('user:import-snj'))

    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = str(self.my_import.title)
        c_def = self.get_user_context(title='Импорт - ' + title)
        context = dict(list(context.items()) + list(c_def.items()))

        context['import'] = self.my_import  
        input_file = self.my_import.input_file

        if input_file:
            try:
                result_df = self.read_input_file(input_file)
                context['table_input_file'] = result_df.to_html(classes='table-striped table_dt')
                csv_data = result_df.to_csv(index=False)

                status_field, created = ImportSNJStatusField.objects.get_or_create(import_parent=self.my_import)
                if created: 
                    status_field.input_file_modify_original = csv_data
                    status_field.input_file_modify = csv_data
                    status_field.save()
                context['status_field'] = status_field

                fields = [
                    {'field_name': 'office', 'display_name': 'Подразделение'},
                    {'field_name': 'post', 'display_name': 'Должность'},
                    {'field_name': 'fio', 'display_name': 'ФИО'},
                ]
                context['fields'] = fields

                
                context['reasons'] = Reason.objects.all()
                context['shifts'] = Shift.objects.all()
                
                if self.my_import.importsnjstatusfield and self.my_import.importsnjstatusfield.input_file_modify:
                    modify_file_content = self.my_import.importsnjstatusfield.input_file_modify
                    # print(modify_file_content)
                    csv_modify_file = self.get_file_csv_to_df(modify_file_content)
                    if csv_modify_file is not None:  # проверяем, что DataFrame не пустой
                        context['modify_file'] = csv_modify_file.to_html(na_rep='', classes='table-striped modify_file')
            except Exception as e:
                print(e)
                context['error_input'] = 'Входной файл не был успешно преобразован, проверьте пожалуйста структуру заголовков, она должна точно совпадать с той что в шаблоне.'

        return context


    def get_file_csv_to_df(self, file_content):
        buffer = io.StringIO(file_content)
        df = pd.read_csv(buffer, header=None)
        
        # Присваиваем строку с индексом 0 заголовкам DataFrame
        df.columns = df.iloc[0]
        
        # Удаляем строку с индексом 0
        df = df.drop(0).reset_index(drop=True)

        # Устанавливаем индексы столбцов, которые должны быть числами
        numeric_column_indices = [4]  # Индексы для четвертого и пятого столбцов
  
        # После создания df
        for column in numeric_column_indices:
            # Приведение типа с обработкой исключений, если не удаётся преобразовать в int
            df.iloc[:, column] = pd.to_numeric(df.iloc[:, column], errors='coerce').astype(pd.Int32Dtype())
 
        return df

    def delete_file(self, request, *args, **kwargs):
        if self.my_import.input_file:
            self.my_import.input_file.delete()  # Физически удаляем файл
            self.my_import.input_file = None  # Обнуляем поле файла в базе данных
            self.my_import.output_file.delete()  # Физически удаляем файл
            self.my_import.output_file = None  
            self.my_import.importsnjstatusfield.delete()  
            self.my_import.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error'})  

    def refresh_import(self, request, *args, **kwargs):
        if self.my_import.output_file_to_admin:
           
            # Открываем файл 
            with open(self.my_import.output_file_to_admin.path, 'rb') as file:
                wb = load_workbook(file)
                ws = wb.active
                

            objects_to_delete = {
                'ScheduleNotJob': [],
                'Human': [],
                'User': [],
                'Post': [],
                'Office': [],
            }

            current_category = None

            for row in ws.iter_rows(min_row=1, values_only=True):
                if row[0] is None:
                    current_category = None
                if isinstance(row[0], str) and row[0] in objects_to_delete:
                    current_category = row[0]
                    continue
                if current_category and str(row[0]).isdigit():
                    objects_to_delete[current_category].append(row[0])

            # Удаляем объекты из базы данных
            for category, ids in objects_to_delete.items():
                if ids:  # Если есть ID для удаления
                    model = None
                    # Определяем модель по категории
                    if category == 'ScheduleNotJob':
                        model = ScheduleNotJob
                    elif category == 'Human':
                        model = Human
                    elif category == 'User':
                        model = User
                    elif category == 'Post':
                        model = Post
                    elif category == 'Office':
                        model = Office

                    if model:
                        try:
                            model.objects.filter(id__in=ids).delete()
                        except ProtectedError:
                            print(f"Some {category} objects cannot be deleted because they are protected.")

            # удалить все файлы импорта и статусы
            self.my_import.output_file_to_admin = None
            self.my_import.output_file = None
            self.my_import.save()
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error'})         

    def start_import(self, request, *args, **kwargs):
        try:
            import_obj = self.my_import
            status_field = import_obj.importsnjstatusfield  
            input_file_modify = status_field.input_file_modify    


            if input_file_modify:
                df = self.get_file_csv_to_df(input_file_modify)
                fake = Faker()

                # Удаление дубликатов
                unique_offices = df['Подразделение'].drop_duplicates()
                unique_posts = df[['Подразделение', 'Должность']].drop_duplicates()
                unique_humans = df[['Подразделение', 'Должность', 'ФИО', 'Смена']].drop_duplicates()
                unique_humans['Табельный номер'] = df.loc[unique_humans.index, 'Табельный номер']

                offices_to_create = []
                posts_to_create = []
                humans_to_create = []
                users_to_create = []
                snjs_to_create = []


                offices_to_create_admin = []
                posts_to_create_admin = []
                humans_to_create_admin = []
                users_to_create_admin = []
                snjs_to_create_admin = []

                group_employee = Group.objects.get(name='Сотрудник')
                
                # Получение существующих офисов и должностей для оптимизации запросов
                all_offices_dict = {office.title: office for office in Office.objects.filter(сompany__id = self.request.session['user']['name_company_id'], title__in=unique_offices)}
                office_ids = all_offices_dict.keys()
                all_posts = Post.objects.filter(office__title__in=office_ids).select_related('office')
                all_posts_dict = {(post.office.title, post.title): post for post in all_posts}

                all_reason_dict = {reason.title: reason for reason in Reason.objects.all()}
                all_shift_dict = {shift.title: shift for shift in Shift.objects.all()}

                # Начинаем транзакцию
                with transaction.atomic():
                    # Обработка офисов
                    for office_title in unique_offices:
                        office = all_offices_dict.get(office_title)
                        if not office:
                            office = Office.objects.create(
                                title=office_title,
                                сompany_id=request.session['user']['name_company_id']
                            )
                            offices_to_create.append(office_title)
                            all_offices_dict[office_title] = office
                            offices_to_create_admin.append(office) 


                    # Обработка должностей
                    for _, post_row in unique_posts.iterrows():
                        office_title, post_title = post_row['Подразделение'], post_row['Должность']
                        office = all_offices_dict[office_title]
                        post_key = (office_title, post_title)
                        post = all_posts_dict.get(post_key)
                        if not post:
                            post = Post.objects.create(
                                title=post_title,
                                office=office
                            )
                            posts_to_create.append(f"{office_title} - {post_title}")
                            all_posts_dict[post_key] = post
                            posts_to_create_admin.append(post) 

                    # Обработка сотрудников
                    humans_dict = {}

                    for index, human_row in unique_humans.iterrows():

                        office_title, post_title, fio = human_row['Подразделение'], human_row['Должность'], human_row['ФИО']
                        employee_number = human_row['Табельный номер']
                        employee_number = None if pd.isna(employee_number) else employee_number

                        # Разделение ФИО на составляющие
                        fio_parts = fio.split()
                        last_name, first_name, sur_name = (fio_parts + ['', '', ''])[:3]

                        # Проверка существования сотрудника
                        human = Human.objects.filter(
                            first_name=first_name,
                            last_name=last_name,
                            sur_name=sur_name,
                            office__title=office_title,
                            office__сompany_id=request.session['user']['name_company_id']
                        ).first()

                        if human:
                            # Обновляем информацию о сотруднике, если он уже существует
                            human.author_update = request.user
                            human.save(update_fields=['author_update', 'employee_number'])
                            users_to_create.append((str(human.user.email), 'уже существовал'))
                        else:
                            # Создаем нового пользователя и сотрудника, если он не существует
                            user_count = User.objects.count() + 1                            
                            current_date = datetime.now().strftime('%Y%m%d')
                            email = f'test{user_count}{current_date}{generate_random_string()}@test.ru'

                            password = fake.password()
                            created_user = User.objects.create_user(username=email, email=email, password=password)
                            group_employee.user_set.add(created_user)

                            shift_title = human_row['Смена']
                            if shift_title in [None, 'nan'] or isinstance(shift_title, float): 
                                shift_instance = None
                            else:
                                shift_instance = all_shift_dict[shift_title]


                            human = Human.objects.create(
                                first_name=first_name,
                                last_name=last_name,
                                sur_name=sur_name,
                                status=WorkStatus.objects.get(title='Штатно'),
                                date_start=datetime.now(),
                                author_update=request.user,
                                employee_number=employee_number,
                                user=created_user,
                                groups = 'Сотрудник',
                                shift = shift_instance,
                            )
                            humans_to_create.append(f"{office_title} - {post_title} - {first_name} {last_name} {sur_name}")
                            users_to_create.append((email, password))
                            
                            humans_to_create_admin.append(human) 
                            users_to_create_admin.append(created_user) 

                        # Назначаем сотруднику офис и должность
                        office_instance = all_offices_dict[office_title]
                        post_instance = all_posts_dict[(office_title, post_title)]
                        
                        human.office.add(office_instance)
                        human.post.add(post_instance)

                        # Внутри цикла, где создается или получается экземпляр Human
                        human_key = f"{office_instance.id}_{post_instance.id}_{human}"

                        # Сохраняем экземпляр Human в словарь
                        humans_dict[human_key] = human


                    # Создание объектов ScheduleNotJob для каждого сотрудника
                    for index, snj_row in df.iterrows():
                        # Получение или создание экземпляров офиса и должности
                        office_title = snj_row['Подразделение']
                        post_title = snj_row['Должность']
                        reason_title = snj_row['Причина']
                        if reason_title in [None, 'nan'] or isinstance(reason_title, float): 
                            reason_instance = None
                        else:
                            reason_instance = all_reason_dict[reason_title]
                        

                        # Пытаемся получить объекты офиса и должности, если они существуют
                        office_instance = all_offices_dict[office_title]
                        post_instance = all_posts_dict[(office_title, post_title)]
                        
                        
                        # Обработка ФИО
                        full_name = snj_row['ФИО'].split()
                        first_name = full_name[1] if len(full_name) > 1 else ''
                        last_name = full_name[0] if full_name else ''
                        sur_name = full_name[2] if len(full_name) > 2 else ''

                        # Пытаемся найти сотрудника
                        try:
                            human_instance = Human.objects.get(
                                first_name=first_name,
                                last_name=last_name,
                                sur_name=sur_name,
                                office=office_instance,
                                post=post_instance
                            )
                        except Human.DoesNotExist:
                            # Логика создания нового сотрудника, если он не найден
                            continue
                        # print(snj_row.get('Количество календарных дней', 0))
                        # print(snj_row.get('Начало отпуска(приоритет)') or snj_row.get('Начало отпуска(не приоритет)'), snj_row.get('Окончание пропуска'))

                        date_start = self.get_date(snj_row.get('Начало пропуска'))
                        date_end = self.get_date(snj_row.get('Окончание пропуска'))
                        # print(date_start, date_end)
                        comment = snj_row.get('Примечание', '') 
                        if comment in [None, 'nan'] or isinstance(comment, float): 
                            comment = ''

                        # Создание ScheduleNotJob
                        snj_instance = ScheduleNotJob(
                            office=office_instance,
                            post=post_instance,
                            human=human_instance,
                            reason = reason_instance,
                            comment=comment,
                            length_time = self.get_length_time(snj_row.get('Количество календарных дней', 0)),
                            date_start=date_start,
                            date_end=date_end,  # Предположим, что это конец периода
                            author=request.user,  # Текущий пользователь, определенный в запросе
                            editor=request.user  # Текущий пользователь, определенный в запросе
                        )
                        # Сохраняем объект, если нужно
                        snj_instance.save()
                        snjs_to_create.append(snj_instance)


                    # Записываем данные в Excel после успешного завершения транзакции
                    self.create_excel_report(offices_to_create, posts_to_create, humans_to_create, users_to_create, snjs_to_create, import_obj)

                    # Записываем данные в Excel где строгие названия и id созданных данных
                    self.create_excel_report_to_admin(offices_to_create_admin, posts_to_create_admin, humans_to_create_admin, users_to_create_admin, snjs_to_create, import_obj)
                    
                    # После создания отчета принудительно вызываем исключение, чтобы отменить транзакцию
                    # raise Exception("Test complete - transaction rolled back")
                return JsonResponse({'status': 'success'}) 
            else:
                return JsonResponse({'status': 'error'})         
        except Exception as e:
            print(e)
            if not str(e) == "Test complete - transaction rolled back":
                return JsonResponse({'status': 'error'}) 
            else:
                return JsonResponse({'status': 'error'}) 

    def get_length_time(self, value):
        # Проверяем, не является ли значение NaN или None
        if pd.isna(value):
            # Если это NaN, возвращаем None
            return None
        try:
            # Преобразование значения в целое число
            return int(value)
        except ValueError:
            # Если преобразование не удалось, возвращаем 0
            return None
    
    def is_valid_date(self, date):
        # Преобразуем число в строку, если это необходимо
        if isinstance(date, float) or isinstance(date, int):
            # Предполагая, что число представляет дату в формате Excel.
            date = str(int(date))
        if isinstance(date, str):
            try:
                datetime.strptime(date, "%d.%m.%Y")
                return True
            except ValueError:
                return False
        return False
        
    def create_excel_report(self, offices, posts, humans, users, snjs, import_obj):
       # Предполагается, что offices, posts, humans, users уже определены и содержат списки
        # print('start excel')
        wb = Workbook()
        ws = wb.active

        bold_font = Font(bold=True)

        # Создание раздела для офисов и применение жирного шрифта к заголовку
        ws.append(['Подразделения'])
        ws['A' + str(ws.max_row)].font = bold_font  # Устанавливаем шрифт последней добавленной ячейки
        for office in offices:
            ws.append([office])

        # Добавление пустой строки между разделами
        ws.append([])
        ws.append([])

        # Создание раздела для должностей и применение жирного шрифта к заголовку
        ws.append(['Должности'])
        ws['A' + str(ws.max_row)].font = bold_font
        for post in posts:
            ws.append([post])

        # Добавление пустой строки между разделами
        ws.append([])
        ws.append([])

        # Создание раздела для сотрудников и применение жирного шрифта к заголовку
        ws.append(['Сотрудники'])
        ws['A' + str(ws.max_row)].font = bold_font

        for human, user in zip_longest(humans, users, fillvalue=''):
            # Добавляем информацию о сотруднике
            human_row = ws.max_row + 1  # Получаем номер новой строки для сотрудника
            ws.append([human])

            # Добавляем статичные значения "Логин:" и "Пароль"
            login_row = ws.max_row + 1  # Получаем номер новой строки для логина
            ws.append(['Логин:', 'Пароль'])
            ws['A' + str(login_row)].font = bold_font
            ws['B' + str(login_row)].font = bold_font

            # Добавляем информацию о пользователе
            ws.append(list(user))

            # Добавление пустой строки
            ws.append([])

        # Добавляем раздел для SNJ
        ws.append(['Расписание не работ'])
        ws['A' + str(ws.max_row)].font = bold_font

        
        # Подготовка заголовков для SNJ
        snj_headers = ['Сотрудник', 'Подразделение', 'Должность', 'Длительность', 'Начало', 'Окончание', 'Примечание']
        ws.append(snj_headers)
        for header_cell in ws[ws.max_row]:
            header_cell.font = bold_font

        # Устанавливаем ширину столбцов до добавления данных
        ws.column_dimensions['E'].width = 15  # Устанавливаем ширину столбца для 'Начало'
        ws.column_dimensions['F'].width = 15  # Устанавливаем ширину столбца для 'Окончание'

        # Добавляем данные для каждого SNJ
        for snj in snjs:
            ws.append([
                snj.human.__str__(),
                snj.office.title if snj.office else None,
                snj.post.title if snj.post else None,
                snj.length_time,
                snj.date_start.strftime('%d.%m.%Y') if snj.date_start else None,
                snj.date_end.strftime('%d.%m.%Y') if snj.date_end else None,
                snj.comment,
            ])


        output = BytesIO()
        wb.save(output)
        filename = f"{import_obj.title}_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
        output.seek(0)

    
        # Создаем ContentFile из содержимого BytesIO
        content_file = ContentFile(output.getvalue(), name=filename)

        # Сохраняем ContentFile в файловое поле модели
        self.my_import.output_file.save(name=filename, content=content_file, save=True)


    def create_excel_report_to_admin(self, offices, posts, humans, users, snjs, import_obj):
        wb = Workbook()
        ws = wb.active

        bold_font = Font(bold=True)

        # Добавляем раздел для SNJ
        ws.append(['ScheduleNotJob'])
        ws.append(['ID', 'Сотрудник', 'Подразделение', 'Должность', 'Длительность', 'Начало', 'Окончание', 'Примечание'])
        ws['A' + str(ws.max_row)].font = bold_font

        # Добавляем данные для каждого SNJ в обратном порядке
        for snj in reversed(snjs):
            ws.append([
                snj.id,
                snj.human.__str__(),
                snj.office.title if snj.office else None,
                snj.post.title if snj.post else None,
                snj.length_time,
                snj.date_start.strftime('%d.%m.%Y') if snj.date_start else None,
                snj.date_end.strftime('%d.%m.%Y') if snj.date_end else None,
                snj.comment,
            ])

        # Добавление пустой строки между разделами
        ws.append([])
        ws.append([])

        # Создание раздела для сотрудников
        ws.append(['Human'])
        ws.append(['ID', 'Сотрудник'])
        ws['A' + str(ws.max_row)].font = bold_font

        for human in reversed(humans):    
            ws.append([human.id, human.__str__()])

        # Добавление пустой строки между разделами
        ws.append([])
        ws.append([])


        # Создание раздела для пользователей
        ws.append(['User'])
        ws.append(['ID', 'Логин', 'Пароль'])
        ws['A' + str(ws.max_row)].font = bold_font

        for user in reversed(users):
            ws.append([user.id, user.username, '********'])  # Предполагаем, что пароль не отображается

        # Добавление пустой строки между разделами
        ws.append([])
        ws.append([])


        # Создание раздела для должностей
        ws.append(['Post'])
        ws.append(['ID', 'Должность'])
        ws['A' + str(ws.max_row)].font = bold_font
        for post in reversed(posts):
            ws.append([post.id, post.title])

        # Добавление пустой строки между разделами
        ws.append([])
        ws.append([])

        # Создание раздела для офисов
        ws.append(['Office'])
        ws.append(['ID', 'Подразделение'])
        ws['A' + str(ws.max_row)].font = bold_font
        for office in reversed(offices):
            ws.append([office.id, office.title])

        # Сохраняем файл
        output = BytesIO()
        wb.save(output)
        filename = f"admin_{import_obj.title}_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
        output.seek(0)

        # Создаем ContentFile из содержимого BytesIO
        content_file = ContentFile(output.getvalue(), name=filename)

        # Сохраняем ContentFile в файловое поле модели для администратора
        import_obj.output_file_to_admin.save(name=filename, content=content_file, save=True)
        

    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')

        if action == 'delete_file':
            return self.delete_file(request)

        elif action == 'start_import':
            return self.start_import(request)

        elif action == 'refresh_import':
            return self.refresh_import(request)
            
        else:
            # Получение загруженного файла
            uploaded_file = request.FILES.get('file')

            if uploaded_file is None:
                return JsonResponse({'error': 'Не был получен файл.'}, status=400)  # Bad Request

            self.my_import.input_file = uploaded_file
            self.my_import.save()

            # Отправляем ответ, что файл был успешно загружен
            return JsonResponse({'message': 'Файл успешно загружен и сохранен в объекте Import.'})


    def read_input_file(self, input_file):
        with open(input_file.path, 'rb') as file:
            wb = load_workbook(file)
            ws = wb.active

        # Получите все значения в виде списка списков
        data = list(ws.values)

        # Ищите строки, с которых начинаются таблицы
        start_rows = [idx for idx, row in enumerate(data) if row and row[0] == 'Структурное подразделение']

        if not start_rows:
            return None

        # Список для хранения отфильтрованных данных
        filtered_data = []

        for i, start_row in enumerate(start_rows):
            if i == len(start_rows) - 1:  # Если это последняя найденная таблица
                end_row = len(data)
            else:
                end_row = start_rows[i + 1] - 1

            df_data = data[start_row:end_row]
            for row in df_data:
                if self.custom_filter_row(row):  # Если строка удовлетворяет условиям фильтра
                    row = ['' if item is None else item for item in row]
                    filtered_data.append(row)

        # Если отфильтрованные данные не пусты, преобразуем их в DataFrame
        if filtered_data:
            # Устанавливаем индексы столбцов, которые должны быть числами
            numeric_column_indices = [4, 5]

            # Преобразуем данные
            converted_data = []
            for row in filtered_data:
                new_row = [str(item) if idx not in numeric_column_indices else pd.to_numeric(item, errors='coerce') for idx, item in enumerate(row)]
                converted_data.append(new_row)
            df = pd.DataFrame(converted_data)

            # После создания df
            for column in df.columns:
                if column not in numeric_column_indices:
                    df[column] = df[column].astype(str)
                else:
                    # Для колонок с числами установить float или int в зависимости от данных
                    df[column] = df[column].astype(int, errors='ignore')



            # разбираемся с датами    
            for index, row in df.iterrows():
                if not self.get_date(row[6]):
                    df.at[index, 6] = row[7]

            # Удалить столбцы с индексами 5, 8 и 11
            df.drop(df.columns[[5, 7, 8, 9, 11]], axis=1, inplace=True)


            # # Переименовываем столбцы
            df.columns = ['Подразделение', 'Должность', 'ФИО', 'Табельный номер', 'Количество календарных дней', 
                        'Начало пропуска', 'Окончание пропуска', 'Примечание']
            df.insert(7, "Причина", '')
            df.insert(8, "Смена", '')
            df = self.filter_row_permissions(df)           

            return df
        else:
            return None  # Возвращаем None, если после фильтрации ничего не осталось

    def get_date(self, date_value):
        if pd.isna(date_value):
            return None
        if isinstance(date_value, float) or isinstance(date_value, int):
            date_value = str(int(date_value))
        if isinstance(date_value, str) and self.is_valid_date(date_value):
            return datetime.strptime(date_value, "%d.%m.%Y")
        return None

    def filter_row_permissions(self, df):
        if  self.request:
            user_groups = [item.strip() for item in self.request.session['user']['user_groups'] ] 
        else:
            user_groups = []

        flag = False
        # Найдем совпадения
        for item_list in user_groups:
            if item_list == 'Администратор':
                flag = True
                return df
            elif item_list == 'Начальник':
                flag = True
                user_id = request.session['user']['request_user_id']
                my_offices = Office.objects.filter(humans__user_id=user_id)
                office_titles = my_offices.values_list('title', flat=True)
                office_titles_list = list(office_titles)

                # Отфильтруйте DataFrame на основе названий офисов
                filtered_df = df[0][df[0].iloc[:, 0].isin(office_titles_list)]
                break

        if flag:    
            return df
        else:
            return []

    def custom_filter_row(self, row):
        for i in [0, 1]:  # проверка для row[0] и row[1]
            cell_value = row[i]
            if cell_value is None:
                return False
                
            if str(cell_value).isdigit():
                return False

        # Проверка для row[2] и row[3]
        if (row[2] is None or str(row[2]).isdigit()):
            return False

        fifth_cell_value = row[4]
        
        # Проверяем, является ли пятая ячейка пустой или содержит числа
        if fifth_cell_value is None or str(fifth_cell_value).isdigit():
            return True
        
        return False



class ImportCheckInputStatusView(MyModel, BossOrAdminRolePermissionMixin, TemplateView):
    template_name = 'user/profile/import/import-snj-mofidy_file.html'
    
    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        import_id = self.kwargs.get('import_id')
        self.obj = ImportSNJStatusField.objects.get(import_parent_id=import_id)

        if self.obj.import_parent.author != request.user:
            return HttpResponseRedirect(reverse_lazy('user:import-snj'))


    def get(self, request, *args, **kwargs):
        field_name = self.kwargs.get('field_name')
        import_id = self.kwargs.get('import_id')

        if field_name == 'office_reset':
            input_file_modify = self.obj.input_file_modify
            input_file_modify_original = self.obj.input_file_modify_original

            # Шаг 1: Прочитать оба файла с помощью pandas
            buffer_modify = io.StringIO(input_file_modify)
            df_modify = pd.read_csv(buffer_modify)

            buffer_original = io.StringIO(input_file_modify_original)
            df_original = pd.read_csv(buffer_original)

            # Шаг 2: Заменить 2 и 3 столбец в df_modify данными из df_original
            df_modify.iloc[:, 0] = df_original.iloc[:, 0]
            df_modify.iloc[:, 1] = df_original.iloc[:, 1]
            df_modify.iloc[:, 2] = df_original.iloc[:, 2]

            # Шаг 3: Сохранить измененный DataFrame обратно в self.obj.input_file_modify
            output_buffer = io.StringIO()
            df_modify.to_csv(output_buffer, index=False)
            self.obj.input_file_modify = output_buffer.getvalue()

            self.obj.office = False
            self.obj.post = False
            self.obj.fio = False
            self.obj.save()

            pk = self.obj.import_parent.id
            return HttpResponseRedirect(reverse_lazy('user:import-snj-detail', kwargs={'pk': pk}))

        if field_name == 'post_reset':
            input_file_modify = self.obj.input_file_modify
            input_file_modify_original = self.obj.input_file_modify_original

            # Шаг 1: Прочитать оба файла с помощью pandas
            buffer_modify = io.StringIO(input_file_modify)
            df_modify = pd.read_csv(buffer_modify)

            buffer_original = io.StringIO(input_file_modify_original)
            df_original = pd.read_csv(buffer_original)

            # Шаг 2: Заменить 2 и 3 столбец в df_modify данными из df_original
            df_modify.iloc[:, 1] = df_original.iloc[:, 1]
            df_modify.iloc[:, 2] = df_original.iloc[:, 2]

            # Шаг 3: Сохранить измененный DataFrame обратно в self.obj.input_file_modify
            output_buffer = io.StringIO()
            df_modify.to_csv(output_buffer, index=False)
            self.obj.input_file_modify = output_buffer.getvalue()

            self.obj.office = True
            self.obj.post = False
            self.obj.fio = False
            self.obj.save()

            pk = self.obj.import_parent.id
            return HttpResponseRedirect(reverse_lazy('user:import-snj-detail', kwargs={'pk': pk}))


        if field_name == 'fio_reset':
            input_file_modify = self.obj.input_file_modify
            input_file_modify_original = self.obj.input_file_modify_original

            # Шаг 1: Прочитать оба файла с помощью pandas
            buffer_modify = io.StringIO(input_file_modify)
            df_modify = pd.read_csv(buffer_modify)

            buffer_original = io.StringIO(input_file_modify_original)
            df_original = pd.read_csv(buffer_original)

            # Шаг 2: Заменить 3 столбец в df_modify данными из df_original
            df_modify.iloc[:, 2] = df_original.iloc[:, 2]

            # Шаг 3: Сохранить измененный DataFrame обратно в self.obj.input_file_modify
            output_buffer = io.StringIO()
            df_modify.to_csv(output_buffer, index=False)
            self.obj.input_file_modify = output_buffer.getvalue()

            self.obj.office = True
            self.obj.post = True
            self.obj.fio = False
            self.obj.save()

            pk = self.obj.import_parent.id
            return HttpResponseRedirect(reverse_lazy('user:import-snj-detail', kwargs={'pk': pk}))

        if field_name == 'date_reset':
            input_file_modify = self.obj.input_file_modify
            input_file_modify_original = self.obj.input_file_modify_original

            # Шаг 1: Прочитать оба файла с помощью pandas
            buffer_modify = io.StringIO(input_file_modify)
            df_modify = pd.read_csv(buffer_modify)

            buffer_original = io.StringIO(input_file_modify_original)
            df_original = pd.read_csv(buffer_original)

            # Шаг 2: Заменить 2 и 3 столбец в df_modify данными из df_original
            df_modify.iloc[:, 4] = df_original.iloc[:, 4]
            df_modify.iloc[:, 5] = df_original.iloc[:, 5]
            df_modify.iloc[:, 6] = df_original.iloc[:, 6]

            # Шаг 3: Сохранить измененный DataFrame обратно в self.obj.input_file_modify
            output_buffer = io.StringIO()
            df_modify.to_csv(output_buffer, index=False)
            self.obj.input_file_modify = output_buffer.getvalue()


            self.obj.date = False
            self.obj.save()

            pk = self.obj.import_parent.id
            return HttpResponseRedirect(reverse_lazy('user:import-snj-detail', kwargs={'pk': pk}))

        if field_name == 'reason_reset':
            input_file_modify = self.obj.input_file_modify
            input_file_modify_original = self.obj.input_file_modify_original

            # Шаг 1: Прочитать оба файла с помощью pandas
            buffer_modify = io.StringIO(input_file_modify)
            df_modify = pd.read_csv(buffer_modify)

            buffer_original = io.StringIO(input_file_modify_original)
            df_original = pd.read_csv(buffer_original)

            # Шаг 2: Заменить 2 и 3 столбец в df_modify данными из df_original
            df_modify.iloc[:, 7] = df_original.iloc[:, 7]

            # Шаг 3: Сохранить измененный DataFrame обратно в self.obj.input_file_modify
            output_buffer = io.StringIO()
            df_modify.to_csv(output_buffer, index=False)
            self.obj.input_file_modify = output_buffer.getvalue()

            self.obj.reason = False
            self.obj.save()

            pk = self.obj.import_parent.id
            return HttpResponseRedirect(reverse_lazy('user:import-snj-detail', kwargs={'pk': pk}))

        if field_name == 'shift_reset':
            input_file_modify = self.obj.input_file_modify
            input_file_modify_original = self.obj.input_file_modify_original

            # Шаг 1: Прочитать оба файла с помощью pandas
            buffer_modify = io.StringIO(input_file_modify)
            df_modify = pd.read_csv(buffer_modify)

            buffer_original = io.StringIO(input_file_modify_original)
            df_original = pd.read_csv(buffer_original)

            # Шаг 2: Заменить 2 и 3 столбец в df_modify данными из df_original
            df_modify.iloc[:, 8] = df_original.iloc[:, 8]

            # Шаг 3: Сохранить измененный DataFrame обратно в self.obj.input_file_modify
            output_buffer = io.StringIO()
            df_modify.to_csv(output_buffer, index=False)
            self.obj.input_file_modify = output_buffer.getvalue()

            self.obj.shift = False
            self.obj.save()

            pk = self.obj.import_parent.id
            return HttpResponseRedirect(reverse_lazy('user:import-snj-detail', kwargs={'pk': pk}))

        if field_name == 'comment_reset':
            input_file_modify = self.obj.input_file_modify
            input_file_modify_original = self.obj.input_file_modify_original

            # Шаг 1: Прочитать оба файла с помощью pandas
            buffer_modify = io.StringIO(input_file_modify)
            df_modify = pd.read_csv(buffer_modify)

            buffer_original = io.StringIO(input_file_modify_original)
            df_original = pd.read_csv(buffer_original)

            # Шаг 2: Заменить 2 и 3 столбец в df_modify данными из df_original
            df_modify.iloc[:, 9] = df_original.iloc[:, 9]

            # Шаг 3: Сохранить измененный DataFrame обратно в self.obj.input_file_modify
            output_buffer = io.StringIO()
            df_modify.to_csv(output_buffer, index=False)
            self.obj.input_file_modify = output_buffer.getvalue()

            self.obj.comment = False
            self.obj.save()

            pk = self.obj.import_parent.id
            return HttpResponseRedirect(reverse_lazy('user:import-snj-detail', kwargs={'pk': pk}))

    

        fields = {
            'office': 'Подразделения',
            'post': 'Должности',
            'fio': 'ФИО',
            'date': 'Даты',
            'shift': 'Смены',
            'reason': 'Причины',
            'comment': 'Комментарии',

        }
        
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title='Проверка значений - ' + fields[field_name])
        context = dict(list(context.items()) + list(c_def.items()))

        index_fields_in_file = {
            'office': 0,
            'post': 1,
            'fio': 2,
            'date': 3,
            'shift': 4,
            'reason': 5,
            'comment': 6,
        }

        context['field_name'] = fields[field_name]
        context['field_name_original'] = field_name
        context['modify_column'] = index_fields_in_file[field_name] + 1
        context['import_id'] = import_id
        row_field_checked = []

        if field_name == 'office':
            self.template_name = 'user/profile/import/import-snj-mofidy_file_office.html'
            row_field = self.get_file_csv_to_df(self.obj.input_file_modify, [0])
            all_offices = set(Office.objects.filter(сompany__id = self.request.session['user']['name_company_id']).values_list('title', flat=True))
  
            for _, row in row_field.iterrows():
                record_value = row[index_fields_in_file[field_name]]

                entry = {
                    'record': record_value,
                    'exists': record_value in all_offices,
                }
                # if not entry['exists']:
                entry['existing_options'] = list(all_offices)
                row_field_checked.append(entry)
         
        if field_name == 'post':
            self.template_name = 'user/profile/import/import-snj-mofidy_file_post.html'

            # csv
            row_field = self.get_file_csv_to_df(self.obj.input_file_modify, [0, index_fields_in_file[field_name]])

            # Заранее получаем все уникальные комбинации офис-пост из базы данных
            all_existing_posts = Post.objects.filter(office__сompany__id=self.request.session['user']['name_company_id']).values_list('office__title', 'title')
            existing_office_to_posts_map = defaultdict(list)

            for office, post in all_existing_posts:
                existing_office_to_posts_map[office].append(post)

            all_office_post_combinations = set(all_existing_posts) # Получаем множество для проверки наличия комбинаций

            for record in row_field.itertuples(index=False):  # Итерация по строкам DataFrame как кортежам
                office_from_record = record[0]  # Первый столбец
                post_from_record = record[1]    # Второй столбец

                exists = (office_from_record, post_from_record) in all_office_post_combinations

                entry = {
                    'office': office_from_record,
                    'post': post_from_record,
                    'exists': exists
                }

                # if not exists:
                entry['existing_options'] = existing_office_to_posts_map.get(office_from_record, [])

                row_field_checked.append(entry)

        if field_name == 'fio':
            self.template_name = 'user/profile/import/import-snj-mofidy_file_fio.html'
            
            # csv
            row_field = self.get_file_csv_to_df(self.obj.input_file_modify, [0, 1, index_fields_in_file[field_name], index_fields_in_file[field_name]+1], unique=False)
            
            # Получаем всех людей и их связанные офисы и должности
            humans = Human.objects.filter(
                office__сompany__id=self.request.session['user']['name_company_id']
            ).prefetch_related('office', 'post')
            

            ## Словарь для проверки существующих ФИО с их табельными номерами
            existing_employee_numbers = {human.employee_number: f"{human.last_name} {human.first_name} {human.sur_name}" for human in humans if human.employee_number}

            # Словарь для проверки существующих комбинаций офиса и должности с ФИО
            existing_combinations_map = defaultdict(lambda: defaultdict(set))
            for human in humans:
                for office in human.office.all():
                    for post in human.post.all():
                        fio_key = f"{human.last_name} {human.first_name} {human.sur_name}"
                        existing_combinations_map[office.title][post.title].add(fio_key)

            for record in row_field.itertuples(index=False):                
                office_from_record = record[0]
                post_from_record = record[1]
                fio_from_record = f"{record[2]}"  # Предполагаем, что ФИО состоит из трех частей
                employee_number_from_record = record[3]  # Предполагаем, что номер сотрудника идет после ФИО

                fio_exists = fio_from_record in existing_combinations_map.get(office_from_record, {}).get(post_from_record, set())
                employee_number_exists = employee_number_from_record in existing_employee_numbers

                # Проверяем совпадение ФИО и табельного номера
                correct_employee_number = existing_employee_numbers.get(employee_number_from_record)

                if fio_exists and employee_number_exists and correct_employee_number != fio_from_record:
                    # Если ФИО и табельный номер не совпадают
                    fio_exists = False  # Сбрасываем табельный номер
                    employee_number_from_record = None  # Сбрасываем табельный номер

                # elif not fio_exists and employee_number_exists:
                #     # Если ФИО не найдено, но найден табельный номер, берем ФИО из базы
                #     fio_from_record = correct_employee_number
                #     fio_exists = fio_from_record in existing_combinations_map.get(office_from_record, {}).get(post_from_record, set())

                entry = {
                    'office': office_from_record,
                    'post': post_from_record,
                    'fio': fio_from_record,
                    # 'employee_number': employee_number_from_record,
                    'exists': fio_exists
                }

                # if not fio_exists:
                # Если ФИО нет, предлагаем существующие ФИО для этой должности в этом офисе
                entry['existing_options'] = list(existing_combinations_map.get(office_from_record, {}).get(post_from_record, []))

                row_field_checked.append(entry)

        if field_name == 'date':
            self.template_name = 'user/profile/import/import-snj-mofidy_file_date.html'
            row_field = self.get_file_csv_to_df(self.obj.input_file_modify, [0, 1, 2, 4, 5, 6], unique=False)
            for _, row in row_field.iterrows():
                entry = {
                    'office': row[0],
                    'post': row[1],
                    'fio': row[2],
                    'date_start': row[5] if row[5] not in [None, 'nan'] and not isinstance(row[5], float) else '',
                    'length_time': row[4] if row[4] not in [None, 'nan'] else '',
                    'date_end': row[6] if row[6] not in [None, 'nan'] and not isinstance(row[6], float) else '',
                }
                row_field_checked.append(entry)
            
        if field_name == 'reason':
            self.template_name = 'user/profile/import/import-snj-mofidy_file-reason-shift.html'
            row_field = self.get_file_csv_to_df(self.obj.input_file_modify, [0, 1, 2, 7], unique=False)
            all_reason = set(Reason.objects.all().values_list('title', flat=True))
            context['all_option'] = all_reason
            for _, row in row_field.iterrows():
                entry = {
                    'office': row[0],
                    'post': row[1],
                    'fio': row[2],
                    'record': row[7] if row[7] not in [None, 'nan'] and not isinstance(row[7], float) else '',
                    'existing_options': list(all_reason),
                }
                row_field_checked.append(entry)
            
        if field_name == 'shift':
            self.template_name = 'user/profile/import/import-snj-mofidy_file-reason-shift.html'
            row_field = self.get_file_csv_to_df(self.obj.input_file_modify, [0, 1, 2, 8], unique=False)
            # Создаем маску, которая будет True для уникальных комбинаций значений в первых трех столбцах
            mask = row_field.duplicated(subset=row_field.columns[0:3], keep='first')

            # Отфильтровываем DataFrame, оставляя только строки, соответствующие False в маске
            row_field = row_field[~mask]

            all_reason = set(Shift.objects.all().values_list('title', flat=True))
            context['all_option'] = all_reason
            for _, row in row_field.iterrows():
                entry = {
                    'office': row[0],
                    'post': row[1],
                    'fio': row[2],
                    'record': row[8] if row[8] not in [None, 'nan'] and not isinstance(row[8], float) else '',
                    'existing_options': list(all_reason),
                }
                row_field_checked.append(entry)
            
        if field_name == 'comment':
            self.template_name = 'user/profile/import/import-snj-mofidy_file-comment.html'
            row_field = self.get_file_csv_to_df(self.obj.input_file_modify, [0, 1, 2, 9], unique=False)
            for _, row in row_field.iterrows():
                entry = {
                    'office': row[0],
                    'post': row[1],
                    'fio': row[2],
                    'record': row[9] if row[9] not in [None, 'nan'] and not isinstance(row[9], float) else '',
                }
                row_field_checked.append(entry)
        context['row_field_checked'] = row_field_checked
        return render(request, self.template_name, context)

    def get_file_csv_to_df(self, file_content, save_index=[], unique=True):
        buffer = io.StringIO(file_content)
        df = pd.read_csv(buffer)
        # Проверяем, является ли save_index списком. Если нет - превращаем его в список.

        if not isinstance(save_index, list):
            save_index = [save_index]        
        if unique:
            df = df.iloc[:, save_index].drop_duplicates().reset_index(drop=True)
        
        return df
 
    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')
        field = request.POST.get('field') 
        if action == 'update':
            if field == 'office':
                records = json.loads(request.POST.get('records', '[]'))  # Преобразуем строку JSON обратно в список
                original_records = json.loads(request.POST.get('original_records', '[]')) 
                self.office_field_modify(records, original_records) 
                # Перенаправить на страницу с подробностями
                pk = self.obj.import_parent.id
                return JsonResponse({'redirect_url': reverse_lazy('user:import-snj-detail', kwargs={'pk': pk})})
            if field == 'post':
                records = json.loads(request.POST.get('updates', '[]'))  # Преобразуем строку JSON обратно в список
                self.post_field_modify(records) 
                # Перенаправить на страницу с подробностями
                pk = self.obj.import_parent.id
                return JsonResponse({'redirect_url': reverse_lazy('user:import-snj-detail', kwargs={'pk': pk})})
            if field == 'fio':
                records = json.loads(request.POST.get('updates', '[]'))  # Преобразуем строку JSON обратно в список
                self.fio_field_modify(records) 
                # Перенаправить на страницу с подробностями
                pk = self.obj.import_parent.id
                return JsonResponse({'redirect_url': reverse_lazy('user:import-snj-detail', kwargs={'pk': pk})})
            if field == 'date':
                date_start_records = json.loads(request.POST.get('date_start', '[]'))  
                length_time_records = json.loads(request.POST.get('length_time', '[]')) 
                date_end_records = json.loads(request.POST.get('date_end', '[]'))  
                self.date_fields_modify(date_start_records, length_time_records, date_end_records) 

                # Перенаправить на страницу с подробностями
                pk = self.obj.import_parent.id
                return JsonResponse({'redirect_url': reverse_lazy('user:import-snj-detail', kwargs={'pk': pk})})
            if field == 'reason':
                records = json.loads(request.POST.get('records', '[]'))   
                self.universal_field_modify(records, 'Причина') 
                # Перенаправить на страницу с подробностями
                pk = self.obj.import_parent.id
                return JsonResponse({'redirect_url': reverse_lazy('user:import-snj-detail', kwargs={'pk': pk})})
            if field == 'shift':
                records = json.loads(request.POST.get('records', '[]'))   
                self.universal_field_modify(records, 'Смена') 
                # Перенаправить на страницу с подробностями
                pk = self.obj.import_parent.id
                return JsonResponse({'redirect_url': reverse_lazy('user:import-snj-detail', kwargs={'pk': pk})})
            if field == 'comment':
                records = json.loads(request.POST.get('records', '[]'))   
                self.universal_field_modify(records, 'Примечание') 
                # Перенаправить на страницу с подробностями
                pk = self.obj.import_parent.id
                return JsonResponse({'redirect_url': reverse_lazy('user:import-snj-detail', kwargs={'pk': pk})})

        return JsonResponse({'status': 'success'})

            
    def office_field_modify(self, records, original_records):
        input_file = self.obj.input_file_modify

        # Шаг 1: Прочитать файл с помощью pandas
        buffer = io.StringIO(input_file)
        df = pd.read_csv(buffer)

        # Проверяем, что списки одной и той же длины
        if len(original_records) != len(records):
            raise ValueError("The length of 'original_records' and 'records' should be the same")

        # Заменяем значения в первом столбце
        for orig, new in zip(original_records, records):
            mask = df.iloc[:, 0] == orig
            df.loc[mask, df.columns[0]] = new


        # Шаг 3: Записать обратно в файл с помощью pandas
        self.obj.input_file_modify = df.to_csv(index=False)


        # Шаг 4: Меняем статусы
        self.obj.office = True
        self.obj.post = False
        self.obj.fio = False


        # Шаг 5: Сохранить self.obj после изменений
        self.obj.save()

            
    def post_field_modify(self, updates):
        input_file = self.obj.input_file_modify

        # Шаг 1: Прочитать файл с помощью pandas
        buffer = io.StringIO(input_file)
        df = pd.read_csv(buffer)

        # Заменяем значения в первом столбце с учетом офиса и старого поста
        for update in updates:
            office_mask = df.iloc[:, 0] == update['office']  # Предполагается, что первый столбец - это офис
            post_mask = df.iloc[:, 1] == update['old_post']
            combined_mask = office_mask & post_mask
            
            df.loc[combined_mask, df.columns[1]] = update['new_post']

        # Шаг 3: Записать обратно в файл с помощью pandas
        self.obj.input_file_modify = df.to_csv(index=False)

        # Шаг 4: Меняем статусы
        self.obj.office = True
        self.obj.post = True
        self.obj.fio = False

        # Шаг 5: Сохранить self.obj после изменений
        self.obj.save()

    def fio_field_modify(self, updates):
        input_file = self.obj.input_file_modify

        # Шаг 1: Прочитать файл с помощью pandas
        buffer = io.StringIO(input_file)
        df = pd.read_csv(buffer)

       
        for index, row in df.iterrows():
            df.at[index, 'ФИО'] = updates[index]['new_fio']

        # Шаг 3: Записать обратно в файл с помощью pandas
        self.obj.input_file_modify = df.to_csv(index=False)

        # Шаг 4: Меняем статусы
        self.obj.office = True
        self.obj.post = True
        self.obj.fio = True

        # Шаг 5: Сохранить self.obj после изменений
        self.obj.save()
        # raise Exception("Test complete - transaction rolled back")

    def date_fields_modify(self, date_start_records, length_time_records, date_end_records):
        input_file = self.obj.input_file_modify

        # Шаг 1: Прочитать файл с помощью pandas
        buffer = io.StringIO(input_file)
        df = pd.read_csv(buffer)
        
        # разбираемся с датами    
        for index, row in df.iterrows():
            df.at[index, 'Начало пропуска']  = date_start_records[index]
            df.at[index, 'Количество календарных дней']  = length_time_records[index]
            df.at[index, 'Окончание пропуска']  = date_end_records[index]

        # # Шаг 3: Записать обратно в файл с помощью pandas
        self.obj.input_file_modify = df.to_csv(index=False)

        self.obj.date = True

        # # Шаг 5: Сохранить self.obj после изменений
        self.obj.save()
        # raise Exception("Test complete - transaction rolled back")


    def universal_field_modify(self, records, field_name):
        input_file = self.obj.input_file_modify

        # Шаг 1: Прочитать файл с помощью pandas
        buffer = io.StringIO(input_file)
        df = pd.read_csv(buffer)
        

        if field_name == 'Причина':
            for index, row in df.iterrows():
                df.at[index, field_name]  = records[index]

            self.obj.reason = True
        elif field_name == 'Примечание':
            for index, row in df.iterrows():
                df.at[index, field_name]  = records[index]

            self.obj.comment = True
        elif field_name == 'Смена':
            # Заменяем значения в первом столбце с учетом офиса и старого поста
            for record in records:
                office_mask = df.iloc[:, 0] == record['office'] 
                post_mask = df.iloc[:, 1] == record['post']
                fio_mask = df.iloc[:, 2] == record['fio']
                combined_mask = office_mask & post_mask & fio_mask
                df.loc[combined_mask, field_name] = record['shift']


            self.obj.shift = True
        
        # # Шаг 3: Записать обратно в файл с помощью pandas
        self.obj.input_file_modify = df.to_csv(index=False)

        # # Шаг 5: Сохранить self.obj после изменений
        self.obj.save()
        # raise Exception("Test complete - transaction rolled back")
        


# ---------------------------------График сменности----------------------
class ShiftOfficeView(MyModel, TemplateView):
    template_name = 'user/profile/shift-office/office-view.html'
    
    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        title = 'График сменности'
        c_def = self.get_user_context(title=title)
        context = dict(list(context.items()) + list(c_def.items()))
        
        if 'Администратор' in self.request.session['user']['user_groups']:
            offices = Office.objects.filter(сompany__id = self.request.session['user']['name_company_id']).select_related()
            context['offices'] = offices 

        else:
            offices = Office.objects.filter(humans__user__id = self.request.session['user']['request_user_id']).select_related()
            context['offices'] = office

        return context

class ShiftOfficeDetailView(MyModel, TemplateView):
    template_name = 'user/profile/shift-office/office-view-detail.html'

    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        self.office_id = self.kwargs.get('pk') 
        self.office = get_object_or_404(Office, pk=self.office_id)
        self.shifts = Shift.objects.all()
        self.shift_office_list = [
            ShiftOffice.objects.get_or_create(shift=shift, office=self.office)[0]
            for shift in self.shifts
        ]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context(title='Графики сменности')
        context = dict(list(context.items()) + list(c_def.items()))
        context['office'] = self.office
        context['shifts'] = self.shifts
        context['title'] = 'График сменности: ' + str(self.office)
        context['shift_office_list'] = self.shift_office_list
        context['selected_shift']  = int(self.request.session.get('selected_shift', 0))
        return context

    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')
        if action == 'update_shiftOffice':
            shift_id = request.POST.get('shiftID')
            start_date = request.POST.get('startDate')
            end_date = request.POST.get('endDate')
            # Получение и обновление соответствующего объекта ShiftOffice
            for shift_office in self.shift_office_list:
                if str(shift_office.shift.id) == shift_id and shift_office.office.id == self.office.id:
                    shift_office.cycle_start_date = start_date
                    shift_office.cycle_end_date = end_date
                    shift_office.save()
                    request.session['selected_shift'] = shift_id
                    return JsonResponse({'status': 'ok', 'message': 'Данные успешно обновлены'})
            
            return JsonResponse({'status': 'error', 'message': 'Объект ShiftOffice не найден'})

        return JsonResponse({'status': 'error', 'message': 'Неверное действие'})




        



        

