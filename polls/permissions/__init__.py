from .base_permission import IsInstructorOrAdmin, QuestionBank
from .course_permission import InCourse, IsInstructorInCourse
from .attempt_permission import OwnAttempt, InQuiz, InstructorInQuiz
from .question_permission import EditQuestion, ViewQuestion, CreateQuestion, DeleteQuestion
from .quiz_permission import EditQuiz, ViewQuiz, CreateQuiz, DeleteQuiz
