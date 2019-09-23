from rest_framework.authtoken import views as TokenView
from .user_views import UserProfileViewSet
from .question_views import QuestionViewSet
from .quiz_views import (
    create_a_quiz_by_couse_id,
    update_quiz_by_id,
    copy_or_delete_questions_to_course,
    copy_questions_from_course,
    get_all_quiz
)
from .response_views import ResponseViewSet
from .tag_views import TagViewSet
from .image_views import AvatarView
from .email_view import EmailCodeViewSet
from .attempt_view import (
    get_quiz_attempt_by_id,
    create_quiz_attempt_by_quiz_id,
    submit_quiz_attempt_by_quiz_id,
)
from .course_view import (
    create_or_get_course,
    get_or_delete_course,
    set_student_to_course,
    find_user_courses,
)
from .group_view import set_user_to_group, delete_group
