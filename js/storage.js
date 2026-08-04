// Manejo centralizado de LocalStorage (Jugadores y Sesiones)
const storage = {
    getPlayers() {
        return JSON.parse(localStorage.getItem('tt_players') || '[]');
    },
    savePlayer(player) {
        const players = this.getPlayers();
        players.push(player);
        localStorage.setItem('tt_players', JSON.stringify(players));
    },
    deletePlayer(playerId) {
        let players = this.getPlayers().filter(p => p.id !== playerId);
        localStorage.setItem('tt_players', JSON.stringify(players));
    },
    getSessions() {
        return JSON.parse(localStorage.getItem('tt_sessions') || '[]');
    },
    saveSession(session) {
        const sessions = this.getSessions();
        sessions.push(session);
        localStorage.setItem('tt_sessions', JSON.stringify(sessions));
    },
    deleteSession(sessionId) {
        let sessions = this.getSessions().filter(s => s.id !== sessionId);
        localStorage.setItem('tt_sessions', JSON.stringify(sessions));
    }
};