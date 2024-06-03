from logging import info, debug, warn, error

def logging_django(request, response, logging_function):
    log = {}
    if request is not None:
        log |= {'request': request_to_dict(request)}
    if response is not None:
        log |= {'response' : response_to_dict(response)}
    message = log['response'].get('Err', None)
    if message is not None:
        log |= {'message' : message}
    logging_function(str(log))


def request_to_dict(request):
    method = request.method
    path = request.path_info
    query_string = request.META.get('QUERY_STRING', '')
    remote_addr = request.META.get('REMOTE_ADDR', '')
    ip_client = request.META.get('HTTP_X_FORWARDED_FOR', '')
    if ip_client != '':
        ip_client = ip_client.split(',')[0]
    else:
        ip_client = remote_addr
    return {
        'method': method,
        'path': path,
        'query_string': query_string,
        'remote_addr': remote_addr,
        'ip_client': ip_client,
    }

def response_to_dict(response):
    response_body = response.content.decode('utf-8')
    status_code = response.status_code
    return {
        'status_code': status_code,
        'response_body': response_body if status_code != 500 else "FATAL ERROR"
    }

def log_info(request, response):
    logging_django(request, message, response, info)

def log_warn(request, response):
    logging_django(request, message, response, warn)

def log_debug(request, response):
    logging_django(request, message, response, debug)

def log_error(request, response):
    logging_django(request, message, response, error)
