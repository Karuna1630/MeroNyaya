from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custome_response = {
            "Status Code": response.status_code,
            "Is Success": False,
            "ErrorMessage": {},
            "Result": None,
        }
        if isinstance(response.data, dict):
          error_dict = {}
          for key, value in response.data.items():
             if isinstance(value, list) and value:
                error_dict[key] = "".join([str(v) for v in value])
             else:
                error_dict[key] = str(value)

          custome_response["ErrorMessage"] = error_dict
        return Response(custome_response, status=response.status_code)
    
    return Response(
       {
          "Status Code": status.HTTP_500_INTERNAL_SERVER_ERROR,
          "Is Success": False,
          "ErrorMessage": "Internal server error.",
          "Result": None,
           
       },
         status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )    