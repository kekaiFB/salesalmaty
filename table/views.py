import re 
from django.shortcuts import get_object_or_404, HttpResponseRedirect, reverse
from .models import ScheduleNotJob
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import render  
from .forms import SNJ  
from .models import *
from django.db.models import Q
from django.http import JsonResponse
from django.template.loader import render_to_string 
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import permission_required
from django.shortcuts import get_object_or_404
from user.utils import *
from bootstrap_modal_forms.generic import (
   BSModalCreateView
  , BSModalUpdateView
)


@login_required
def load_ajax_form(request):
    data = dict()

    offices = None
    posts = None
    humans = None

    id_office = 0 if not request.GET.get('id_office') else int(request.GET.get('id_office'))
    id_post= 0 if not request.GET.get('id_post') else int(request.GET.get('id_post'))
    id_human = 0 if not request.GET.get('id_human') else int(request.GET.get('id_human'))
    click = request.GET.get('click')

    if click == 'id_office':
        if id_office > 0:
            if id_post > 0:
                if id_human > 0: 
                    pass
                else:
                    humans = Human.objects.filter(office=id_office, post=id_post).order_by('initials')
            else: 
                if id_human > 0:
                    posts = Post.objects.filter(office_id=id_office, humans__id=id_human).order_by('title')
                else:
                    posts = Post.objects.filter(office_id=id_office).order_by('title')
                    humans = Human.objects.filter(office=id_office).order_by('last_name')
        else: 
            if id_post > 0:
                if id_human > 0: 
                    offices = Office.objects.filter(posts__id=id_post, humans__id=id_human).order_by('title')
                else:
                    offices = Office.objects.filter(posts__id=id_post).order_by('title')
                    humans = Human.objects.filter(psot=id_post).order_by('last_name')
            else: 
                if id_human > 0:
                    offices = Office.objects.filter(humans__id=id_human).order_by('title')
                    posts = Post.objects.filter(humans__id=id_human).order_by('title')
                else:
                    if 'Администратор' in request.session['user']['user_groups']:
                        offices = Office.objects.filter(сompany__id = request.session['user']['name_company_id']).select_related()
                        posts = Post.objects.filter(office__сompany__id = request.session['user']['name_company_id']).select_related()
                        humans = Human.objects.filter(office__сompany__id = request.session['user']['name_company_id']).select_related()
                    else:
                        offices = Office.objects.filter(humans__user__id = request.session['user']['request_user_id']).select_related()
                        posts = Post.objects.filter(office__in = [off for off in offices]).select_related()
                        humans = Human.objects.filter(office__in = [off for off in offices]).select_related()

    elif click == 'id_post':
        if id_post > 0:
            if id_office > 0:
                if id_human > 0: 
                    pass
                else:
                    humans = Human.objects.filter(office=id_office, post=id_post).order_by('last_name')
            else: 
                if id_human > 0:
                    offices = Office.objects.filter(posts__id=id_post, humans__id=id_human).order_by('title')
                else:
                    offices = Office.objects.filter(posts__id=id_post).order_by('title')
                    humans = Human.objects.filter(post=id_post).order_by('last_name')
        else: 
            if id_office > 0:
                if id_human > 0: 
                    posts = Post.objects.filter(office_id=id_office, humans__id=id_human).order_by('title')
                else:
                    posts = Post.objects.filter(office_id=id_office).order_by('title')
                    humans = Human.objects.filter(office=id_office).order_by('last_name')
            else: 
                if id_human > 0:
                    offices = Office.objects.filter(humans__id=id_human).order_by('title')
                    posts = Post.objects.filter(humans__id=id_human).order_by('title')
                else:
                    if 'Администратор' in request.session['user']['user_groups']:
                        offices = Office.objects.filter(сompany__id = request.session['user']['name_company_id']).select_related()
                        posts = Post.objects.filter(office__сompany__id = request.session['user']['name_company_id']).select_related()
                        humans = Human.objects.filter(office__сompany__id = request.session['user']['name_company_id']).select_related()
                    else:
                        offices = Office.objects.filter(humans__user__id = request.session['user']['request_user_id']).select_related()
                        posts = Post.objects.filter(office__in = [off for off in offices]).select_related()
                        humans = Human.objects.filter(office__in = [off for off in offices]).select_related()

    elif click == 'id_human':
        if id_human > 0:
            if id_office > 0:
                if id_post > 0: 
                    pass
                else:
                    posts = Post.objects.filter(office_id=id_office, humans__id=id_human).order_by('title')
            else: 
                if id_post > 0:
                    offices = Office.objects.filter(posts__id=id_post, humans__id=id_human).order_by('title')
                else:
                    offices = Office.objects.filter(humans__id=id_human).order_by('title')
                    posts = Post.objects.filter(humans__id=id_human).order_by('title')
        else: 
            if id_office > 0:
                if id_post > 0: 
                    humans = Human.objects.filter(office=id_office, post=id_post).order_by('last_name')
                else:
                    posts = Post.objects.filter(office_id=id_office).order_by('title')
                    humans = Human.objects.filter(office=id_office).order_by('last_name')
            else: 
                if id_post > 0:
                    offices = Office.objects.filter(posts__id=id_post).order_by('title')
                    humans = Human.objects.filter(post=id_post).order_by('last_name')
                else:
                    if 'Администратор' in request.session['user']['user_groups']:
                        offices = Office.objects.filter(сompany__id = request.session['user']['name_company_id']).select_related()
                        posts = Post.objects.filter(office__сompany__id = request.session['user']['name_company_id']).select_related()
                        humans = Human.objects.filter(office__сompany__id = request.session['user']['name_company_id']).select_related()
                    else:
                        offices = Office.objects.filter(humans__user__id = request.session['user']['request_user_id']).select_related()
                        posts = Post.objects.filter(office__in = [off for off in offices]).select_related()
                        humans = Human.objects.filter(office__in = [off for off in offices]).select_related()

    # if offices:     
    #     data['html_office'] = render_to_string('table/ajax/office.html', { 'offices': offices})
    # if humans:     
    #     data['html_human'] = render_to_string('table/ajax/human.html', { 'humans': humans})
    # if posts:     
    #     data['html_post'] = render_to_string('table/ajax/post.html', { 'posts': posts})
    if offices:     
        data['id_office'] = [obj.id for obj in offices]
    if humans:     
        data['id_human'] =[obj.id for obj in humans]
    if posts:     
        data['id_post'] =[obj.id for obj in posts]
    return JsonResponse(data)


