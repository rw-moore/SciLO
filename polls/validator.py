from oauthlib.oauth1 import RequestValidator

class LTIRequestValidator(RequestValidator):

    def validate_client_key(self, client_key, request) -> None:
        return super().validate_client_key(client_key, request)