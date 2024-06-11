from django.db import models
from django.core.exceptions import ValidationError
from shared.validators import NickNameValidator
import re


class Client(models.Model):
    id = models.BigAutoField(primary_key=True)
    email: str
    nick: str
    password: str
    hashed_password = models.CharField(
            max_length=128,
    )

    objects = models.Manager()

    def __init__(self, *args, **kwargs):
        super(Client, self).__init__(*args, **kwargs)

    def to_alfred(self):
        return {
            "mail": self.email,
            "nick": self.nick,
            "id": self.id,
        }

    def to_mnemosine(self):
        return {
                "Id": self.id
        }

    def to_dict(self):
        return {
            "id": self.id,
        }

    def toDict(self):
        return {
            "id": self.id,
        }

    def __str__(self) -> str:
        return (f"""
                firstName : ${self.email}
                lastName : ${self.nick}
                """)

    def check_password(self):
        if len(self.password) < 8:
            raise ValidationError("Password too short")
        if not re.search(r'[A-Z]', self.password):
            raise ValidationError("Password must contain at least one uppercase char")
        if not re.search(r'[a-z]', self.password):
            raise ValidationError("Password must contain at least one lowercase char")
        if not re.search(r'\d', self.password):
            raise ValidationError("Password must contain a digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>+=-_]', self.password):
            raise ValidationError("Password must contain special char")
