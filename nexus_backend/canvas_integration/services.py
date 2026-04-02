"""
Service layer for Canvas LMS integration.

This module centralizes OAuth2 flows and Canvas API requests so views and tasks
can reuse the same logic.
"""

from urllib.parse import urlencode

from nexus_backend.http import requests


class CanvasService:
    """
    Service object responsible for Canvas OAuth2 and API interactions.

    The service can be instantiated with a dynamic Canvas base URL and an
    optional access token for authenticated API requests.
    """

    def __init__(self, canvas_base_url, access_token=None, timeout=20):
        self.canvas_base_url = canvas_base_url.rstrip("/")
        self.access_token = access_token
        self.timeout = timeout

    def get_authorization_url(self, redirect_uri, client_id):
        """
        Build the Canvas OAuth2 authorization URL.

        Returns the full URL that the frontend can use to redirect the user to
        the Canvas authorization page.
        """

        query = urlencode(
            {
                "client_id": client_id,
                "response_type": "code",
                "redirect_uri": redirect_uri,
            }
        )
        return f"{self.canvas_base_url}/login/oauth2/auth?{query}"

    def exchange_code_for_tokens(self, code, redirect_uri, client_id, client_secret):
        """
        Exchange an authorization code for Canvas access and refresh tokens.

        Raises requests exceptions when Canvas returns an error response.
        """

        response = requests.post(
            f"{self.canvas_base_url}/login/oauth2/token",
            data={
                "grant_type": "authorization_code",
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "code": code,
            },
            timeout=self.timeout,
        )
        response.raise_for_status()
        return response.json()

    def refresh_access_token(self, refresh_token, client_id, client_secret):
        """
        Refresh the Canvas access token using a valid refresh token.

        Returns the JSON payload from Canvas containing the new token data.
        """

        response = requests.post(
            f"{self.canvas_base_url}/login/oauth2/token",
            data={
                "grant_type": "refresh_token",
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
            },
            timeout=self.timeout,
        )
        response.raise_for_status()
        token_data = response.json()
        self.access_token = token_data.get("access_token", self.access_token)
        return token_data

    def get_user_profile(self):
        """Fetch the authenticated user's Canvas profile."""
        return self._get("users/self/profile")

    def get_courses(self):
        """Fetch all courses visible to the authenticated user."""
        return self._get("courses")

    def get_assignments(self, course_id):
        """Fetch assignments for a specific Canvas course."""
        return self._get(f"courses/{course_id}/assignments")

    def get_grades(self, course_id, assignment_id):
        """
        Fetch grade or submission data for a specific assignment.

        This method uses the current user's submission endpoint for the selected
        assignment.
        """

        return self._get(
            f"courses/{course_id}/assignments/{assignment_id}/submissions/self"
        )

    def _get(self, endpoint, params=None):
        """
        Perform an authenticated GET request to the Canvas API.

        Raises:
        - ValueError if no access token is configured
        - requests.HTTPError for non-successful responses
        """

        if not self.access_token:
            raise ValueError("An access token is required for Canvas API requests.")

        response = requests.get(
            f"{self.canvas_base_url}/api/v1/{endpoint.lstrip('/')}",
            headers={"Authorization": f"Bearer {self.access_token}"},
            params=params or {},
            timeout=self.timeout,
        )

        if response.status_code == 401:
            raise requests.HTTPError(
                "Canvas access token expired or unauthorized.",
                response=response,
            )

        response.raise_for_status()
        return response.json()
