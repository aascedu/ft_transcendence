class User:
    nick: str
    error: str
    is_autenticated: bool
    is_admin: bool
    is_service: bool
    id: int

    def __init__(self, nick=None, error=None, is_admin=False, is_service=False, is_autenticated=False, id=None):
        self.nick = nick
        self.error = error
        self.is_autenticated = is_autenticated
        self.is_admin = is_admin
        self.is_service = is_service
        self.id = id


    def __str__(self):
        return f"{self.nick}, {self.id}, aut: {self.is_autenticated}, serv:{self.is_service}, admin:{self.is_admin}\n"

    def toDict(self):
        return {
            'nick': self.nick,
            'error': self.error,
            'id': self.id,
        }

    @staticmethod
    def header_to_user(header):
        try:
            host = header['Host']
        except KeyError:
            print("Error: Internal request badly Formated 'Service_Name' key misses")
            return User(error="Bad Internal request : 'Service_Name' key missing")
        return User(nick=host.split(':')[0], is_service=True)


