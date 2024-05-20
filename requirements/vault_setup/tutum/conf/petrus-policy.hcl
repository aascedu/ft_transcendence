path "secret/data/petrus/petrus_db" {
  capabilities = [ "read" ]
}

path "secret/data/petrus/petrus_user" {
  capabilities = [ "read" ]
}

path "secret/data/petrus/petrus_password" {
  capabilities = [ "read" ]
}

path "secret/data/shared/*" {
  capabilities = [ "read" ]
}