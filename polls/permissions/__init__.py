from .base_permission import IsInstructorOrAdmin, QuestionBank
from .course_permission import InCourse, IsInstructorInCourse, CanSetEnrollmentRole
from .attempt_permission import OwnAttempt, InQuiz, InstructorInQuiz
from .question_permission import EditQuestion, ViewQuestion, CreateQuestion, DeleteQuestion, SubVarForQuestion
from .quiz_permission import EditQuiz, ViewQuiz, CreateQuiz, DeleteQuiz
