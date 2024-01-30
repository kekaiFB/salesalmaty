from django.db.models import Q
from django import forms  
from .models import *
from django import forms
from bootstrap_modal_forms.forms import BSModalModelForm


class SNJ(BSModalModelForm):
    # shift = forms.ModelChoiceField(
    #     queryset=Shift.objects.select_related(),
    #     label="Смена"
    # ) 

    reason = forms.ModelChoiceField(
        queryset=Reason.objects.select_related(),
        label="Продукт"
    )

    comment = forms.CharField(required=False,  label="Примечание") 
    length_time = forms.IntegerField(required=False,  label="Продолжительность") 
    
    date_widget = forms.DateInput(
        format=('%Y-%m-%d'),
        attrs={'type': 'date'}
    )

    date_start = forms.DateField(
        widget=date_widget,
        required=False,
        label="Начало"
    )

    date_end = forms.DateField(
        widget=date_widget,
        required=False,
        label="Окончание"
    )
    
    def __init__(self, *args, **kwargs):
        super(SNJ, self).__init__(*args, **kwargs)

        # if 'Администратор' in self.request.session['user']['user_groups']:
        #     self.fields['office'].queryset = Office.objects.filter(сompany__id = self.request.session['user']['name_company_id']).select_related()
        #     self.fields['post'].queryset = Post.objects.filter(office__сompany__id = self.request.session['user']['name_company_id']).select_related()
        #     self.fields['human'].queryset = Human.objects.filter(office__сompany__id = self.request.session['user']['name_company_id']).select_related()
        # else:
        #     self.fields['office'].queryset = Office.objects.filter(humans__user__id = self.request.session['user']['request_user_id']).select_related()
        #     self.fields['post'].queryset = Post.objects.filter(office__in = [off for off in self.fields['office'].queryset]).select_related()
        #     self.fields['human'].queryset = Human.objects.filter(office__in = [off for off in self.fields['office'].queryset]).select_related()
        if 'Администратор' in self.request.session['user']['user_groups']:
            office_filter = Q(сompany__id=self.request.session['user']['name_company_id'])
        else:
            office_filter = Q(humans__user__id=self.request.session['user']['request_user_id'])

        self.fields['office'].queryset = Office.objects.filter(office_filter).select_related()
        self.fields['post'].queryset = Post.objects.filter(office__in=self.fields['office'].queryset).select_related()
        self.fields['human'].queryset = Human.objects.filter(office__in=self.fields['office'].queryset).distinct()

        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'
            
    class Meta:
        model = ScheduleNotJob  
        fields = ['office', 'post', 'human', 'reason', 'comment', 'date_start', 'length_time', 'date_end'] 
        ordering = ('title', 'initials')
 