/**
 * Utility functions to determine game type/engine
 */

/**
 * Determines if a game type is GoldSource based on its name
 * GoldSource games include: Half-Life, Counter-Strike 1.6, Day of Defeat, Team Fortress Classic, etc.
 */
export function isGoldSourceGame(gameTypeName: string): boolean {
	const nameLower = gameTypeName.toLowerCase().trim();

	// List of known GoldSource games
	const goldSourceGames = [
		'half-life',
		'hl',
		'counter-strike',
		'cs 1.6',
		'cs16',
		'cs',
		'day of defeat',
		'dod',
		'team fortress classic',
		'tfc',
		'deathmatch classic',
		'opposing force',
		'blue shift',
		'ricochet',
		'gunman chronicles',
	];

	// Check if name matches any known GoldSource game
	return goldSourceGames.some((game) => nameLower.includes(game));
}

/**
 * Determines if a game type is Minecraft
 */
export function isMinecraftGame(gameTypeName: string): boolean {
	const nameLower = gameTypeName.toLowerCase().trim();

	return (
		nameLower === 'minecraft' ||
		nameLower === 'mincecraft' || // typo in data
		nameLower === 'mc' ||
		nameLower.includes('minecraft') ||
		nameLower.includes('mincecraft') // typo in data
	);
}
