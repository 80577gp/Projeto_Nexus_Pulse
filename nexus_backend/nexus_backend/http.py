"""
HTTP compatibility helpers.

Uses requests when available and falls back to urllib for basic GET/POST JSON
interactions required by this project.
"""

import json
from urllib import error, parse, request

try:
    import requests as real_requests

    requests = real_requests
except ImportError:
    class HTTPError(Exception):
        """Fallback HTTP error compatible with requests.HTTPError usage."""

        def __init__(self, message, response=None):
            super().__init__(message)
            self.response = response

    class Response:
        """Minimal response object exposing the subset used in the project."""

        def __init__(self, status_code, content):
            self.status_code = status_code
            self._content = content

        def json(self):
            if not self._content:
                return {}
            return json.loads(self._content.decode("utf-8"))

        def raise_for_status(self):
            if self.status_code >= 400:
                raise HTTPError(f"HTTP {self.status_code}", response=self)

    class RequestsCompat:
        HTTPError = HTTPError

        @staticmethod
        def _make_url(url, params=None):
            if not params:
                return url
            query = parse.urlencode(params)
            joiner = "&" if "?" in url else "?"
            return f"{url}{joiner}{query}"

        @staticmethod
        def get(url, headers=None, params=None, timeout=20):
            req = request.Request(
                RequestsCompat._make_url(url, params=params),
                headers=headers or {},
                method="GET",
            )
            try:
                with request.urlopen(req, timeout=timeout) as response:
                    return Response(response.status, response.read())
            except error.HTTPError as exc:
                return Response(exc.code, exc.read())

        @staticmethod
        def post(url, data=None, headers=None, timeout=20):
            encoded = None
            request_headers = headers or {}
            if data is not None:
                encoded = parse.urlencode(data).encode("utf-8")
                request_headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
            req = request.Request(url, data=encoded, headers=request_headers, method="POST")
            try:
                with request.urlopen(req, timeout=timeout) as response:
                    return Response(response.status, response.read())
            except error.HTTPError as exc:
                return Response(exc.code, exc.read())

    requests = RequestsCompat()

