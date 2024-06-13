function debuging_global() {
    console.log("debuging")
    console.log("g_userId", g_userId);
    console.log("g_userNick", g_userNick);
    console.log("g_userPic", g_userPic);
    console.log("g_prevFontSize", g_prevFontSize);
    console.log("g_translations", g_translations);
    console.log("g_canvasHeight", g_canvasHeight);
    console.log("g_refreshInterval", g_refreshInterval);
    console.log("g_sessionSocket", g_sessionSocket);
    console.log("g_state", g_state);
}
function debuging_state() {
    debuging_global()
}

determine_state().then(() => {
    console.log('rendering');
    debuging_global();
    render(g_state);
});


