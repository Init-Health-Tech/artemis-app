from rest_framework.throttling import SimpleRateThrottle


class _IPScopedThrottle(SimpleRateThrottle):
    """Rate limit clients by IP + scope."""

    scope = None

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class RegisterThrottle(_IPScopedThrottle):
    scope = "register"


class PasswordResetThrottle(_IPScopedThrottle):
    scope = "password_reset"


class ActivationResendThrottle(_IPScopedThrottle):
    scope = "activation_resend"
