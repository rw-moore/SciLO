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
from django.conf.urls import url, include, re_path
from django.views.generic.base import TemplateView
from rest_framework.routers import DefaultRouter
from polls.views import *

router = DefaultRouter()
router.register(r'^response', ResponseViewSet)

urlpatterns = [
	# url(r'^', include(router.urls)),
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
    url(r'^api/userprofile/googlelogin$',
        UserProfileViewSet.as_view({
            'post': 'googlelogin'
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
    url(r'^api/userprofile/(?P<email>[a-zA-Z0-9._@+-]+)/check-email$',
        UserProfileViewSet.as_view({
            'get': 'check_email'
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
            'delete': 'destroy',
        })),
    url(r'^api/questions/loadVars$',
        QuestionViewSet.as_view({
            'post': 'subsituteWithVariables'
        })),
    url(r'^api/questions/solValues$',
        QuestionViewSet.as_view({
            'post': 'substituteQuestionSolution'
        })),
    url(r'^api/questions/(?P<pk>\d+)/images$',
        QuestionViewSet.as_view({
            'put': 'update_images',
        })),
    url(r'^api/questions/images/(?P<pk>\d+)$',
        QuestionImageView.as_view()
    ),
    # tag
    url(r'^api/tags$',
        TagViewSet.as_view({'get': 'list', 'post': 'create'})),
    url(r'^api/tags/(?P<pk>\d+)$',
        TagViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'})),
    url(r'^api/tags/(?P<pk>\d+)/questions$', TagViewSet.as_view({'get': 'get_questions_with_given_tag'})),
    url(r'^api/userprofile/(?P<pk>\d+)/avatar$', AvatarView.as_view()),
    # email verification
    url(r'^api/email/send$', EmailCodeViewSet.as_view({
        'get': 'send_email_code',
    })),
    url(r'^api/email/validate$', EmailCodeViewSet.as_view({
        'post': 'validate_email_code',
    })),
    url(r'^api/email/send/(?P<username>[a-zA-Z0-9._@+-]+)$', EmailCodeViewSet.as_view({
        'get': 'send_email_code_without_auth',
    })),
    # quiz attempt
    url(r'^api/quiz-attempt/(?P<pk>\d+)$', get_quiz_attempt_by_id),
    url(r'^api/quiz/(?P<quiz_id>\d+)/quiz-attempt$', create_quiz_attempt_by_quiz_id),
    url(r'^api/quiz/(?P<quiz_id>\d+)/quiz-attempts$', get_quizzes_attempt_by_quiz_id),
    url(r'^api/quiz-attempt/(?P<pk>\d+)/submit$', submit_quiz_attempt_by_id),
    url(r'^api/quiz/gradebook/(?P<quiz_id>\d+)$', get_quiz_attempts_and_grades),
    # course and group
    url(r'^api/courses$', get_courses),
    url(r'^api/course$', create_a_course),
    url(r'^api/course/(?P<pk>\d+)$', get_or_delete_course),
    url(r'^api/course/(?P<course_id>\d+)/questions', copy_or_delete_questions_to_course),
    url(r'^api/course/(?P<course_id>\d+)/group/(?P<group_id>\d+)/users$', add_delete_users_to_group),
    url(r'^api/course/enroll$', enroll_in_course_by_code),
    url(r'^api/course/(?P<course_id>\d+)/setDefaultEnroll', set_default_enroll_role),

    url(r'^api/course/(?P<course_id>\d+)/group/(?P<group_id>\d+)$', delete_group),
    url(r'^api/course/(?P<pk>\d+)/group$', create_group_to_course),
    url(r'^api/course/(?P<pk>\d+)/users$', add_or_delete_student_to_course),
    # quiz
    url(r'^api/quizzes$', get_all_quiz),
    url(r'^api/quiz$', create_a_quiz_by_course_id),
    url(r'^api/course/(?P<course_id>\d+)/quizzes$', get_quizzes_by_course_id),
    url(r'^api/quiz/(?P<quiz_id>\d+)$', get_or_delete_a_quiz),
    # script
    url(r'^api/script$', ScriptView.as_view()),
    url(r'^api/tree$', TreeView.as_view()),
    # lti
    url(r'^lti/$', LTIView.as_view()),
    re_path('.*', TemplateView.as_view(template_name='index.html'))
]
