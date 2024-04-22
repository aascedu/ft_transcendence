from collections.abc import KeysView


class User:
    nick: str
    error: str
    is_autenticated: bool
    is_admin: bool
    is_service: bool
    id: int

    def __init__(self, nick='', error='', is_admin=False, is_service=False, is_autenticated=False, id=-1):
        self.nick = nick
        self.error = error
        self.is_autenticated = is_autenticated
        self.is_admin = False
        self.is_service = False
        self.id = id


    def __str__(self):
        return f"{self.nick}, {self.id}, {self.is_autenticated}\n"

    def toDict(self):
        return {
            'nick': self.nick,
            'error': self.error,
            'id': self.id,
        }

    @staticmethod
    def header_to_user(header):
        try:
            return User(nick=header['Service_Name'], is_service=True)
        except KeyError:
            print("Error: Internal request badly Formated 'Service_Name' key misses")
            return User(error="Bad Internal request : 'Service_Name' key missing")


