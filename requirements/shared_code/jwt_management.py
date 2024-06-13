from datetime import datetime, timedelta
from jwt import encode, decode
from .var import algo
try:
    from tokens.token import vault_token
except ModuleNotFoundError:
    print("Warn vault_token not found")

import hvac

class AuthenticationError(Exception):
    pass

class VaultInteractionError(Exception):
    pass

def get_ressource_from_vault(vault_token, path, ressource):
    try:
        print("get", ressource, "from vault at", path)
        client = hvac.Client(url='http://tutum:8200', token=vault_token)
        if not client.is_authenticated():
            raise AuthenticationError("Failed to authenticate with Vault")

        response = client.secrets.kv.v2.read_secret_version(path=path)
        ressource  = response['data']['data'][ressource]

        return ressource
    except Exception as e:
        raise VaultInteractionError("Error interacting with Vault") from e

class JWT:
    try:
        privateKey: str = get_ressource_from_vault(vault_token, 'shared/priv', 'private_key')
    except AuthenticationError:
        print("Failed to authenticate with Vault. Check your token.")
    except VaultInteractionError:
        print("Warning private_key : Ignore this warning if this service don't need the private key.")
    except Exception as e:
        print("An unexpected error occurred:", str(e))
    try:
        publicKey: str = get_ressource_from_vault(vault_token, 'shared/pub', 'public_key')
    except AuthenticationError:
        print("Failed to authenticate with Vault. Check your token.")
    except VaultInteractionError:
        print("Warning public_key: Error interacting with Vault. Please check Vault status.")
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
        return decode(token, key, algorithms=[JWT.algo])

    @staticmethod
    def jwtToPayloadNoExp(token: str, key: str):
        return decode(token, key, algorithms=[JWT.algo], options={'verify_exp': False})

    @staticmethod
    def peremptionDict() -> dict:
        peremption = datetime.utcnow() + JWT.expiration_acccess_token
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
