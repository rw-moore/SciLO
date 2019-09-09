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
    url(r'^api/userprofile/login$',
        UserProfileViewSet.as_view({
            'post': 'login'
        })),
    url(r'^api/userprofile/username/(?P<username>[a-zA-Z0-9._@+-]+)$',
        UserProfileViewSet.as_view({
            'get': 'retrieve_by_username',
        })),
    url(r'^api/userprofile/(?P<username>[a-zA-Z0-9._@+-]+)/set-password$',
        UserProfileViewSet.as_view({
            'post': 'set_password'
        })),
    url(r'^api/userprofile/(?P<username>[a-zA-Z0-9._@+-]+)/check-username$',
        UserProfileViewSet.as_view({
            'get': 'check_username'
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
    url(r'^api/userprofile/(?P<pk>\d+)/avatar$', AvatarView.as_view()),
    # emial verification
    url(r'^api/email/send$', EmailCodeViewSet.as_view({
        'get': 'send_email_code',
    })),
    url(r'^api/email/validate$', EmailCodeViewSet.as_view({
        'post': 'validate_email_code',
    })),
    url(r'^api/email/send/(?P<username>[a-zA-Z0-9._@+-]+)$', EmailCodeViewSet.as_view({
        'get': 'send_email_code_without_auth',
    })),
    url(r'^api/quiz-attempt/(?P<pk>\d+)$', get_quiz_attempt_by_id),
    url(r'^api/quiz-attempt/quiz/(?P<pk>\d+)$', create_quiz_attempt_by_quiz_id),
    url(r'^api/quiz-attempt/(?P<pk>\d+)/submit$', submit_quiz_attempt_by_quiz_id),
    url(r'^api/course$', create_or_get_course),
    url(r'^api/course/(?P<pk>\d+)$', get_or_delete_course),
    url(r'^api/group/(?P<pk>\d+)/add-user$', add_user_to_group),
    url(r'^api/course/(?P<pk>\d+)/add-user$', set_student_to_course),
]
