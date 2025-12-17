from rest_framework import Response
from rest_framework import status

def api_response(
        result=None,
        is_success=True,
        error_message=None,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
):
    return Response(
        {
            "Status Code": status_code,
            "IsSuccess": is_success,
            "ErrorMessage": error_message if error_message else[],
            "Result": result,
        },
        status=status_code,
    )