def get_snf(request):
    # Администратором может быть любой пользователь конечно
    # но когда мы создаем компанию, первый админ привязывается компании
    # а все последующие пользователи к какоому нибудь офису
    # поэтому искать их нужно по разному, возможно в будущем найдется вариант по лучше
    if 'Администратор' in request.session['user']['user_groups']:
        snj = ScheduleNotJob.objects.filter(office__сompany__id = request.session['user']['name_company_id']).select_related('human__shift', 'office', 'post', 'human', 'human__user', 'reason')
    else:
        snj = ScheduleNotJob.objects.filter(office__humans__user__id = request.session['user']['request_user_id']).select_related('human__shift', 'office', 'post', 'human', 'human__user', 'reason')
    return snj 


 
@login_required
def index(request):  

    snj = get_snf(request)
    context = {}
    if "user" in request.session:
        pass
    else:
        add_user_context(request)  
    context['name_company_id'] = request.session['user']['name_company_id']
    context['user_groups'] = request.session['user']['user_groups']
    context['offices_company'] = request.session['user']['offices_company']
    # context['applications'] = request.session['user']['applications']
    context['snj'] = snj
    # если многие snj не отображаются, нужно проверить фильтр по датам, видимо у snj другие даты
    context['title'] = 'Продажи'

    return render(request, "table/index.html", context=context)  


class SNJCreateView(PermissionRequiredMixin, MyModel, BSModalCreateView):
    permission_required = "table.add_schedulenotjob"
    template_name = 'table/edit_data/create_snj.html'
    form_class = SNJ

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context()
        context = dict(list(context.items()) + list(c_def.items()))
        return context
    
    def form_valid(self, form):
        self.instance = form.save(commit=False)
        self.instance.author = self.request.user
        self.instance.editor = self.request.user
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('table:index')
    

class SNJUpdateView(PermissionRequiredMixin, MyModel, BSModalUpdateView):
    permission_required = "table.change_schedulenotjob"
    template_name = 'table/edit_data/update_snj.html'
    form_class = SNJ
    model = ScheduleNotJob

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super().get_context_data(**kwargs)
        c_def = self.get_user_context()
        context = dict(list(context.items()) + list(c_def.items()))
        return context

    def form_valid(self, form):
        self.instance = form.save(commit=False)
        self.instance.editor = self.request.user
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('table:index')


@login_required
@permission_required('table.delete_schedulenotjob')
def destroy(request, id):  
    snj = get_object_or_404(ScheduleNotJob, id=id)
    snj.delete()
    return HttpResponseRedirect(reverse('table:index'))  
