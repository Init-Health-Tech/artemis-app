from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth_serializers import AuthUserSerializer, PasswordChangeSerializer


class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AuthUserSerializer

    def get_object(self):
        return self.request.user


class CurrentUserPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            AuthUserSerializer(request.user, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )
