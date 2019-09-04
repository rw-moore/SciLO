from rest_framework.authtoken import views as TokenView
from .user_views import UserProfileViewSet
from .question_views import QuestionViewSet
from .quiz_views import QuizViewSet
from .response_views import ResponseViewSet
from .tag_views import TagViewSet
from .image_views import AvatarView
from .email_view import EmailCodeViewSet
from .attempt_view import (get_quiz_attempt_by_id,
                           create_quiz_attempt_by_quiz_id,
                           submit_quiz_attempt_by_quiz_id,
                           )
from .course_view import (create_course, delete_course)
from .group_view import add_user_to_group
