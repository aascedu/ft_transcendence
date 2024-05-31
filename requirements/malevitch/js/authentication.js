async function jwt_management(jwt, refresh_token) {
  await sessionStorage.setItem(JWT_NAME, jwt);
  sessionStorage.setItem(REF_TOKEN_NAME, refresh_token);
  await init_session_socket();
  refreshLoop()
}
