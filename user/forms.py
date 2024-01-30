from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User, Group
from django.contrib.auth.forms import SetPasswordForm

from bootstrap_modal_forms.forms import BSModalModelForm
from table.models import Office, Post, Human, Import
from django import forms


class UnstyledForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('label_suffix', '')
        super(UnstyledForm, self).__init__(*args, **kwargs)
    

class OfficeModelForm(BSModalModelForm, UnstyledForm):
    def __init__(self, *args, **kwargs):
        super(OfficeModelForm, self).__init__(*args, **kwargs)
        self.fields['сompany'].label = ''

    class Meta:
        model = Office
        fields = '__all__'


class PostModelForm(BSModalModelForm, UnstyledForm):
    def __init__(self, *args, **kwargs):
        super(PostModelForm, self).__init__(*args, **kwargs)
        self.fields['office'].widget.attrs['readonly'] = True

    class Meta:
        model = Post
        fields = '__all__'


import datetime
def today_ymd():
    return datetime.date.today().strftime('%Y-%m-%d')


class HumanModelForm(BSModalModelForm, UnstyledForm):
    email = forms.EmailField(max_length = 200, label='Email')
    group = forms.ModelChoiceField(queryset=Group.objects.filter(name__in=['Начальник', 'Сотрудник']).order_by('name'), label='Роль')

    date_start=forms.DateField(
        initial=today_ymd(),
        widget=forms.DateInput(
                    format=('%Y-%m-%d'),
                    attrs={'type': 'date'}),
        required=False,
        label = "Начало работы"
    )  
    

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].widget.attrs.update({
            "placeholder": 'email'
        })
        
        office = [(Office.id, Office.__str__()) for Office in Office.objects.filter(сompany__leader = self.request.user)]
        self.fields['office'].choices = office

        post = [(Post.id, Post.__str__()) for Post in Post.objects.filter(office__in = [off for off in office])]
        self.fields['post'].choices = post

        # Установка начального значения, используя существующий queryset
        try:
            # Это не вызовет дополнительный запрос, если queryset уже был оценен
            initial_group = self.fields['group'].queryset.get(name='Сотрудник')
            self.fields['group'].initial = initial_group
        except Group.DoesNotExist:
            # Обрабатываем ситуацию, если такой группы не существует.
            pass

    class Meta:
        model = Human
        fields = ['office', 'post', 'shift', 'group', 'email', 'first_name', 'last_name', 'sur_name', 'status', 'date_start', 'employee_number']
        exclude = ['user'] 


class HumanUpdateModelForm(BSModalModelForm, UnstyledForm):
    date_start=forms.DateField(
        initial=today_ymd(),
        widget=forms.DateInput(
                    format=('%Y-%m-%d'),
                    attrs={'type': 'date'}),
        required=False,
        label = "Начало работы"
    )  

    class Meta:
        model = Human
        fields = [ 'first_name', 'last_name', 'sur_name', 'status', 'shift', 'date_start', 'employee_number']


class UserPostUpdateForm(BSModalModelForm, UnstyledForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        post = [(Post.id, Post.__str__()) for Post in Post.objects.filter(office = kwargs['initial']['office_id'])]
        self.fields['post'].choices = post
        self.fields['post'].widget.attrs.update({
            'blank': True
        })
  
    class Meta:
        model = Human
        fields = ['post']


class UserRoleUpdateForm(BSModalModelForm, UnstyledForm):
    def __init__(self, *args, **kwargs):
        super(UserRoleUpdateForm, self).__init__(*args, **kwargs)
        self.fields['groups'].label = ''
        
        if 'Администратор' not in self.request.session['user']['user_groups']:
            self.fields['groups'].queryset = Group.objects.exclude(name__in=['Администратор', 'Начальник']).order_by('-name')

    class Meta:
        model = User
        fields = ['groups']
        ordering = ['-name']
     

from .fields import GroupedModelChoiceField

class UserOfficeCreateForm(BSModalModelForm, UnstyledForm):
    posts = GroupedModelChoiceField(
        queryset=Post.objects.select_related(), 
        choices_groupby='office',
        label = 'Должности'
    )

    def __init__(self, *args, **kwargs):
        super(UserOfficeCreateForm, self).__init__(*args, **kwargs)
        self.fields['post'].label = ''
        self.fields['posts'].label = ''
        self.fields['office'].label = ''
        
        if 'Начальник'  in self.request.session['user']['user_groups']:
            post = Post.objects.filter(office__humans__user__id = self.request.session['user']['request_user_id']).order_by('title')
        elif 'Администратор'  in self.request.session['user']['user_groups']:
            post = Post.objects.filter(office__сompany = self.request.session['user']['name_company_id']).order_by('title')

        self.fields['posts'].queryset  = post
  
    class Meta:
        model = Human
        fields = ['posts', 'post', 'office']

        
class RegisterUserForm(UserCreationForm):
    class Meta:
        model = User
        fields = [
            'email', 
            'password1', 
            'password2', 
            ]
        
    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        
        if User.objects.filter(email=email).exists():
            msg = 'Пользователь с таким email уже существует'
            self.add_error('email', msg)           
    
        return self.cleaned_data


class LoginForm(AuthenticationForm):
    username = forms.EmailField(label='Адрес электронной почты')

    class Meta:
        fields = [ 'password']


class SetPasswordForm(SetPasswordForm):
    class Meta:
        model = User
        fields = ['new_password1', 'new_password2']


class HumanNoActiveForm(BSModalModelForm, UnstyledForm):
    class Meta:
        model = Human
        fields = ('comment', 'is_active')
        widgets = {'is_active': forms.HiddenInput()}

    def __init__(self, *args, **kwargs):
        super(HumanNoActiveForm, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'


class ImportHumanViewModelForm(BSModalModelForm, UnstyledForm):
    class Meta:
        model = Import
        fields = ('title', 'author', 'import_name')
        widgets = {
            'author': forms.HiddenInput(),
            'import_name': forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        super(ImportHumanViewModelForm, self).__init__(*args, **kwargs)
        self.fields['author'].queryset = User.objects.filter(id = self.request.user.id)
        self.fields['author'].initial =  self.fields['author'].queryset[0] 
        
        self.fields['import_name'].initial =  'humans'
        self.fields['title'].initial =  'импорт_сотрудников_' + str(Import.objects.filter(import_name = 'humans').count())


        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'


class ImportSNJViewModelForm(BSModalModelForm, UnstyledForm):
    class Meta:
        model = Import
        fields = ('title', 'author', 'import_name')
        widgets = {
            'author': forms.HiddenInput(),
            'import_name': forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        super(ImportSNJViewModelForm, self).__init__(*args, **kwargs)
        self.fields['author'].queryset = User.objects.filter(id = self.request.user.id)
        self.fields['author'].initial =  self.fields['author'].queryset[0] 
        
        self.fields['import_name'].initial =  'snj'
        self.fields['title'].initial =  'импорт_абсентеизма_' + str(Import.objects.filter(import_name = 'snj').count())


        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
