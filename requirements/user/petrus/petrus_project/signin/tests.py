from django.test import TestCase

from signin.models import Client

# Create your tests here.

class testModelInsertion(TestCase):
    def testCreateClient(self):
        test = Client(
                "a@oui.fr",
                "a",
                "pass",
                "ab",
                "last")


        self.assertTrue(1 == 1)

from django.core.exceptions import ValidationError
from .models import Client

class ClientModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        Client.objects.create(email='test@example.com', password='TestPassword123!', nick='testNick')

    def test_email_label(self):
        client = Client.objects.get(id=1)
        field_label = client._meta.get_field('email').verbose_name
        self.assertEqual(field_label, 'email')

    def test_nick_label(self):
        client = Client.objects.get(id=1)
        field_label = client._meta.get_field('nick').verbose_name
        self.assertEqual(field_label, 'nick')

    def test_object_name_is_email(self):
        client = Client.objects.get(id=1)
        expected_object_name = f'{client.email}'
        self.assertEqual(expected_object_name, str(client))

    def test_check_password(self):
        client = Client.objects.get(id=1)
        with self.assertRaises(ValidationError):
            client.password = 'short'
            client.check_password()
        with self.assertRaises(ValidationError):
            client.password = 'noUpperCase'
            client.check_password()
        with self.assertRaises(ValidationError):
            client.password = 'noLowerCase'
            client.check_password()
        with self.assertRaises(ValidationError):
            client.password = 'noSpecialChar'
            client.check_password()
        with self.assertRaises(ValidationError):
            client.password = 'noDigit'
            client.check_password()
        # Test a valid password
        try:
            client.password = 'ValidPassword123!'
            client.check_password()
        except ValidationError:
            self.fail('Valid password raised ValidationError')
