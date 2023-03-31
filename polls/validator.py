from oauthlib.oauth1 import RequestValidator
from polls.models import LTISecret, QuizLTI, NonceTimeStamp

class LTIRequestValidator(RequestValidator):

    @property
    def client_key_length(self):
        return 20, 64

    @property
    def nonce_length(self):
        return 20, 32

    def validate_client_key(self, client_key, request) -> None:
        # need
        print('validate client')
        return LTISecret.objects.filter(consumer_key=client_key).exists()

    def validate_request_token(self, client_key, token, request) -> None:
        print('validate request token')
        return super().validate_request_token(client_key, token, request)

    def validate_access_token(self, client_key, token, request) -> None:
        print('validate access token')
        return super().validate_access_token(client_key, token, request)

    def validate_timestamp_and_nonce(self, client_key, timestamp, nonce, request, request_token=None, access_token=None) -> None:
        # need
        print('validate timestamp')
        print(timestamp, type(timestamp))
        if NonceTimeStamp.objects.filter(nonce=nonce, timestamp=timestamp).exists():
            return False
        else:
            NonceTimeStamp.objects.create(nonce=nonce, timestamp=timestamp)
            return True

    def validate_redirect_uri(self, client_key, redirect_uri, request) -> None:
        print('validate redirect')
        return super().validate_redirect_uri(client_key, redirect_uri, request)

    def validate_requested_realms(self, client_key, realms, request) -> None:
        print('validate request realms')
        return super().validate_requested_realms(client_key, realms, request)

    def validate_verifier(self, client_key, token, verifier, request) -> None:
        print('validate verifier')
        return super().validate_verifier(client_key, token, verifier, request)
    
    def invalidate_request_token(self, client_key, request_token, request) -> None:
        print('invalidate request token')
        return super().invalidate_request_token(client_key, request_token, request)

    def get_client_secret(self, client_key, request) -> None:
        # need
        print('get client secret')
        secret = LTISecret.objects.filter(consumer_key=client_key).first()
        return secret.shared_secret

    def get_access_token_secret(self, client_key, token, request) -> None:
        print('get access toekn secret')
        return super().get_access_token_secret(client_key, token, request)

    def get_rsa_key(self, client_key, request) -> None:
        print('get rsa key')
        return super().get_rsa_key(client_key, request)
    
    def get_realms(self, token, request) -> None:
        print('get realms')
        return super().get_realms(token, request)

    def get_default_realms(self, client_key, request) -> None:
        print('get default realms')
        return super().get_default_realms(client_key, request)

    def get_redirect_uri(self, token, request) -> None:
        print('get redirect uri')
        return super().get_redirect_uri(token, request)

    def save_request_token(self, token, request) -> None:
        print('save request token')
        return super().save_request_token(token, request)
    
    def save_verifier(self, token, verifier, request) -> None:
        print('save verifier')
        return super().save_verifier(token, verifier, request)

    def save_access_token(self, token, request) -> None:
        print('save access token')
        return super().save_access_token(token, request)

    def verify_realms(self, token, realms, request) -> None:
        print('verify realms')
        return super().verify_realms(token, realms, request)

    def verify_request_token(self, token, request) -> None:
        print('verify request token')
        return super().verify_request_token(token, request)

    def dummy_client(self) -> None:
        print('dummy client')
        return super().dummy_client

    def dummy_request_token(self) -> None:
        print('dummy request token')
        return super().dummy_request_token

    def dummy_access_token(self) -> None:
        print('dummy access token')
        return super().dummy_access_token
