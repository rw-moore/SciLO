"""SciLO URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter
from polls.views import *

router = DefaultRouter()
router.register(r'^response', ResponseViewSet)
router.register(r'^response-attempt', ResponseAttemptViewSet)
router.register(r'^quiz-attempt', QuizAttemptViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    path('admin/', admin.site.urls),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    # user profile
    url(r'^api/userprofile$',
        UserProfileViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })),
    url(r'^api/userprofile/(?P<pk>\d+)$',
        UserProfileViewSet.as_view({
            'get': 'retrieve',
            'patch': 'partial_update',
            'delete': 'destroy'
        })),
    url(r'^api/userprofile/(?P<pk>\d+)/question$',
        QuestionViewSet.as_view({
            'get': 'user_question_list'
        })),
    url(r'^api/userprofile/(?P<username>\w+)/set-password$',
        UserProfileViewSet.as_view({
            'post': 'set_password'
        })),
    url(r'^api/userprofile/(?P<username>\w+)/check-username$',
        UserProfileViewSet.as_view({
            'get': 'check_username'
        })),
    url(r'^api/userprofile/login$',
        UserProfileViewSet.as_view({
            'post': 'login'
        })),
    # question
    url(r'^api/questions$',
        QuestionViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })),
    url(r'^api/questions/(?P<pk>\d+)$',
        QuestionViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })),
    # quiz
    url(r'^api/quiz$',
        QuizViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })),
    url(r'^api/quiz/(?P<pk>\d+)$',
        QuizViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })),
    # tag
    url(r'^api/tags$',
        TagViewSet.as_view({'get': 'list', 'post': 'create'})),
    url(r'^api/tags/(?P<pk>\d+)$',
        TagViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'})),
    url(r'^api/tags/(?P<pk>\d+)/questions$', TagViewSet.as_view({'get': 'get_questions_with_given_tag'})),
    url(r'^api/quiz/(?P<pk>\d+)/questions$',
        QuestionViewSet.as_view({'get': 'quiz_question_list'})),
    url(r'^api/userprofile/(?P<pk>\d+)/quiz$',
        QuizViewSet.as_view({'get': 'user_quiz_list'})),
    url(r'^api/userprofile/(?P<pk>\d+)/avatar$', AvatarView.as_view())
]
