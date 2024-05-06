from django.contrib.admin.views.autocomplete import JsonResponse
from django.db import models
from shared.validators import NickNameValidator


class Client(models.Model):
    font_size_choices = [(0, "0"), (1,"1"), (2, "2"),  (3, "3"), (4, "4"), (5,"5")]
    languages_choices = [(1, "fr"),  (2, "eng"), (3, "zh")]
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    id = models.BigAutoField(primary_key=True)
    nick = models.CharField(max_length=16, unique=True,
                    validators=[NickNameValidator])
    email = models.EmailField()
    friends = models.ManyToManyField('self', blank=True)
    contrast_mode = models.BooleanField(default=False)
    font = models.IntegerField(choices=font_size_choices, default=0)
    lang = models.IntegerField(choices=languages_choices, default=1)
    online = models.BooleanField(default=False)

    objects = models.Manager()

    def __str__(self):
        return f"""
                ${self.nick.__str__()}
                ${self.email.__str__()}
                ${self.id.__str__()}
                """

    def to_dict(self):
        return {
            "Id": self.id,
            "Nick": self.nick,
            "Email": self.email,
            "Friends": self.list_friends(),
        }

    def public_dict(self):
        return {
            "Id": self.id,
            "Nick": self.nick,
            "Pic": self.avatar.url if self.avatar else None,
        }

    def friends_dict(self):
        return {
            "Id": self.id,
            "Nick": self.nick,
            "Pic": self.avatar.url if self.avatar else None,
            "Online": self.online,
        }

    def personal_dict(self):
        return {
            "Id": self.id,
            "Nick": self.nick,
            "Email": self.email,
            "Lang": self.lang_state(),
            "Font": self.font,
            "Pic": self.avatar.url if self.avatar else "default",
            "Contrast-mode": self.contrast_mode,
            "Friends": self.list_friends(),
        }

    def lang_state(self):
        if self.lang == 1:
            return "fr"
        if self.lang == 2:
            return "eng"
        if self.lang == 3:
            return "zh"

    def list_friends(self):
        return [object.friends_dict()
                for object
                in self
                    .friends
                    .all()]

    def list_received_requests(self):
        return [object.sender.public_dict()
                for object
                in FriendshipRequest
                    .objects
                    .filter(receiver=self)]

    def list_sent_requests(self):
        return [object.receiver.public_dict()
                for object
                in FriendshipRequest
                    .objects
                    .filter(sender=self)]


class FriendshipRequest(models.Model):
    sender = models.ForeignKey(
        Client,
        related_name="request_sended",
        on_delete=models.CASCADE)
    receiver = models.ForeignKey(
        Client,
        related_name="request_receive",
        on_delete=models.CASCADE)
    objects = models.Manager

    def __str__(self):
        return f"""
                sender: ${self.sender.__str__()}
                receiver: ${self.receiver.__str__()}
                """

    def to_dict(self):
        return {
            "sender": [self.sender.nick, self.sender.id],
            "receiver": [self.receiver.nick, self.receiver.id],
        }

    @staticmethod
    def processRequest(sender, receiver) -> JsonResponse:
        if receiver in sender.friends.all():
            return JsonResponse({"Err": "friendship already established"}, status=400)

        redondantRequest = FriendshipRequest.objects.filter(
            sender=sender, receiver=receiver).first()
        if redondantRequest is not None:
            return JsonResponse({"Err": "redondant request"}, status=400)

        pastRequest = FriendshipRequest.objects.filter(
            sender=receiver, receiver=sender).first()
        if pastRequest is None:
            newRequest = FriendshipRequest.objects.create(
                sender=sender, receiver=receiver)
            newRequest.save()
            return JsonResponse({"Friendship": "requested"})

        pastRequest.delete()
        sender.friends.add(receiver)
        # Hermes
        return JsonResponse({"Friendship": "established"})

    @staticmethod
    def deleteFriendship(emiter, target) -> JsonResponse:

        if target in emiter.friends.all():
            emiter.friends.remove(target)
            return JsonResponse({"Friendship": "deleted"})

        oldRequest = FriendshipRequest.objects.filter(
            sender=emiter, receiver=target)
        if oldRequest is not None:
            oldRequest.delete()
            return JsonResponse({"Friendship": "aborted"})

        oldRequest = FriendshipRequest.objects.filter(
            sender=target, receiver=emiter)
        if oldRequest is not None:
            oldRequest.delete()
            return JsonResponse({"Friendship": "aborted"})

        return JsonResponse({"Err": "nothing to get deleted"}, status=404)
