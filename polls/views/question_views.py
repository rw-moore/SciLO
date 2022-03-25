import base64, copy, random
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from rest_framework import viewsets, serializers
from rest_framework.decorators import (
    action,
)
from rest_framework.response import Response as HttpResponse
from polls.models import Image, Question, QuestionImage, UserRole, variable_base_generate
from polls.serializers import *
from polls.permissions import IsInstructorOrAdmin, QuestionBank, ViewQuestion, EditQuestion, CreateQuestion, DeleteQuestion, SubVarForQuestion
from .attempt_view import substitute_question_text


def copy_a_question(question, course=None):
    serializer = QuestionSerializer(question)
    question_data = serializer.data
    if 'course' in question_data or course is not None:
        question_data.pop('owner')
    else:
        question_data['owner'] = question_data['owner']['id']
    question_data['course'] = course
    for resp in question_data['responses']:
        resp['question'] = None
    serializer = QuestionSerializer(data=question_data)
    if serializer.is_valid():
        question = serializer.save()
        return question
    else:
        return serializers.ValidationError(serializer.errors)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def create(self, request):
        '''
        POST /question/
        permission: admin or instructor
        '''
        course = request.data.get('course', None)
        if course is None: # if a question does not have a course the author is the owner
            request.data['owner'] = request.user.id
        elif 'owner' in request.data: # if a question has a course it can't have an owner
            request.data.pop('owner')
        if 'author' not in request.data: # if you don't supply an author you are the author
            request.data['author'] = str(request.user)
        # print(request.data)
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            question = serializer.save()
            data = QuestionSerializer(question).data
            return HttpResponse(status=200, data={'status': 'success', 'question': data})
        else:
            return HttpResponse(status=400, data=serializer.errors)

    def list(self, request):
        '''
        GET /question/
        permission: admin or instructor
        '''
        if request.user.is_staff:
            if request.query_params.get('courses[]', {}):
                data = Question.objects.filter(course__id=int(request.query_params.get('courses[]', {})[0]))
            else:
                data = Question.objects.all()
            length = len(data)
        else:
            data, length = Question.objects.with_query(**self.request.query_params)
            mod = Question.objects.all().exclude(course=None).union(Question.objects.filter(owner=request.user))
            # mod = Question.objects.filter(course__isnull=False, in_quiz=False) #.union(Question.objects.filter(owner=request.user, in_quiz=False))
            # print(data, 'data')
            # print(Question.objects.filter(course__isnull=False, in_quiz=False),'mod1')
            # print(Question.objects.filter(owner=request.user, in_quiz=False),'mod2')
            data = set(data).intersection(mod)
            if request.query_params.get('courses[]', {}):
                length = Question.objects.filter(course__id=int(request.query_params.get('courses[]', {})[0])).count()
            else:
                length = Question.objects.filter(owner=request.user).count()
        serializer = QuestionSerializer(data, many=True)
        return HttpResponse({'status': 'success', 'questions': serializer.data, "length": length})

    def destroy(self, request, pk=None):
        '''
        DELETE /question/{id}/
        permission: admin or instructor(owner)
        '''
        question = Question.objects.get(pk=pk)
        if request.user.is_staff:
            question.delete()
            return HttpResponse(status=200)
        elif question.owner == request.user:
            question.delete()
            return HttpResponse(status=200)
        elif UserRole.objects.filter(user=request.user, course=question.course, role__permissions__codename='delete_question').exists():
            question.delete()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=403)

    def retrieve(self, request, pk=None):
        '''
        GET /question/{id}/
        permission: admin or instructor
        '''
        response = super().retrieve(request, pk=pk)
        response.data = {'status': 'success', 'question': response.data}
        if request.query_params.get("substitute", False):
            try:
                question = copy.deepcopy(response.data["question"])
                seed = random.randint(1, 1001)
                tmp = question['variables']
                script = variable_base_generate(question['variables'])
                question['variables'] = {}
                question = substitute_question_text(question, script, seed)
                question['variables'] = tmp
                response.data = {**response.data, 'var_question': question, 'temp_seed': seed}
            except Exception as e:
                print('exception', e)
                response.data["error"] = "Could not substitute variables."
        return response

    def partial_update(self, request, pk=None):
        '''
        PATCH /question/{id}/
        permission: admin or instructor(owner)
        '''
        question = get_object_or_404(Question, pk=pk)
        if not request.user.is_staff and question.owner and question.owner.pk != request.user.pk:
            return HttpResponse(status=403)
        response = super().partial_update(request, pk=pk)
        response.data = {'status': 'success', 'question': response.data}
        return response

    def update(self, request, pk=None, **kwargs):
        '''
        PUT /question/{id}/
        permission: admin or instructor(owner)
        '''
        question = get_object_or_404(Question, pk=pk)
        if not request.user.is_staff and question.owner and question.owner.pk != request.user.pk:
            return HttpResponse(status=403)
        # print('put', request.data)
        response = super().update(request, pk=pk, **kwargs)
        response.data = {'status': 'success', 'question': response.data}
        return response

    @action(detail=True, methods=['get'])
    def user_question_list(self, request, pk=None):
        '''
        GET /userprofile/{pk}/question/
        permission: admin or instructor
        TODO fix permission, find where this is used
        '''
        if str(request.query_params.get("exclude_course", None)) == "1":
            questions = Question.objects.filter(owner=pk, course__id=None)
        else:
            questions = Question.objects.filter(owner=pk)
        serializer = QuestionSerializer(questions, many=True)
        return HttpResponse({'status': 'success', 'questions': serializer.data, "length": len(serializer.data)})

    def subsituteWithVariables(self, request):
        # print(request.data)
        question = request.data
        seed = random.randint(1, 1001)
        tmp = question['variables']
        script = variable_base_generate(question['variables'])
        question['variables'] = {}
        question = substitute_question_text(question, script, seed)
        question['variables'] = tmp
        return HttpResponse({"status":"success", "question":question, "temp_seed": seed})
    
    def substituteQuestionSolution(self, request):
        question = request.data.get('question', {})
        seed = request.data.get('seed', None)
        filling = request.data.get('filling', {})
        output = dict()
        if not seed:
            seed = random.randint(1, 1001)
        try:
            script = variable_base_generate(question['variables'])
            res = script.generate({}, filling.values(), seed=seed, opts={"latex":False})
            for k,v in filling.items():
                output[k] = res[v]
        except Exception as e:
            print('exception', e)
            return HttpResponse(status=500, data={"message": "Could not substitute values"})
        return HttpResponse(status=200, data={"filling": output})
        
    def update_images(self, request, pk):
        order = request.data.getlist('order[]', [])
        files = request.FILES.getlist('files[]', [])
        blobs = request.data.getlist('blobs[]', [])
        question = get_object_or_404(Question, pk=pk)
        question.question_image.all().exclude(id__in=[q_id for q_id in order if q_id.isnumeric()]).delete()
        for i, image_id in enumerate(order):
            if image_id.isnumeric():
                q_image = QuestionImage.objects.get(pk=image_id)
                q_image.index = i
                q_image.save()
            elif image_id[:4] == "file":
                q_id = int(image_id[4:])
                image = Image.objects.create(orig_file=files[q_id])
                QuestionImage.objects.create(image=image, index=i, question=question)
            elif image_id[:4] == "blob":
                q_id = int(image_id[4:])
                format_info, imgstr = blobs[q_id].split(';base64,')
                ext = format_info.split('/')[-1]
                data = ContentFile(base64.b64decode(imgstr), name="temp."+ext)
                image = Image.objects.create(orig_file=data)
                QuestionImage.objects.create(image=image, index=i, question=question)
            else:
                raise Exception("Entry in image order does not match known formats: "+image_id)

        serializer = QuestionSerializer(question)
        return HttpResponse({"status":"success", "question":serializer.data, "length":len(serializer.data)})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        permission_classes = [IsInstructorOrAdmin]
        if self.action == 'list':
            permission_classes = [QuestionBank]
        elif self.action == 'retrieve':
            permission_classes = [ViewQuestion]
        elif self.action in ['update', 'partial_update', 'update_images']:
            permission_classes = [EditQuestion]
        elif self.action == 'create':
            permission_classes = [CreateQuestion]
        elif self.action == 'destroy':
            permission_classes = [DeleteQuestion]
        elif self.action in ['subsituteWithVariables', 'substituteQuestionSolution']:
            permission_classes = [SubVarForQuestion]
        else:
            permission_classes = [IsInstructorOrAdmin]
        return [permission() for permission in permission_classes]
