from rest_framework.authtoken import views as TokenView
from .user_views import UserProfileViewSet
from .question_views import QuestionViewSet, copy_a_question
from .quiz_views import (
    create_a_quiz_by_course_id,
    get_all_quiz,
    get_or_delete_a_quiz,
    get_quizzes_by_course_id,
    get_quiz_attempts_and_grades
)
from .response_views import ResponseViewSet
from .tag_views import TagViewSet
from .image_views import AvatarView
from .email_view import EmailCodeViewSet
from .attempt_view import (
    get_quiz_attempt_by_id,
    create_quiz_attempt_by_quiz_id,
    get_quizzes_attempt_by_quiz_id,
    submit_quiz_attempt_by_id,
)
from .course_view import (
    get_courses,
    create_a_course,
    get_or_delete_course,
    copy_or_delete_questions_to_course,
    add_or_delete_student_to_course,
    find_user_courses,
    enroll_in_course_by_code,
    set_default_enroll_role,
)

from .script_view import (ScriptView)

from .decision_tree_view import (TreeView)

from .group_view import add_delete_users_to_group, delete_group, create_group_to_course
