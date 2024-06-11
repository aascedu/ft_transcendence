from django.core.validators import FileExtensionValidator
from django.db import models
import requests
from shared.utils import JsonBadRequest
from shared.utils import JsonResponseLogging as JsonResponse
from shared.validators import NickNameValidator


class Client(models.Model):
    font_size_choices = [(0, "0"), (1,"1"), (2, "2"),  (3, "3"), (4, "4"), (5,"5")]
    languages_choices = [(1, "fr"),  (2, "en"), (3, "zh")]
    avatar = models.ImageField(upload_to='avatars/', blank=True,
                    validators=[
                        FileExtensionValidator(['png', 'jpg', 'jpeg'])
                    ]
    )
    id = models.BigAutoField(primary_key=True)
    nick = models.CharField(max_length=16, unique=True,
                    validators=[NickNameValidator])
    email = models.EmailField()
    friends = models.ManyToManyField('self', blank=True)
    contrast_mode = models.BooleanField(default=False)
    font = models.IntegerField(choices=font_size_choices, default=0)
    lang = models.IntegerField(choices=languages_choices, default=1)

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
            "Pic": name_to_path(self.avatar.url.split('/')[-1]) if self.avatar else None,
        }

    def friends_dict(self):
        return {
            "Id": self.id,
            "Nick": self.nick,
            "Pic": name_to_path(self.avatar.url.split('/')[-1]) if self.avatar else None,
        }

    def personal_dict(self):
        return {
            "Id": self.id,
            "Nick": self.nick,
            "Email": self.email,
            "Lang": self.lang_state(),
            "Font": self.font,
            "Pic": name_to_path(self.avatar.url.split('/')[-1]) if self.avatar else None,
            "Contrast-mode": self.contrast_mode,
            "Friends": self.list_friends(),
        }

    def lang_state(self):
        if self.lang == 1:
            return "fr"
        if self.lang == 2:
            return "en"
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

    @staticmethod
    def get_by_email(email):
        return Client.objects.filter(email=email).first()

    @staticmethod
    def get_by_nick(nick):
        return Client.objects.filter(nick=nick).first()

def name_to_path(name):
    return "/alfred/user/media/" + name + '/'


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
    def processRequest(request, sender, receiver):
        if receiver in sender.friends.all():
            return JsonResponse(request, {"Err": "friendship already established"}, status=400)

        redondantRequest = FriendshipRequest.objects.filter(
            sender=sender, receiver=receiver).first()
        if redondantRequest is not None:
            return JsonBadRequest(request, "redondant request")

        pastRequest = FriendshipRequest.objects.filter(
            sender=receiver, receiver=sender).first()
        if pastRequest is None:
            requests.post(f'http://hermes:8004/notif/friend-request/{sender.id}/',
                          json={"Notified": receiver.id})
            newRequest = FriendshipRequest.objects.create(
                sender=sender, receiver=receiver)
            newRequest.save()
            return JsonResponse(request, {"Friendship": "requested"})

        pastRequest.delete()
        sender.friends.add(receiver)
        requests.post(f'http://hermes:8004/notif/friendship/{sender.id}/',
                      json={"Notified": receiver.id})
        return JsonResponse(request, {"Friendship": "established"})

    @staticmethod
    def deleteFriendship(request, emiter, target):
        if target in emiter.friends.all():
            try:
                requests.post(f'http://hermes:8004/notif/delete-friend/{emiter.id}/',
                              json={"Notified": target.id})
            except BaseException:
                pass
            emiter.friends.remove(target)
            return JsonResponse(request, {"Friendship": "deleted"})

        oldRequest = FriendshipRequest.objects.filter(
            sender=emiter, receiver=target).first()
        if oldRequest is not None:
            try:
                requests.post(f'http://hermes:8004/notif/delete-friend-request/{emiter.id}/',
                              json={"Notified": target.id})
            except BaseException:
                pass
            oldRequest.delete()
            return JsonResponse(request, {"Friendship": "aborted 1"})

        oldRequest = FriendshipRequest.objects.filter(
            sender=target, receiver=emiter).first()
        if oldRequest is not None:
            try:
                requests.post(f'http://hermes:8004/notif/delete-friend-request/{emiter.id}/',
                          json={"Notified": target.id})
            except BaseException:
                pass
            oldRequest.delete()
            return JsonResponse(request, {"Friendship": "aborted 2"})

        return JsonResponse(request, {"Err": "nothing to get deleted"}, status=404)
