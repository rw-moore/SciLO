from django.core.mail import send_mail
from rest_framework import viewsets
from rest_framework import response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from polls.models import EmailCode
from polls.serializers import EmailCodeSerializer


class EmailCodeViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for listing or retrieving users.
    """
    queryset = EmailCode.objects.all()
    serializer_class = EmailCodeSerializer

    def sendToken(self, request):
        user = request.user
        qs = EmailCode.objects.filter(author=user)
        if qs.exists() and len(qs) == 1:
            qs[0].token = EmailCode.random_with_N_digits()
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

    # def activeToken(self,)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'sendToken':
            permissions = [IsAuthenticated]
        else:
            permissions = [IsAdminUser]
        return [permission() for permission in permissions]
