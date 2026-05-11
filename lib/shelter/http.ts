export async function leaveGuild(guildId: string): Promise<void> {
  await shelter.http.ready;
  await shelter.http.del?.({
    url: `/users/@me/guilds/${guildId}`,
    body: JSON.stringify({ lurking: false }),
    oldFormErrors: false,
  });
}
