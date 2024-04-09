from datetime import datetime, timedelta
from jwt import encode, decode

import hvac

vault_token = ""

from tokens.shared_token  import vault_token
from .var import algo, public_key, private_key

class AuthenticationError(Exception):
    pass

class VaultInteractionError(Exception):
    pass

def get_key_from_vault(vault_token):
    try:
        print(vault_token)
        client = hvac.Client(url='http://tutum:8200', token=vault_token)
        if not client.is_authenticated():
            raise AuthenticationError("Failed to authenticate with Vault")

        priv_response = client.secrets.kv.v2.read_secret_version(path='shared/priv')
        pub_response = client.secrets.kv.v2.read_secret_version(path='shared/pub')
        publicKey = pub_response['data']['data']['public_key']
        privateKey = priv_response['data']['data']['private_key']

        return publicKey, privateKey
    except Exception as e:
        raise VaultInteractionError("Error interacting with Vault") from e

class JWT:
    publicKey: str = public_key
    privateKey: str = private_key
    print("vault_token" ,vault_token)
    try:
        publicKey, privateKey = get_key_from_vault(vault_token)
    except AuthenticationError:
        print("Failed to authenticate with Vault. Check your token.")
    except VaultInteractionError:
        print("Error interacting with Vault. Please check Vault status.")
    except Exception as e:
        print("An unexpected error occurred:", str(e))
    algo = algo
    expiration_acccess_token = timedelta(minutes=15)
    expiration_refresh_token = timedelta(days=1)

    @staticmethod
    def payloadToJwt(payload: dict, key: str):
        """
        TODO : mettre les key dans l'env
        key is the str :
            -- access -> JWT.privateKey
            -- refresh -> JWT.refreshPublicKey
        Return True and the token | False and the error
        """
        return encode(payload, key, algorithm=JWT.algo)

    @staticmethod
    def jwtToPayload(token: str, key: str):
        """
        token is the jwt
        TODO : mettre les key dans l'env
        key is the str :
            -- access -> JWT.publicKey
            -- refresh -> JWT.refreshPublicKey
        Return True and the payload | False and the error
        """
        return decode(token, key, algorithms=[JWT.algo])

    @staticmethod
    def peremptionDict() -> dict:
        peremption = datetime.utcnow() + timedelta(minutes=15)
        return {'exp': peremption}

    @staticmethod
    def verifJWT(str, key) -> str | dict:
        content = JWT.jwtToPayload(str, key)
        if isinstance(content, dict):
            del content['peremption']
            return content
        return content

    @staticmethod
    def toPayload(object) -> dict:
        return object.toDict() | JWT.peremptionDict()

    @staticmethod
    def objectToAccessToken(object):
        return JWT.payloadToJwt(JWT.toPayload(object), JWT.privateKey)

    @staticmethod
    def objectToRefreshToken(object):
        return JWT.payloadToJwt(object.toDict() | {'exp': (datetime.utcnow() + timedelta(days=1))}, JWT.privateKey)
