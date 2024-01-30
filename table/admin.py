from django.contrib import admin
from .models import Company, Office, Post, WorkStatus, Human, Reason, Shift, ScheduleNotJob

class BaseModelAdmin(admin.ModelAdmin):  
    @staticmethod
    def get_field_names(model):
        return [field.name for field in model._meta.fields]

    def get_list_display(self, request):
        if hasattr(self, 'list_display') and self.list_display:
            # Если list_display уже определен в подклассе, используем его
            return self.list_display
        else:
            # Иначе, генерируем список полей автоматически
            field_names = self.get_field_names(self.model)
            field_names = [name for name in field_names if name not in ['сompany', 'office']]
            return field_names


@admin.register(Office)
class OfficeAdmin(BaseModelAdmin):
    list_display = BaseModelAdmin.get_field_names(Office) + ['get_company']

    def get_company(self, obj):
        if obj.сompany is not None:
            return obj.сompany.title
        return ''
    get_company.short_description = 'Компания'
    list_filter = BaseModelAdmin.get_field_names(Office)
    ordering = ['id']

@admin.register(Post)
class PostAdmin(BaseModelAdmin):
    list_display = BaseModelAdmin.get_field_names(Post) + ['get_office', 'get_company']

    def get_office(self, obj):
        return obj.office.title
    get_office.short_description = 'Подразделение'

    def get_company(self, obj):
        if obj.office is not None and obj.office.сompany is not None:
            return obj.office.сompany.title
        return ''
    get_company.short_description = 'Компания'
    list_filter = BaseModelAdmin.get_field_names(Post)
    ordering = ['id']

@admin.register(WorkStatus)
class WorkStatusAdmin(BaseModelAdmin):
    list_display = BaseModelAdmin.get_field_names(WorkStatus)
    list_filter = BaseModelAdmin.get_field_names(WorkStatus)
    ordering = ['id']

@admin.register(Human)
class HumanAdmin(BaseModelAdmin):
    list_display = ['get_company', 'get_office', 'get_post', 'get_name', 'get_email', 'comment_update', 'time_update', 'get_shift']

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related('office', 'office__сompany', 'post', 'user')

    def get_name(self, obj):
        return str(obj.first_name) + ' ' + str(obj.last_name) + ' ' + str(obj.sur_name)
    get_name.admin_order_field = 'last_name'  # Сортировка будет по фамилии
    get_name.short_description = 'ФИО'

    def get_shift(self, obj):
        return str(obj.shift) 
    get_shift.admin_order_field = 'shift'  # Сортировка будет по фамилии
    get_shift.short_description = 'Смена'
 
 
    def get_email(self, obj):
        return str(obj.user)
    get_email.admin_order_field = 'user__email'  # Сортировка будет по email
    get_email.short_description = 'Emai'
 
    def get_office(self, obj):
        # This will return a list of all offices related to the Human
        return ", ".join([office.title for office in obj.office.all()])
    get_office.admin_order_field = 'office__title'  
    get_office.short_description = 'Подразделение'
 
    def get_post(self, obj):
        # This will return a list of all offices related to the Human
        return ", ".join([post.title for post in obj.post.all()])
    get_post.admin_order_field = 'post__title'  
    get_post.short_description = 'Должность'
 
    def get_company(self, obj):
        # This will return a list of all unique companies related to the offices of the Human
        companies = {office.сompany.title for office in obj.office.all() if office.сompany}
        return ", ".join(companies)
    get_company.short_description = 'Компания'



@admin.register(Reason)
class ReasonAdmin(BaseModelAdmin):
    list_display = BaseModelAdmin.get_field_names(Reason)
    list_filter = BaseModelAdmin.get_field_names(Reason)
    ordering = ['id']

@admin.register(Shift)
class ShiftAdmin(BaseModelAdmin):
    list_display = BaseModelAdmin.get_field_names(Shift)
    list_filter = BaseModelAdmin.get_field_names(Shift)
    ordering = ['id']

@admin.register(ScheduleNotJob)
class ScheduleNotJobAdmin(BaseModelAdmin):
    list_display = BaseModelAdmin.get_field_names(ScheduleNotJob)
    list_filter = BaseModelAdmin.get_field_names(ScheduleNotJob)
    ordering = ['id']


@admin.register(Company)
class CompanyAdmin(BaseModelAdmin):
    list_display = BaseModelAdmin.get_field_names(Company)
    list_filter = BaseModelAdmin.get_field_names(Company)
    ordering = ['id']