function debuging_global() {
console.log(g_userId);
console.log(g_userNick);
console.log(g_userPic);
console.log(g_prevFontSize);
console.log(g_translations);
console.log(g_canvasHeight);
console.log(g_refreshInterval);
console.log(g_sessionSocket);
console.log(g_state);
}

determine_state().then(() => {
    console.log('rendering');
    debuging_global();
    render(g_state);
});


