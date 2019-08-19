from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework import response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from ratelimit.decorators import ratelimit
from polls.models import EmailCode, User, Token
from polls.serializers import EmailCodeSerializer


class EmailCodeViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = EmailCode.objects.all()
    serializer_class = EmailCodeSerializer

    @ratelimit(key='ip', rate='1/m', block=True)
    def send_email_code_without_auth(self, request, username):
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            if user.profile.email_active:
                qs = EmailCode.objects.filter(author=user)
                if qs.exists() and len(qs) == 1:
                    qs[0].token = EmailCode.random_with_N_digits()
                    qs[0].available = 3
                    qs[0].save()
                    token = qs[0].token
                else:
                    ec = EmailCode.objects.create(author=user, token=EmailCode.random_with_N_digits())
                    token = ec.token
                if user.email:
                    send_mail(
                        'Hello',
                        'Here is the message.\n' + 'token: ' + str(token),
                        'moonbackreborn@gmail.com',
                        [user.email],
                        fail_silently=False,
                    )
                    return response.Response(status=200)
                else:
                    return response.Response(status=400, data={"message": "user does not have email"})

        return response.Response(status=400, data={"message": "user does not have email"})

    @ratelimit(key='ip', rate='1/m', block=True)
    def send_email_code(self, request):
        user = request.user
        qs = EmailCode.objects.filter(author=user)
        if qs.exists() and len(qs) == 1:
            qs[0].token = EmailCode.random_with_N_digits()
            qs[0].available = 3
            qs[0].save()
            token = qs[0].token
        else:
            ec = EmailCode.objects.create(author=user, token=EmailCode.random_with_N_digits())
            token = ec.token
        if user.email:
            send_mail(
                'Hello',
                'Here is the message.\n' + 'token: ' + str(token),
                'moonbackreborn@gmail.com',
                [user.email],
                fail_silently=False,
            )
            return response.Response(status=200)
        else:
            return response.Response(status=400, data={"message": "user does not have email"})

    def validate_email_code(self, request):
        username = request.data.get('username', None)
        uid = request.data.get('id', None)
        if uid:
            user = get_object_or_404(User, id=uid)
        elif username:
            user = get_object_or_404(User, username=username)
        else:
            return response.Response(status=400, data={"message": "username/id is not provided"})
        if user.email_code:
            if int(user.email_code.available) <= 0:
                return response.Response(status=400, data={"message": "Code is expired"})
            code = request.data.get('code', None)
            if str(code) == str(user.email_code.token):
                user.email_code.available = 0
                user.profile.email_active = True
                user.save()
                if not Token.objects.filter(user=user).exists():
                    Token.objects.create(user=user)
                return response.Response(status=200, data={'token': Token.objects.get(user=user).key})
            else:
                user.email_code.available -= 1
                user.email_code.save()
                return response.Response(status=400, data={"message": "Code is not correct"})

        else:
            return response.Response(status=400, data={"message": "Code is not provided"})

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'send_email_code':
            permissions = [IsAuthenticated]
        elif self.action == 'validate_email_code':
            permissions = [AllowAny]
        elif self.action == 'send_email_code_without_auth':
            permissions = [AllowAny]
        else:
            permissions = [IsAdminUser]
        return [permission() for permission in permissions]
