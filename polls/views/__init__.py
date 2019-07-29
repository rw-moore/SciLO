from rest_framework.authtoken import views as TokenView
from .user_views import UserProfileViewSet
from .question_views import QuestionViewSet
from .quiz_views import QuizViewSet
from .response_views import ResponseViewSet
from .question_attempt_view import QuestionAttemptViewSet
from .response_attempt_view import ResponseAttemptViewSet
from .quiz_attempt_views import QuizAttemptViewSet
from .tag_views import TagViewSet
from .image_views import AvatarView
