import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';

interface ApiResponseItem {
  status: number;
  description?: string;
  type?: any;
}

export function ApiResponses(responses: ApiResponseItem[]) {
  const decorators = responses.map(({ status, description, type }) => {
    const baseOptions : any = {description};
    if(type)
      baseOptions.type = type;

    switch (status) {
      case 400:
        return ApiBadRequestResponse({ description });
      case 401:
        return ApiUnauthorizedResponse({ description });
      case 403:
        return ApiForbiddenResponse({ description });
      case 404:
        return ApiNotFoundResponse({ description });
      case 500:
        return ApiInternalServerErrorResponse({ description });
      default:
        return ApiResponse({ status, ...baseOptions });
    }
  });

  return applyDecorators(...decorators);
}
