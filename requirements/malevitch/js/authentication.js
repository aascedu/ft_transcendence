async function jwt_management() {
  await init_session_socket();
  refreshLoop()
}
async function get_socket_connection_token(path) {
    const response = await fetch_get(path + "connectionView/");
    return response.Key
}

